import { Link } from "react-router-dom";
import { formatDate, workoutSets, workoutVolume } from "../utils/stats.js";

/** workout = { id, name, date, duration, exercises: [{ name, sets: [{ weight, reps }] }] } */
export default function WorkoutCard({ workout }) {
  return (
    <Link to={`/workouts/${workout.id}`} className="workout-card">
      <div className="workout-card__head">
        <h3>{workout.name}</h3>
        <time dateTime={workout.date}>{formatDate(workout.date)}</time>
      </div>
      <dl className="workout-card__meta">
        <div>
          <dt>Duration</dt>
          <dd>{workout.duration} min</dd>
        </div>
        <div>
          <dt>Exercises</dt>
          <dd>{workout.exercises.length}</dd>
        </div>
        <div>
          <dt>Sets</dt>
          <dd>{workoutSets(workout)}</dd>
        </div>
        <div>
          <dt>Volume</dt>
          <dd>{workoutVolume(workout).toLocaleString()} kg</dd>
        </div>
      </dl>
    </Link>
  );
}
