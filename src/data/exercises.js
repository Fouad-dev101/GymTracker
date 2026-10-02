export const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export const EQUIPMENT = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight"];

export const defaultExercises = [
  { id: "ex-1", name: "Bench Press", muscle: "Chest", equipment: "Barbell", notes: "Shoulder blades back, feet planted." },
  { id: "ex-2", name: "Incline Dumbbell Press", muscle: "Chest", equipment: "Dumbbell", notes: "30° bench, full stretch at the bottom." },
  { id: "ex-3", name: "Chest Fly", muscle: "Chest", equipment: "Cable", notes: "Slight elbow bend, squeeze at the centre." },
  { id: "ex-4", name: "Push-up", muscle: "Chest", equipment: "Bodyweight", notes: "Body in one line from head to heels." },
  { id: "ex-5", name: "Deadlift", muscle: "Back", equipment: "Barbell", notes: "Flat back, bar close to the shins." },
  { id: "ex-6", name: "Pull-up", muscle: "Back", equipment: "Bodyweight", notes: "Full hang, chin over the bar." },
  { id: "ex-7", name: "Barbell Row", muscle: "Back", equipment: "Barbell", notes: "Hinge at the hips, pull to the lower ribs." },
  { id: "ex-8", name: "Lat Pulldown", muscle: "Back", equipment: "Machine", notes: "Lead with the elbows." },
  { id: "ex-9", name: "Seated Cable Row", muscle: "Back", equipment: "Cable", notes: "Keep the chest tall." },
  { id: "ex-10", name: "Squat", muscle: "Legs", equipment: "Barbell", notes: "Knees track over toes, hit depth." },
  { id: "ex-11", name: "Leg Press", muscle: "Legs", equipment: "Machine", notes: "Don't lock the knees at the top." },
  { id: "ex-12", name: "Romanian Deadlift", muscle: "Legs", equipment: "Barbell", notes: "Push the hips back, feel the hamstrings." },
  { id: "ex-13", name: "Walking Lunge", muscle: "Legs", equipment: "Dumbbell", notes: "Long steps, upright torso." },
  { id: "ex-14", name: "Calf Raise", muscle: "Legs", equipment: "Machine", notes: "Pause at the top." },
  { id: "ex-15", name: "Overhead Press", muscle: "Shoulders", equipment: "Barbell", notes: "Squeeze glutes, press in a straight line." },
  { id: "ex-16", name: "Lateral Raise", muscle: "Shoulders", equipment: "Dumbbell", notes: "Lead with the elbows, light weight." },
  { id: "ex-17", name: "Face Pull", muscle: "Shoulders", equipment: "Cable", notes: "Pull to the forehead, rotate out." },
  { id: "ex-18", name: "Barbell Curl", muscle: "Arms", equipment: "Barbell", notes: "No swinging." },
  { id: "ex-19", name: "Hammer Curl", muscle: "Arms", equipment: "Dumbbell", notes: "Neutral grip." },
  { id: "ex-20", name: "Triceps Pushdown", muscle: "Arms", equipment: "Cable", notes: "Elbows pinned to the sides." },
  { id: "ex-21", name: "Dips", muscle: "Arms", equipment: "Bodyweight", notes: "Lean forward for more chest, upright for triceps." },
  { id: "ex-22", name: "Plank", muscle: "Core", equipment: "Bodyweight", notes: "Ribs down, squeeze glutes." },
  { id: "ex-23", name: "Hanging Leg Raise", muscle: "Core", equipment: "Bodyweight", notes: "Curl the pelvis up, no swinging." },
  { id: "ex-24", name: "Cable Crunch", muscle: "Core", equipment: "Cable", notes: "Crunch the ribs toward the hips." },
];

export const STORAGE_KEYS = {
  workouts: "gymtracker.workouts",
  customExercises: "gymtracker.customExercises",
  profile: "gymtracker.profile",
};
