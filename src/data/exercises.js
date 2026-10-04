/**
 * Exercise library shipped with the app.
 *
 * Each exercise:
 *  - id       : stable slug (custom exercises get a generated id)
 *  - name     : display name
 *  - muscle   : muscle group key (see MUSCLES)
 *  - type     : 'strength' (reps + weight) | 'bodyweight' (reps + optional load)
 *               | 'time' (duration in seconds + optional load)
 *  - equipment: equipment key (see EQUIPMENT)
 *  - custom   : true when created by the user (editable / deletable)
 */

export const MUSCLES = [
  { key: 'chest', label: 'Pectoraux', emoji: '🫀', color: '#ef4444' },
  { key: 'back', label: 'Dos', emoji: '🔙', color: '#3b82f6' },
  { key: 'shoulders', label: 'Épaules', emoji: '🏔️', color: '#f59e0b' },
  { key: 'biceps', label: 'Biceps', emoji: '💪', color: '#8b5cf6' },
  { key: 'triceps', label: 'Triceps', emoji: '🧊', color: '#06b6d4' },
  { key: 'legs', label: 'Jambes', emoji: '🦵', color: '#22c55e' },
  { key: 'glutes', label: 'Fessiers', emoji: '🍑', color: '#ec4899' },
  { key: 'core', label: 'Abdominaux', emoji: '🧱', color: '#eab308' },
  { key: 'cardio', label: 'Cardio', emoji: '🏃', color: '#14b8a6' },
  { key: 'fullbody', label: 'Full body', emoji: '🔥', color: '#f97316' },
];

export const MUSCLE_MAP = MUSCLES.reduce((acc, m) => {
  acc[m.key] = m;
  return acc;
}, {});

export const EQUIPMENT = [
  { key: 'barbell', label: 'Barre' },
  { key: 'dumbbell', label: 'Haltères' },
  { key: 'machine', label: 'Machine' },
  { key: 'cable', label: 'Câble / Poulie' },
  { key: 'bodyweight', label: 'Poids du corps' },
  { key: 'kettlebell', label: 'Kettlebell' },
  { key: 'band', label: 'Élastique' },
  { key: 'other', label: 'Autre' },
];

export const EQUIPMENT_MAP = EQUIPMENT.reduce((acc, e) => {
  acc[e.key] = e;
  return acc;
}, {});

const raw = [
  // ── Pectoraux ────────────────────────────────────────────────
  ['Développé couché', 'chest', 'strength', 'barbell'],
  ['Développé couché haltères', 'chest', 'strength', 'dumbbell'],
  ['Développé incliné barre', 'chest', 'strength', 'barbell'],
  ['Développé incliné haltères', 'chest', 'strength', 'dumbbell'],
  ['Développé décliné', 'chest', 'strength', 'barbell'],
  ['Écartés haltères', 'chest', 'strength', 'dumbbell'],
  ['Écartés à la poulie', 'chest', 'strength', 'cable'],
  ['Dips', 'chest', 'bodyweight', 'bodyweight'],
  ['Pompes', 'chest', 'bodyweight', 'bodyweight'],
  ['Presse à pectoraux', 'chest', 'strength', 'machine'],

  // ── Dos ──────────────────────────────────────────────────────
  ['Tractions', 'back', 'bodyweight', 'bodyweight'],
  ['Tirage vertical', 'back', 'strength', 'machine'],
  ['Rowing barre', 'back', 'strength', 'barbell'],
  ['Rowing haltère', 'back', 'strength', 'dumbbell'],
  ['Rowing assis à la poulie', 'back', 'strength', 'cable'],
  ['Soulevé de terre', 'back', 'strength', 'barbell'],
  ['Soulevé de terre roumain', 'back', 'strength', 'barbell'],
  ['Tirage horizontal machine', 'back', 'strength', 'machine'],
  ['Face pull', 'back', 'strength', 'cable'],
  ['Pull-over haltère', 'back', 'strength', 'dumbbell'],
  ['Shrugs haltères', 'back', 'strength', 'dumbbell'],

  // ── Épaules ──────────────────────────────────────────────────
  ['Développé militaire', 'shoulders', 'strength', 'barbell'],
  ['Développé haltères assis', 'shoulders', 'strength', 'dumbbell'],
  ['Élévations latérales', 'shoulders', 'strength', 'dumbbell'],
  ['Élévations frontales', 'shoulders', 'strength', 'dumbbell'],
  ['Oiseau (machine)', 'shoulders', 'strength', 'machine'],
  ['Élévations latérales à la poulie', 'shoulders', 'strength', 'cable'],
  ['Rowing menton', 'shoulders', 'strength', 'barbell'],

  // ── Biceps ───────────────────────────────────────────────────
  ['Curl à la barre', 'biceps', 'strength', 'barbell'],
  ['Curl haltères', 'biceps', 'strength', 'dumbbell'],
  ['Curl marteau', 'biceps', 'strength', 'dumbbell'],
  ['Curl pupitre', 'biceps', 'strength', 'barbell'],
  ['Curl à la poulie', 'biceps', 'strength', 'cable'],
  ['Curl concentration', 'biceps', 'strength', 'dumbbell'],

  // ── Triceps ──────────────────────────────────────────────────
  ['Extension triceps couchée', 'triceps', 'strength', 'barbell'],
  ['Barre au front', 'triceps', 'strength', 'barbell'],
  ['Extension triceps à la poulie', 'triceps', 'strength', 'cable'],
  ['Kickback haltère', 'triceps', 'strength', 'dumbbell'],
  ['Développé serré', 'triceps', 'strength', 'barbell'],
  ['Dips triceps', 'triceps', 'bodyweight', 'bodyweight'],

  // ── Jambes ───────────────────────────────────────────────────
  ['Squat', 'legs', 'strength', 'barbell'],
  ['Squat avant', 'legs', 'strength', 'barbell'],
  ['Presse à cuisses', 'legs', 'strength', 'machine'],
  ['Fentes marchées', 'legs', 'strength', 'dumbbell'],
  ['Leg curl', 'legs', 'strength', 'machine'],
  ['Leg extension', 'legs', 'strength', 'machine'],
  ['Mollets debout', 'legs', 'strength', 'machine'],
  ['Hack squat', 'legs', 'strength', 'machine'],
  ['Squat sumo', 'legs', 'strength', 'barbell'],

  // ── Fessiers ─────────────────────────────────────────────────
  ['Hip thrust', 'glutes', 'strength', 'barbell'],
  ['Fentes bulgares', 'glutes', 'strength', 'dumbbell'],
  ['Kickback fessiers', 'glutes', 'strength', 'machine'],
  ['Abducteurs machine', 'glutes', 'strength', 'machine'],
  ['Pont fessier', 'glutes', 'bodyweight', 'bodyweight'],

  // ── Abdominaux ───────────────────────────────────────────────
  ['Crunch', 'core', 'bodyweight', 'bodyweight'],
  ['Relevé de jambes', 'core', 'bodyweight', 'bodyweight'],
  ['Russian twist', 'core', 'strength', 'other'],
  ['Roue abdominale', 'core', 'bodyweight', 'other'],
  ['Mountain climbers', 'core', 'bodyweight', 'bodyweight'],

  // ── Cardio ───────────────────────────────────────────────────
  ['Tapis de course', 'cardio', 'time', 'machine'],
  ['Vélo d’appartement', 'cardio', 'time', 'machine'],
  ['Rameur', 'cardio', 'time', 'machine'],
  ['Elliptique', 'cardio', 'time', 'machine'],
  ['Corde à sauter', 'cardio', 'time', 'other'],

  // ── Full body ────────────────────────────────────────────────
  ['Burpees', 'fullbody', 'bodyweight', 'bodyweight'],
  ['Kettlebell swing', 'fullbody', 'strength', 'kettlebell'],
  ['Thruster', 'fullbody', 'strength', 'barbell'],
  ['Farmer walk', 'fullbody', 'strength', 'dumbbell'],
];

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const DEFAULT_EXERCISES = raw.map(([name, muscle, type, equipment]) => ({
  id: `ex-${slugify(name)}`,
  name,
  muscle,
  type,
  equipment,
  custom: false,
}));
