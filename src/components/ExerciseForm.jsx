import { useState } from "react";
import { EQUIPMENT, MUSCLE_GROUPS } from "../data/exercises.js";

const empty = { name: "", muscle: MUSCLE_GROUPS[0], equipment: EQUIPMENT[0], notes: "" };

export default function ExerciseForm({ existingNames, onAdd }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return setError("Enter an exercise name.");
    if (existingNames.includes(name.toLowerCase()))
      return setError(`"${name}" is already in your exercise list.`);

    onAdd({ ...form, name, notes: form.notes.trim(), id: `custom-${Date.now()}` });
    setForm(empty);
  };

  return (
    <form className="form card" onSubmit={submit} noValidate>
      <h2>New exercise</h2>

      <label className="field">
        <span>Name</span>
        <input value={form.name} onChange={update("name")} placeholder="e.g. Cable Lateral Raise" />
      </label>

      <div className="form__row">
        <label className="field">
          <span>Muscle group</span>
          <select value={form.muscle} onChange={update("muscle")}>
            {MUSCLE_GROUPS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Equipment</span>
          <select value={form.equipment} onChange={update("equipment")}>
            {EQUIPMENT.map((eq) => (
              <option key={eq}>{eq}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Notes (optional)</span>
        <textarea rows="2" value={form.notes} onChange={update("notes")} />
      </label>

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}

      <button className="btn" type="submit">
        Save exercise
      </button>
    </form>
  );
}
