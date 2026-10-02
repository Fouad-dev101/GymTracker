import { useState } from "react";
import { todayISO } from "../utils/stats.js";

const blankSet = { weight: "", reps: "" };

function toFormState(initial) {
  if (!initial) return { name: "", date: todayISO(), duration: "", exercises: [] };
  return {
    name: initial.name,
    date: initial.date,
    duration: String(initial.duration),
    exercises: initial.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets.map((s) => ({ weight: String(s.weight), reps: String(s.reps) })),
    })),
  };
}

export default function WorkoutForm({ initial, exercises, onSave, onCancel }) {
  const [form, setForm] = useState(() => toFormState(initial));
  const [pick, setPick] = useState(exercises[0]?.name ?? "");
  const [error, setError] = useState("");

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  const addExercise = () => {
    if (!pick) return;
    setForm((f) => ({ ...f, exercises: [...f.exercises, { name: pick, sets: [{ ...blankSet }] }] }));
    setError("");
  };
  const removeExercise = (i) =>
    setForm((f) => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));

  const updateSets = (i, fn) =>
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((ex, idx) => (idx === i ? { ...ex, sets: fn(ex.sets) } : ex)),
    }));
  const addSet = (i) =>
    updateSets(i, (sets) => [...sets, { ...(sets[sets.length - 1] ?? blankSet) }]);
  const removeSet = (i, j) => updateSets(i, (sets) => sets.filter((_, idx) => idx !== j));
  const editSet = (i, j, field, value) => {
    updateSets(i, (sets) => sets.map((s, idx) => (idx === j ? { ...s, [field]: value } : s)));
    setError("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Give the workout a name, e.g. Push Day.");
    if (!form.date) return setError("Pick a date.");
    if (!(Number(form.duration) > 0)) return setError("Enter the duration in minutes.");
    if (form.exercises.length === 0) return setError("Add at least one exercise.");

    for (const ex of form.exercises) {
      if (ex.sets.length === 0) return setError(`${ex.name} needs at least one set.`);
      if (ex.sets.some((s) => !(Number(s.reps) > 0) || Number(s.weight) < 0 || s.weight === ""))
        return setError(`Fill weight and reps for every set of ${ex.name} (use 0 kg for bodyweight).`);
    }

    onSave({
      id: initial?.id ?? Date.now(),
      name: form.name.trim(),
      date: form.date,
      duration: Number(form.duration),
      exercises: form.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets.map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })),
      })),
    });
  };

  return (
    <form className="form card" onSubmit={submit} noValidate>
      <h2>{initial ? "Edit workout" : "New workout"}</h2>

      <div className="form__row">
        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={setField("name")} placeholder="Push Day" />
        </label>
        <label className="field">
          <span>Date</span>
          <input type="date" value={form.date} onChange={setField("date")} />
        </label>
        <label className="field">
          <span>Duration (min)</span>
          <input type="number" inputMode="numeric" min="1" value={form.duration} onChange={setField("duration")} />
        </label>
      </div>

      {form.exercises.map((ex, i) => (
        <fieldset className="log-ex" key={`${ex.name}-${i}`}>
          <legend>{ex.name}</legend>
          {ex.sets.map((s, j) => (
            <div className="set-row" key={j}>
              <span className="set-row__n">Set {j + 1}</span>
              <input
                type="number" inputMode="decimal" step="0.5" min="0" placeholder="kg"
                aria-label={`${ex.name} set ${j + 1} weight in kg`}
                value={s.weight} onChange={(e) => editSet(i, j, "weight", e.target.value)}
              />
              <input
                type="number" inputMode="numeric" min="1" placeholder="reps"
                aria-label={`${ex.name} set ${j + 1} reps`}
                value={s.reps} onChange={(e) => editSet(i, j, "reps", e.target.value)}
              />
              <button type="button" className="btn btn--small btn--ghost" onClick={() => removeSet(i, j)} aria-label={`Remove set ${j + 1} of ${ex.name}`}>
                Remove
              </button>
            </div>
          ))}
          <div className="form__actions">
            <button type="button" className="btn btn--small" onClick={() => addSet(i)}>Add set</button>
            <button type="button" className="btn btn--small btn--ghost" onClick={() => removeExercise(i)}>Remove exercise</button>
          </div>
        </fieldset>
      ))}

      <div className="add-ex">
        <label className="field">
          <span>Add an exercise</span>
          <select value={pick} onChange={(e) => setPick(e.target.value)}>
            {exercises.map((ex) => (
              <option key={ex.id}>{ex.name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn--ghost" onClick={addExercise}>Add</button>
      </div>

      {error && <p className="form__error" role="alert">{error}</p>}

      <div className="form__actions">
        <button className="btn" type="submit">Save workout</button>
        {onCancel && <button className="btn btn--ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
