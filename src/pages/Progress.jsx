import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard.jsx";
import { useGym } from "../context/GymContext.jsx";
import { exerciseHistory, formatDate, loggedExerciseNames, weeklyVolumes } from "../utils/stats.js";

function BarChart({ data }) {
  const W = 600, H = 220, P = { t: 14, r: 10, b: 28, l: 46 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const bw = (W - P.l - P.r) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Weekly training volume in kilograms, last 8 weeks">
      <line x1={P.l} x2={W - P.r} y1={H - P.b} y2={H - P.b} className="chart__axis" />
      <text x={P.l - 6} y={P.t + 8} textAnchor="end" className="chart__label">{max.toLocaleString()}</text>
      <text x={P.l - 6} y={H - P.b} textAnchor="end" className="chart__label">0</text>
      {data.map((d, i) => {
        const h = ((H - P.t - P.b) * d.value) / max;
        return (
          <g key={i}>
            <rect x={P.l + i * bw + 6} y={H - P.b - h} width={bw - 12} height={h} rx="3" className="chart__bar">
              <title>{`Week of ${d.label}: ${d.value.toLocaleString()} kg`}</title>
            </rect>
            <text x={P.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="chart__label">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ points, unit }) {
  const W = 600, H = 220, P = { t: 14, r: 14, b: 28, l: 46 };
  const values = points.map((p) => p.value);
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) { min -= 1; max += 1; }
  const x = (i) => (points.length === 1 ? (W + P.l - P.r) / 2 : P.l + (i * (W - P.l - P.r)) / (points.length - 1));
  const y = (v) => H - P.b - ((v - min) / (max - min)) * (H - P.t - P.b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`Progress in ${unit} over time`}>
      <line x1={P.l} x2={W - P.r} y1={H - P.b} y2={H - P.b} className="chart__axis" />
      <text x={P.l - 6} y={P.t + 8} textAnchor="end" className="chart__label">{Math.round(max)}</text>
      <text x={P.l - 6} y={H - P.b} textAnchor="end" className="chart__label">{Math.round(min)}</text>
      {points.length > 1 && (
        <polyline fill="none" className="chart__line" points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")} />
      )}
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.value)} r="4" className="chart__dot">
          <title>{`${p.label}: ${p.value} ${unit}`}</title>
        </circle>
      ))}
      <text x={P.l} y={H - 8} textAnchor="start" className="chart__label">{points[0].label}</text>
      {points.length > 1 && (
        <text x={W - P.r} y={H - 8} textAnchor="end" className="chart__label">{points[points.length - 1].label}</text>
      )}
    </svg>
  );
}

export default function Progress() {
  const { workouts } = useGym();
  const names = useMemo(() => loggedExerciseNames(workouts), [workouts]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!names.includes(selected)) setSelected(names[0] ?? "");
  }, [names, selected]);

  if (workouts.length === 0) {
    return (
      <section>
        <div className="page-head"><h1>Progress</h1></div>
        <p className="empty">Log a few workouts and your progress shows up here. <Link to="/workouts" className="link">Log a workout</Link></p>
      </section>
    );
  }

  const weekly = weeklyVolumes(workouts, 8);
  const history = exerciseHistory(workouts, selected);
  const best = history.length ? Math.max(...history.map((h) => h.topWeight)) : 0;
  const bestE1rm = history.length ? Math.max(...history.map((h) => h.e1rm)) : 0;
  const change = history.length > 1 ? history[history.length - 1].topWeight - history[0].topWeight : 0;

  return (
    <section>
      <div className="page-head"><h1>Progress</h1></div>

      <div className="card chart-card">
        <h2>Weekly volume</h2>
        <p className="muted">Total kg lifted (weight × reps), last 8 weeks</p>
        <BarChart data={weekly} />
      </div>

      <div className="card chart-card">
        <div className="page-head page-head--sub">
          <h2>By exercise</h2>
          <label className="field field--inline">
            <span className="sr-only">Exercise</span>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {names.map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>

        {history.length > 0 && (
          <>
            <div className="grid grid--stats">
              <StatCard label="Heaviest set" value={best} unit="kg" />
              <StatCard label="Estimated 1RM" value={bestE1rm} unit="kg" hint="Epley formula" />
              <StatCard label="Change" value={`${change > 0 ? "+" : ""}${change}`} unit="kg" hint="First to latest session" />
              <StatCard label="Sessions" value={history.length} />
            </div>
            <LineChart points={history.map((h) => ({ label: formatDate(h.date, { day: "numeric", month: "short" }), value: h.topWeight }))} unit="kg" />
          </>
        )}
      </div>
    </section>
  );
}
