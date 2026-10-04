/* Generates a realistic ~3 months of history so charts aren't empty on first run. */

import { DEFAULT_EXERCISES } from './exercises';
import { DEFAULT_ROUTINES } from './routines';
import { uid, addDays, toISODate } from '../utils/format';

const BASE_WEIGHT = {
  barbell: { legs: 72, back: 70, chest: 55, shoulders: 35, biceps: 30, triceps: 32, glutes: 62, fullbody: 40 },
  dumbbell: { chest: 22, shoulders: 12, back: 24, biceps: 12, triceps: 10, legs: 16, glutes: 18, core: 8, fullbody: 14 },
  machine: { legs: 65, back: 55, chest: 42, shoulders: 25, glutes: 38, core: 28, cardio: 0, fullbody: 30 },
  cable: { back: 38, chest: 14, shoulders: 8, biceps: 16, triceps: 16, glutes: 20, legs: 20 },
  bodyweight: { chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, legs: 0, glutes: 0, core: 0, fullbody: 0, cardio: 0 },
  kettlebell: { fullbody: 20, legs: 20, back: 20, shoulders: 12 },
  band: { shoulders: 0, glutes: 0, back: 0, chest: 0 },
  other: { core: 6, cardio: 0, fullbody: 0 },
};

const baseWeightFor = (exercise) => {
  const byEquipment = BASE_WEIGHT[exercise.equipment] || BASE_WEIGHT.other;
  const value = byEquipment[exercise.muscle];
  return value === undefined ? 20 : value;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const jitter = (spread) => (Math.random() - 0.5) * 2 * spread;

const buildEntry = (exercise, weekIndex) => {
  const base = baseWeightFor(exercise);
  // ~1.5 % progressive overload per week with a bit of noise.
  const progression = 1 + 0.015 * weekIndex;
  const setCount = exercise.type === 'time' ? 1 : pick([3, 3, 4, 4]);

  const sets = [];
  for (let i = 0; i < setCount; i += 1) {
    if (exercise.type === 'time') {
      sets.push({
        id: uid(),
        reps: 0,
        seconds: 300 + Math.round(Math.random() * 600),
        weight: 0,
        done: true,
      });
      continue;
    }

    const isStrength = exercise.type === 'strength';
    const reps = isStrength
      ? Math.max(5, Math.round(10 - i * 0.8 + jitter(1.2)))
      : Math.max(6, Math.round(15 - i + jitter(2)));

    let weight = isStrength ? base * progression + jitter(2.5) : 0;
    // Optional loaded bodyweight work (dips, pull-ups) later in the block.
    if (!isStrength && base === 0 && weekIndex > 6 && exercise.muscle !== 'core') {
      weight = Math.random() > 0.5 ? 5 + Math.round(Math.random() * 10) : 0;
    }
    weight = Math.max(0, Math.round(weight * 2) / 2);

    sets.push({ id: uid(), reps, seconds: 0, weight, done: true });
  }

  return { id: uid(), exerciseId: exercise.id, name: exercise.name, sets };
};

/**
 * @param {object} options
 * @param {number} options.weeks  how many weeks back to fill
 * @param {number} options.perWeek  sessions per week
 */
export const generateDemoData = ({ weeks = 12, perWeek = 4 } = {}) => {
  const byId = new Map(DEFAULT_EXERCISES.map((e) => [e.id, e]));
  const workouts = [];
  const today = new Date();

  for (let week = weeks - 1; week >= 0; week -= 1) {
    // Skip a week now and then — life happens.
    if (week > 2 && Math.random() < 0.12) continue;

    const days = [0, 1, 2, 3, 4, 5, 6]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(2, perWeek - Math.round(Math.random() * 1.5)))
      .sort((a, b) => a - b);

    days.forEach((dayIndex, sessionIndex) => {
      const date = addDays(today, -(week * 7) - (6 - dayIndex));
      if (date > today) return;

      const routine = DEFAULT_ROUTINES[(week + sessionIndex) % DEFAULT_ROUTINES.length];
      const exercises = routine.exercises
        .map((id) => byId.get(id))
        .filter(Boolean)
        // Occasionally drop an exercise to keep it organic.
        .filter(() => Math.random() > 0.12)
        .map((exercise) => buildEntry(exercise, weeks - week));

      if (!exercises.length) return;

      const durationSec = 2100 + Math.round(Math.random() * 2400);
      workouts.push({
        id: uid(),
        name: routine.name,
        date: toISODate(date),
        startedAt: date.toISOString(),
        finishedAt: date.toISOString(),
        durationSec,
        notes: '',
        exercises,
      });
    });
  }

  const bodyweights = [];
  let weight = 78.5;
  for (let week = weeks - 1; week >= 0; week -= 1) {
    weight -= 0.12 + jitter(0.25);
    bodyweights.push({
      id: uid(),
      date: toISODate(addDays(today, -week * 7)),
      weight: Math.round(weight * 10) / 10,
    });
  }

  return { workouts, bodyweights };
};
