export default function StatCard({ label, value, unit, hint }) {
  return (
    <div className="stat">
      <p className="stat__label">{label}</p>
      <p className="stat__value">
        {value}
        {unit && <span className="stat__unit"> {unit}</span>}
      </p>
      {hint && <p className="stat__hint">{hint}</p>}
    </div>
  );
}
