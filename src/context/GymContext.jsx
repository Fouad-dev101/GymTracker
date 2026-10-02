import { createContext, useContext, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { defaultExercises, STORAGE_KEYS } from "../data/exercises.js";

const GymContext = createContext(null);

export function GymProvider({ children }) {
  const [workouts, setWorkouts] = useLocalStorage(STORAGE_KEYS.workouts, []);
  const [customExercises, setCustomExercises] = useLocalStorage(STORAGE_KEYS.customExercises, []);
  const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.profile, null);

  const value = useMemo(
    () => ({
      // workouts
      workouts,
      getWorkout: (id) => workouts.find((w) => String(w.id) === String(id)),
      addWorkout: (workout) => setWorkouts((list) => [workout, ...list]),
      updateWorkout: (workout) =>
        setWorkouts((list) => list.map((w) => (w.id === workout.id ? workout : w))),
      deleteWorkout: (id) => setWorkouts((list) => list.filter((w) => w.id !== id)),

      // exercises (custom ones first, then the built-in library)
      exercises: [...customExercises, ...defaultExercises],
      addExercise: (exercise) => setCustomExercises((list) => [exercise, ...list]),
      deleteExercise: (id) => setCustomExercises((list) => list.filter((e) => e.id !== id)),

      // profile
      profile,
      saveProfile: setProfile,
      clearProfile: () => setProfile(null),
    }),
    [workouts, customExercises, profile, setWorkouts, setCustomExercises, setProfile]
  );

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym must be used inside <GymProvider>");
  return ctx;
}
