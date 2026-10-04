import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { DEFAULT_EXERCISES } from '../data/exercises';
import { DEFAULT_ROUTINES } from '../data/routines';
import { generateDemoData } from '../data/demo';
import { uid, toISODate } from '../utils/format';
import { isLoggedSet } from '../utils/stats';

const STORAGE_KEY = 'gymtracker:v1';
const STATE_VERSION = 1;

/* ── Initial state ─────────────────────────────────────────── */

const defaultProfile = {
  name: 'Athlète',
  gender: 'homme',
  unit: 'kg', // 'kg' | 'lb'
  theme: 'dark', // 'dark' | 'light'
  weeklyGoal: 4,
  restTimer: 90, // seconds
  bodyweight: 75, // kg, always metric internally
};

export const createInitialState = () => ({
  version: STATE_VERSION,
  profile: { ...defaultProfile },
  exercises: DEFAULT_EXERCISES,
  routines: DEFAULT_ROUTINES,
  workouts: [],
  bodyweights: [],
  active: null,
});

const loadState = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STATE_VERSION) return null;
    return {
      ...createInitialState(),
      ...parsed,
      profile: { ...defaultProfile, ...(parsed.profile || {}) },
    };
  } catch (error) {
    console.warn('[GymTracker] Unable to read saved data:', error);
    return null;
  }
};

/* ── Reducer ───────────────────────────────────────────────── */

const makeEntry = (exercise, withEmptySet = true) => ({
  id: uid(),
  exerciseId: exercise.id,
  name: exercise.name,
  sets: withEmptySet ? [{ id: uid(), reps: '', weight: '', seconds: '', done: false }] : [],
});

function reducer(state, action) {
  switch (action.type) {
    /* ── Profile ── */
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.patch } };

    case 'ADD_BODYWEIGHT': {
      const { date, weight } = action.payload;
      const existing = state.bodyweights.findIndex((b) => b.date === date);
      const next = [...state.bodyweights];
      if (existing >= 0) next[existing] = { ...next[existing], weight };
      else next.push({ id: uid(), date, weight });
      next.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      return { ...state, bodyweights: next };
    }

    case 'DELETE_BODYWEIGHT':
      return {
        ...state,
        bodyweights: state.bodyweights.filter((b) => b.id !== action.id),
      };

    /* ── Exercise library ── */
    case 'ADD_EXERCISE':
      return { ...state, exercises: [...state.exercises, action.exercise] };

    case 'UPDATE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.id === action.id ? { ...e, ...action.patch } : e
        ),
      };

    case 'DELETE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.filter((e) => e.id !== action.id),
        active: state.active
          ? {
              ...state.active,
              exercises: state.active.exercises.filter((e) => e.exerciseId !== action.id),
            }
          : null,
      };

    /* ── Routines ── */
    case 'ADD_ROUTINE':
      return { ...state, routines: [...state.routines, action.routine] };

    case 'UPDATE_ROUTINE':
      return {
        ...state,
        routines: state.routines.map((r) =>
          r.id === action.id ? { ...r, ...action.patch } : r
        ),
      };

    case 'DELETE_ROUTINE':
      return { ...state, routines: state.routines.filter((r) => r.id !== action.id) };

    /* ── Active session ── */
    case 'START_WORKOUT':
      return { ...state, active: action.active };

    case 'RENAME_ACTIVE':
      return state.active
        ? { ...state, active: { ...state.active, name: action.name } }
        : state;

    case 'NOTE_ACTIVE':
      return state.active
        ? { ...state, active: { ...state.active, notes: action.notes } }
        : state;

    case 'ADD_EXERCISE_TO_ACTIVE': {
      if (!state.active) return state;
      if (state.active.exercises.some((e) => e.exerciseId === action.exercise.id)) return state;
      return {
        ...state,
        active: { ...state.active, exercises: [...state.active.exercises, makeEntry(action.exercise)] },
      };
    }

    case 'REMOVE_ENTRY': {
      if (!state.active) return state;
      return {
        ...state,
        active: {
          ...state.active,
          exercises: state.active.exercises.filter((e) => e.id !== action.entryId),
        },
      };
    }

    case 'ADD_SET': {
      if (!state.active) return state;
      const exercises = state.active.exercises.map((entry) => {
        if (entry.id !== action.entryId) return entry;
        const previous = entry.sets[entry.sets.length - 1] || {};
        return {
          ...entry,
          sets: [
            ...entry.sets,
            {
              id: uid(),
              reps: previous.reps ?? '',
              weight: previous.weight ?? '',
              seconds: previous.seconds ?? '',
              done: false,
            },
          ],
        };
      });
      return { ...state, active: { ...state.active, exercises } };
    }

    case 'UPDATE_SET': {
      if (!state.active) return state;
      const exercises = state.active.exercises.map((entry) => {
        if (entry.id !== action.entryId) return entry;
        return {
          ...entry,
          sets: entry.sets.map((set) =>
            set.id === action.setId ? { ...set, ...action.patch } : set
          ),
        };
      });
      return { ...state, active: { ...state.active, exercises } };
    }

    case 'DELETE_SET': {
      if (!state.active) return state;
      const exercises = state.active.exercises.map((entry) => {
        if (entry.id !== action.entryId) return entry;
        return { ...entry, sets: entry.sets.filter((s) => s.id !== action.setId) };
      });
      return { ...state, active: { ...state.active, exercises } };
    }

    case 'FINISH_WORKOUT': {
      if (!state.active) return state;
      const now = new Date();
      const startedAt = state.active.startedAt ? new Date(state.active.startedAt) : now;
      const durationSec = Math.max(60, Math.round((now - startedAt) / 1000));

      const exercises = state.active.exercises
        .map((entry) => ({
          ...entry,
          sets: entry.sets
            .filter((set) => isLoggedSet(set))
            .map((set) => ({
              id: set.id,
              reps: Number(set.reps) || 0,
              weight: Number(set.weight) || 0,
              seconds: Number(set.seconds) || 0,
              done: true,
            })),
        }))
        .filter((entry) => entry.sets.length > 0);

      if (!exercises.length) return { ...state, active: null };

      const workout = {
        id: state.active.id,
        name: state.active.name || 'Séance',
        date: toISODate(now),
        startedAt: startedAt.toISOString(),
        finishedAt: now.toISOString(),
        durationSec,
        notes: state.active.notes || '',
        exercises,
      };

      return { ...state, workouts: [...state.workouts, workout], active: null };
    }

    case 'CANCEL_WORKOUT':
      return { ...state, active: null };

    /* ── History ── */
    case 'DELETE_WORKOUT':
      return { ...state, workouts: state.workouts.filter((w) => w.id !== action.id) };

    case 'UPDATE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === action.id ? { ...w, ...action.patch } : w
        ),
      };

    /* ── Global ── */
    case 'LOAD_DEMO': {
      const demo = generateDemoData({ weeks: 12, perWeek: 4 });
      return { ...state, workouts: demo.workouts, bodyweights: demo.bodyweights, active: null };
    }

    case 'IMPORT_DATA':
      return {
        ...createInitialState(),
        ...action.state,
        profile: { ...defaultProfile, ...(action.state.profile || {}) },
        active: null,
      };

    case 'RESET_ALL':
      return createInitialState();

    default:
      return state;
  }
}

/* ── Context ───────────────────────────────────────────────── */

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => loadState() || createInitialState());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('[GymTracker] Unable to save data:', error);
    }
  }, [state]);

  // Keep the <html data-theme> attribute in sync with the profile.
  useEffect(() => {
    document.documentElement.dataset.theme = state.profile.theme || 'dark';
  }, [state.profile.theme]);

  const actions = useMemo(
    () => ({
      updateProfile: (patch) => dispatch({ type: 'UPDATE_PROFILE', patch }),
      addBodyweight: (date, weight) =>
        dispatch({ type: 'ADD_BODYWEIGHT', payload: { date, weight } }),
      deleteBodyweight: (id) => dispatch({ type: 'DELETE_BODYWEIGHT', id }),

      addExercise: (exercise) => {
        const created = { ...exercise, id: exercise.id || uid(), custom: true };
        dispatch({ type: 'ADD_EXERCISE', exercise: created });
        return created; // handy when the caller needs to use it right away
      },
      updateExercise: (id, patch) => dispatch({ type: 'UPDATE_EXERCISE', id, patch }),
      deleteExercise: (id) => dispatch({ type: 'DELETE_EXERCISE', id }),

      addRoutine: (routine) =>
        dispatch({
          type: 'ADD_ROUTINE',
          routine: { ...routine, id: routine.id || uid(), custom: true },
        }),
      updateRoutine: (id, patch) => dispatch({ type: 'UPDATE_ROUTINE', id, patch }),
      deleteRoutine: (id) => dispatch({ type: 'DELETE_ROUTINE', id }),

      startWorkout: ({ name, exerciseIds = [] }) => {
        const exercises = exerciseIds
          .map((id) => state.exercises.find((e) => e.id === id))
          .filter(Boolean)
          .map((exercise) => makeEntry(exercise));
        dispatch({
          type: 'START_WORKOUT',
          active: {
            id: uid(),
            name: name || 'Séance',
            startedAt: new Date().toISOString(),
            notes: '',
            exercises,
          },
        });
      },
      renameActive: (name) => dispatch({ type: 'RENAME_ACTIVE', name }),
      noteActive: (notes) => dispatch({ type: 'NOTE_ACTIVE', notes }),
      addExerciseToActive: (exercise) => dispatch({ type: 'ADD_EXERCISE_TO_ACTIVE', exercise }),
      removeEntry: (entryId) => dispatch({ type: 'REMOVE_ENTRY', entryId }),
      addSet: (entryId) => dispatch({ type: 'ADD_SET', entryId }),
      updateSet: (entryId, setId, patch) =>
        dispatch({ type: 'UPDATE_SET', entryId, setId, patch }),
      deleteSet: (entryId, setId) => dispatch({ type: 'DELETE_SET', entryId, setId }),
      finishWorkout: () => dispatch({ type: 'FINISH_WORKOUT' }),
      cancelWorkout: () => dispatch({ type: 'CANCEL_WORKOUT' }),

      deleteWorkout: (id) => dispatch({ type: 'DELETE_WORKOUT', id }),
      updateWorkout: (id, patch) => dispatch({ type: 'UPDATE_WORKOUT', id, patch }),

      loadDemo: () => dispatch({ type: 'LOAD_DEMO' }),
      importData: (next) => dispatch({ type: 'IMPORT_DATA', state: next }),
      resetAll: () => dispatch({ type: 'RESET_ALL' }),
    }),
    // `state.exercises` is only read inside startWorkout at call time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside <StoreProvider>');
  return context;
};
