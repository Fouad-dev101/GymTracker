/* Derived metrics computed from the workout history. Pure functions only. */

import { addDays, startOfWeek, toISODate, diffInDays } from './format';

/* ── Volume / sets ─────────────────────────────────────────── */

/** A set counts as logged once it is ticked or any value has been typed. */
export const isLoggedSet = (set = {}) =>
  Boolean(set.done) ||
  Number(set.reps) > 0 ||
  Number(set.seconds) > 0 ||
  Number(set.weight) > 0;

/** Volume of a single set, in kg (0 when no external load). */
export const setVolume = (set = {}) => {
  const weight = Number(set.weight) || 0;
  const reps = Number(set.reps) || 0;
  return weight * reps;
};

export const entryVolume = (entry = {}) =>
  (entry.sets || []).reduce((total, set) => total + (isLoggedSet(set) ? setVolume(set) : 0), 0);

export const workoutVolume = (workout = {}) =>
  (workout.exercises || []).reduce((total, entry) => total + entryVolume(entry), 0);

export const workoutSetCount = (workout = {}) =>
  (workout.exercises || []).reduce((total, entry) => total + (entry.sets || []).length, 0);

export const workoutRepCount = (workout = {}) =>
  (workout.exercises || []).reduce(
    (total, entry) =>
      total +
      (entry.sets || []).reduce((sum, set) => sum + (Number(set.reps) || 0), 0),
    0
  );

/* ── Strength estimates ────────────────────────────────────── */

/** Epley formula. Returns 0 for sets without load. */
export const estimated1RM = (set = {}) => {
  const weight = Number(set.weight) || 0;
  const reps = Number(set.reps) || 0;
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

/** Best set ever logged for an exercise. */
export const bestSetFor = (workouts, exerciseId) => {
  let best = null;
  workouts.forEach((workout) => {
    (workout.exercises || []).forEach((entry) => {
      if (entry.exerciseId !== exerciseId) return;
      (entry.sets || []).forEach((set) => {
        if (set.done === false) return;
        const e1rm = estimated1RM(set);
        if (!best || e1rm > best.e1rm || (e1rm === best.e1rm && (Number(set.weight) || 0) > best.weight)) {
          best = { ...set, e1rm, date: workout.date, workoutId: workout.id };
        }
      });
    });
  });
  return best;
};

/** Most recent non-empty entry for an exercise (used to pre-fill sets). */
export const lastEntryFor = (workouts, exerciseId) => {
  for (let i = workouts.length - 1; i >= 0; i -= 1) {
    const entry = (workouts[i].exercises || []).find(
      (e) => e.exerciseId === exerciseId && (e.sets || []).length > 0
    );
    if (entry) return { entry, date: workouts[i].date, workoutId: workouts[i].id };
  }
  return null;
};

export const timesUsed = (workouts, exerciseId) =>
  workouts.reduce(
    (count, w) =>
      count + (w.exercises || []).filter((e) => e.exerciseId === exerciseId).length,
    0
  );

/* ── Personal records ──────────────────────────────────────── */

export const personalRecords = (workouts, exercises) =>
  exercises
    .map((exercise) => {
      const best = bestSetFor(workouts, exercise.id);
      if (!best || !best.e1rm) return null;
      return {
        exerciseId: exercise.id,
        name: exercise.name,
        muscle: exercise.muscle,
        type: exercise.type,
        weight: best.weight,
        reps: best.reps,
        e1rm: best.e1rm,
        date: best.date,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.e1rm - a.e1rm);

/* ── Aggregations over time ────────────────────────────────── */

/** Volume + session count per week, oldest → newest. */
export const weeklyVolume = (workouts, weeks = 12) => {
  const buckets = new Map();
  const thisWeek = startOfWeek(new Date());

  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = addDays(thisWeek, -7 * i);
    buckets.set(toISODate(start), { date: toISODate(start), start, volume: 0, count: 0 });
  }

  workouts.forEach((workout) => {
    const key = toISODate(startOfWeek(workout.date));
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.volume += workoutVolume(workout);
    bucket.count += 1;
  });

  return [...buckets.values()];
};

/** Series of { date, value } for one exercise (best estimated 1RM per session). */
export const exerciseHistory = (workouts, exerciseId) =>
  workouts
    .map((workout) => {
      const entry = (workout.exercises || []).find((e) => e.exerciseId === exerciseId);
      if (!entry || !(entry.sets || []).length) return null;
      const bestEntrySet = (entry.sets || [])
        .filter((s) => s.done !== false)
        .reduce(
          (best, set) => {
            const e1rm = estimated1RM(set);
            return !best || e1rm > best.e1rm ? { ...set, e1rm } : best;
          },
          null
        );
      if (!bestEntrySet || !bestEntrySet.e1rm) return null;
      return {
        date: workout.date,
        workoutId: workout.id,
        weight: bestEntrySet.weight,
        reps: bestEntrySet.reps,
        e1rm: bestEntrySet.e1rm,
        volume: entryVolume(entry),
      };
    })
    .filter(Boolean);

/** Sets per muscle group over a period (default: last 30 days). */
export const muscleBalance = (workouts, exercises, days = 30) => {
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const counts = new Map();

  workouts.forEach((workout) => {
    if (diffInDays(new Date(), workout.date) > days) return;
    (workout.exercises || []).forEach((entry) => {
      const exercise = byId.get(entry.exerciseId);
      const key = exercise ? exercise.muscle : 'other';
      const current = counts.get(key) || { key, sets: 0, volume: 0 };
      current.sets += (entry.sets || []).length;
      current.volume += entryVolume(entry);
      counts.set(key, current);
    });
  });

  return [...counts.values()].sort((a, b) => b.sets - a.sets);
};

/* ── Streak & totals ───────────────────────────────────────── */

export const sortedWorkouts = (workouts) =>
  [...workouts].sort((a, b) => String(b.date).localeCompare(String(a.date)));

/** Consecutive days with at least one session, counting back from today. */
export const currentStreak = (workouts) => {
  const days = new Set(workouts.map((w) => String(w.date).slice(0, 10)));
  const today = new Date();
  let streak = 0;
  let cursor = new Date(today);

  if (!days.has(toISODate(cursor))) {
    cursor = addDays(cursor, -1); // allow "today not trained yet"
    if (!days.has(toISODate(cursor))) return 0;
  }

  while (days.has(toISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
};

export const longestStreak = (workouts) => {
  const days = [...new Set(workouts.map((w) => String(w.date).slice(0, 10)))].sort();
  let best = 0;
  let run = 0;
  let previous = null;
  days.forEach((day) => {
    run = previous && diffInDays(day, previous) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  });
  return best;
};

export const totalStats = (workouts) => ({
  workouts: workouts.length,
  volume: workouts.reduce((total, w) => total + workoutVolume(w), 0),
  sets: workouts.reduce((total, w) => total + workoutSetCount(w), 0),
  reps: workouts.reduce((total, w) => total + workoutRepCount(w), 0),
  minutes: Math.round(
    workouts.reduce((total, w) => total + (Number(w.durationSec) || 0), 0) / 60
  ),
});

export const workoutsThisWeek = (workouts) => {
  const weekKey = toISODate(startOfWeek(new Date()));
  return workouts.filter((w) => toISODate(startOfWeek(w.date)) === weekKey).length;
};

/** Group workouts by month, newest first: [{ key, label, items }] */
export const groupByMonth = (workouts) => {
  const groups = new Map();
  sortedWorkouts(workouts).forEach((workout) => {
    const key = String(workout.date).slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(workout);
  });
  return [...groups.entries()].map(([key, items]) => ({ key, items }));
};
