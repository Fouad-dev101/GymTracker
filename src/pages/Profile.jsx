import { useEffect, useState } from "react";
import { useGym } from "../context/GymContext.jsx";
import StatCard from "../components/StatCard.jsx";

const GOALS = ["Build muscle", "Lose fat", "Get stronger", "Stay fit"];
const emptyProfile = { name: "", age: "", height: "", weight: "", goal: GOALS[0], weeklyTarget: 3 };

export default function Profile() {
  const { profile: saved, saveProfile, clearProfile } = useGym();
  const [form, setForm] = useState({ ...emptyProfile, ...saved });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 2500);
    return () => clearTimeout(t);
  }, [status]);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Enter your name.";
    if (form.age !== "" && (form.age < 12 || form.age > 100)) er.age = "Age must be between 12 and 100.";
    if (form.height !== "" && (form.height < 100 || form.height > 250)) er.height = "Height must be between 100 and 250 cm.";
    if (form.weight !== "" && (form.weight < 30 || form.weight > 300)) er.weight = "Weight must be between 30 and 300 kg.";
    return er;
  };

  const submit = (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;
    saveProfile({ ...form, name: form.name.trim(), weeklyTarget: Number(form.weeklyTarget) });
    setStatus("Profile saved");
  };

  const reset = () => {
    clearProfile();
    setForm(emptyProfile);
    setErrors({});
    setStatus("Profile cleared");
  };

  const bmi =
    saved?.height && saved?.weight
      ? (saved.weight / (saved.height / 100) ** 2).toFixed(1)
      : null;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p className="muted">Stored on this device only.</p>
        </div>
      </div>

      <div className="grid grid--stats">
        <StatCard label="Weight" value={saved?.weight || "—"} unit={saved?.weight ? "kg" : ""} />
        <StatCard label="Height" value={saved?.height || "—"} unit={saved?.height ? "cm" : ""} />
        <StatCard label="BMI" value={bmi || "—"} />
        <StatCard label="Weekly target" value={saved?.weeklyTarget || "—"} unit={saved?.weeklyTarget ? "sessions" : ""} />
      </div>

      <form className="form card" onSubmit={submit} noValidate>
        <h2>Your details</h2>

        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={update("name")} autoComplete="name" aria-invalid={!!errors.name} />
          {errors.name && <small className="form__error">{errors.name}</small>}
        </label>

        <div className="form__row">
          <label className="field">
            <span>Age</span>
            <input type="number" inputMode="numeric" value={form.age} onChange={update("age")} aria-invalid={!!errors.age} />
            {errors.age && <small className="form__error">{errors.age}</small>}
          </label>
          <label className="field">
            <span>Height (cm)</span>
            <input type="number" inputMode="numeric" value={form.height} onChange={update("height")} aria-invalid={!!errors.height} />
            {errors.height && <small className="form__error">{errors.height}</small>}
          </label>
          <label className="field">
            <span>Weight (kg)</span>
            <input type="number" inputMode="decimal" step="0.1" value={form.weight} onChange={update("weight")} aria-invalid={!!errors.weight} />
            {errors.weight && <small className="form__error">{errors.weight}</small>}
          </label>
        </div>

        <div className="form__row">
          <label className="field">
            <span>Goal</span>
            <select value={form.goal} onChange={update("goal")}>
              {GOALS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Sessions per week</span>
            <select value={form.weeklyTarget} onChange={update("weeklyTarget")}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="form__actions">
          <button className="btn" type="submit">
            Save profile
          </button>
          <button className="btn btn--ghost" type="button" onClick={reset}>
            Clear profile
          </button>
          <span className="form__status" role="status">
            {status}
          </span>
        </div>
      </form>
    </section>
  );
}
