import { Link } from "react-router-dom";
import StatCard from "../components/StatCard.jsx";
import WorkoutCard from "../components/WorkoutCard.jsx";
import { useGym } from "../context/GymContext.jsx";
import { sortByDateDesc, workoutVolume, workoutsThisWeek } from "../utils/stats.js";

export default function Dashboard() {
  const { workouts, profile } = useGym();
  const recent = sortByDateDesc(workouts).slice(0, 3);
  const thisWeek = workoutsThisWeek(workouts);
  const totalVolume = workouts.reduce((t, w) => t + workoutVolume(w), 0);
  const totalMinutes = workouts.reduce((t, w) => t + w.duration, 0);
  const target = profile?.weeklyTarget;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{profile?.name ? `Hey ${profile.name}` : "Dashboard"}</h1>
          <p className="muted">
            {target
              ? `${thisWeek.length} of ${target} sessions done this week`
              : "Set a weekly target in your profile to track it here."}
          </p>
        </div>
        <Link to="/workouts" className="btn">Log a workout</Link>
      </div>

      <div className="grid grid--stats">
        <StatCard label="This week" value={thisWeek.length} unit={thisWeek.length === 1 ? "workout" : "workouts"} />
        <StatCard label="All workouts" value={workouts.length} />
        <StatCard label="Total volume" value={totalVolume.toLocaleString()} unit="kg" />
        <StatCard label="Time trained" value={totalMinutes >= 60 ? (totalMinutes / 60).toFixed(1) : totalMinutes} unit={totalMinutes >= 60 ? "h" : "min"} />
      </div>

      <div className="page-head page-head--sub">
        <h2>Recent workouts</h2>
        {workouts.length > 3 && <Link to="/workouts" className="link">See all</Link>}
      </div>

      {recent.length === 0 ? (
        <p className="empty">No workouts yet. <Link to="/workouts" className="link">Log your first one.</Link></p>
      ) : (
        <div className="grid">
          {recent.map((w) => <WorkoutCard key={w.id} workout={w} />)}
        </div>
      )}
    </section>
  );
}
