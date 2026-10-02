const pad = (n) => String(n).padStart(2, "0");

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export const todayISO = () => toISO(new Date());

// "2026-10-01" -> local Date (avoids the UTC off-by-one of new Date("2026-10-01"))
export const parseDate = (iso) => new Date(`${iso}T00:00:00`);

export function weekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return d;
}

export const workoutSets = (w) => w.exercises.reduce((n, ex) => n + ex.sets.length, 0);

export const workoutVolume = (w) =>
  w.exercises.reduce((t, ex) => t + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);

export const sortByDateDesc = (workouts) =>
  [...workouts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));

export function workoutsThisWeek(workouts) {
  const start = weekStart(new Date());
  return workouts.filter((w) => parseDate(w.date) >= start);
}

/** Total volume per week for the last `n` weeks, oldest first. */
export function weeklyVolumes(workouts, n = 8) {
  const thisWeek = weekStart(new Date());
  const weeks = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(thisWeek);
    start.setDate(start.getDate() - i * 7);
    weeks.push({ start, label: `${start.getDate()}/${start.getMonth() + 1}`, value: 0 });
  }
  workouts.forEach((w) => {
    const ws = weekStart(parseDate(w.date)).getTime();
    const bucket = weeks.find((x) => x.start.getTime() === ws);
    if (bucket) bucket.value += workoutVolume(w);
  });
  return weeks;
}

export function loggedExerciseNames(workouts) {
  const names = new Set();
  workouts.forEach((w) => w.exercises.forEach((ex) => names.add(ex.name)));
  return [...names].sort();
}

/** One entry per workout containing the exercise, oldest first. */
export function exerciseHistory(workouts, name) {
  return [...workouts]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id))
    .flatMap((w) => {
      const ex = w.exercises.find((e) => e.name === name);
      if (!ex || ex.sets.length === 0) return [];
      const topWeight = Math.max(...ex.sets.map((s) => s.weight));
      const e1rm = Math.max(...ex.sets.map((s) => s.weight * (1 + s.reps / 30)));
      const volume = ex.sets.reduce((t, s) => t + s.weight * s.reps, 0);
      return [{ date: w.date, topWeight, e1rm: Math.round(e1rm * 10) / 10, volume }];
    });
}

export const formatDate = (iso, opts = { weekday: "short", day: "numeric", month: "short" }) =>
  parseDate(iso).toLocaleDateString(undefined, opts);
