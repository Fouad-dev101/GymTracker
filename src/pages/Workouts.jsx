import { useState } from "react";
import WorkoutCard from "../components/WorkoutCard.jsx";
import WorkoutForm from "../components/WorkoutForm.jsx";
import { useGym } from "../context/GymContext.jsx";
import { sortByDateDesc } from "../utils/stats.js";

export default function Workouts() {
  const { workouts, exercises, addWorkout } = useGym();
  const [showForm, setShowForm] = useState(false);

  const save = (workout) => {
    addWorkout(workout);
    setShowForm(false);
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Workouts</h1>
          <p className="muted">{workouts.length} logged</p>
        </div>
        <button className="btn" onClick={() => setShowForm((s) => !s)} aria-expanded={showForm}>
          {showForm ? "Close" : "New workout"}
        </button>
      </div>

      {showForm && <WorkoutForm exercises={exercises} onSave={save} onCancel={() => setShowForm(false)} />}

      {workouts.length === 0 ? (
        <p className="empty">Nothing logged yet. Create a workout to see your history here.</p>
      ) : (
        <div className="grid">
          {sortByDateDesc(workouts).map((w) => <WorkoutCard key={w.id} workout={w} />)}
        </div>
      )}
    </section>
  );
}
