import { useMemo, useState } from "react";
import ExerciseCard from "../components/ExerciseCard.jsx";
import ExerciseForm from "../components/ExerciseForm.jsx";
import { useGym } from "../context/GymContext.jsx";
import { MUSCLE_GROUPS } from "../data/exercises.js";

export default function Exercises() {
  const { exercises, addExercise, deleteExercise } = useGym();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const names = useMemo(() => exercises.map((e) => e.name.toLowerCase()), [exercises]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter(
      (e) =>
        (muscle === "All" || e.muscle === muscle) &&
        (!q || e.name.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q))
    );
  }, [exercises, query, muscle]);

  const handleAdd = (exercise) => {
    addExercise(exercise);
    setShowForm(false);
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Exercises</h1>
          <p className="muted">{exercises.length} exercises in your library</p>
        </div>
        <button className="btn" onClick={() => setShowForm((s) => !s)} aria-expanded={showForm}>
          {showForm ? "Close" : "Add exercise"}
        </button>
      </div>

      {showForm && <ExerciseForm existingNames={names} onAdd={handleAdd} />}

      <div className="toolbar">
        <input
          type="search"
          className="toolbar__search"
          placeholder="Search by name or equipment"
          aria-label="Search exercises"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Filter by muscle group">
          {["All", ...MUSCLE_GROUPS].map((m) => (
            <button
              key={m}
              className={`chip ${muscle === m ? "is-active" : ""}`}
              aria-pressed={muscle === m}
              onClick={() => setMuscle(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="empty">No exercise matches. Clear the filter or add it as a new exercise.</p>
      ) : (
        <div className="grid">
          {visible.map((e) => (
            <ExerciseCard
              key={e.id}
              exercise={e}
              onDelete={e.id.startsWith("custom-") ? deleteExercise : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
