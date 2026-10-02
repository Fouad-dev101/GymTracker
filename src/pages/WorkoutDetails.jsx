import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StatCard from "../components/StatCard.jsx";
import WorkoutForm from "../components/WorkoutForm.jsx";
import { useGym } from "../context/GymContext.jsx";
import { formatDate, workoutSets, workoutVolume } from "../utils/stats.js";

export default function WorkoutDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWorkout, exercises, updateWorkout, deleteWorkout } = useGym();
  const [editing, setEditing] = useState(false);
  const workout = getWorkout(id);

  if (!workout) {
    return (
      <section>
        <p className="empty">This workout doesn't exist. <Link to="/workouts" className="link">Back to workouts</Link></p>
      </section>
    );
  }

  const remove = () => {
    if (window.confirm(`Delete "${workout.name}"? This can't be undone.`)) {
      deleteWorkout(workout.id);
      navigate("/workouts");
    }
  };

  if (editing) {
    return (
      <section>
        <WorkoutForm
          initial={workout}
          exercises={exercises}
          onSave={(w) => { updateWorkout(w); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </section>
    );
  }

  return (
    <section>
      <Link to="/workouts" className="link">‹ All workouts</Link>
      <div className="page-head page-head--sub">
        <div>
          <h1>{workout.name}</h1>
          <p className="muted">{formatDate(workout.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="form__actions">
          <button className="btn" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn--ghost" onClick={remove}>Delete</button>
        </div>
      </div>

      <div className="grid grid--stats">
        <StatCard label="Duration" value={workout.duration} unit="min" />
        <StatCard label="Exercises" value={workout.exercises.length} />
        <StatCard label="Sets" value={workoutSets(workout)} />
        <StatCard label="Volume" value={workoutVolume(workout).toLocaleString()} unit="kg" />
      </div>

      {workout.exercises.map((ex, i) => (
        <div className="card log-detail" key={`${ex.name}-${i}`}>
          <h3>{ex.name}</h3>
          <table className="table">
            <thead>
              <tr><th>Set</th><th>Weight</th><th>Reps</th></tr>
            </thead>
            <tbody>
              {ex.sets.map((s, j) => (
                <tr key={j}><td>{j + 1}</td><td>{s.weight} kg</td><td>{s.reps}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
