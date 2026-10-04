import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStore } from '../store/StoreContext';
import { useCountdown, useElapsed } from '../hooks/useTimers';
import { Button, Card, ConfirmDialog, EmptyState, Field, useToast } from '../components/ui';
import ExercisePicker from '../components/ExercisePicker';
import ExerciseForm from '../components/ExerciseForm';
import { MUSCLE_MAP, EQUIPMENT_MAP } from '../data/exercises';
import { isLoggedSet, lastEntryFor, workoutVolume } from '../utils/stats';
import {
  formatClock,
  formatDayMonth,
  fromDisplayWeight,
  toDisplayWeight,
  unitLabel,
} from '../utils/format';

/* ── Helpers ───────────────────────────────────────────────── */

const round1 = (n) => Math.round(n * 10) / 10;

const weightToDisplay = (value, unit) =>
  value === '' || value === null || value === undefined ? '' : round1(toDisplayWeight(Number(value), unit));

const setsSummary = (entry, unit) =>
  (entry.sets || [])
    .map((set) =>
      set.seconds
        ? `${Math.round(set.seconds / 60)} min`
        : `${set.reps} × ${round1(toDisplayWeight(set.weight, unit))}`
    )
    .join(' · ');

/* ── Start screen ──────────────────────────────────────────── */

function StartScreen() {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState(`Séance du ${formatDayMonth(new Date())}`);

  const start = (exerciseIds, workoutName) => {
    actions.startWorkout({ name: workoutName || name || 'Séance', exerciseIds });
    navigate('/workout/active');
  };

  const lastWorkout = state.workouts[state.workouts.length - 1];

  return (
    <>
      <Card title="Nouvelle séance" sub="Choisis un modèle ou pars d’une page blanche">
        <Field label="Nom de la séance">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <div className="flex gap-10 wrap" style={{ marginTop: 16 }}>
          <Button variant="primary" icon="⚡" onClick={() => start([])}>
            Séance libre
          </Button>
          {lastWorkout && (
            <Button
              icon="🔁"
              onClick={() =>
                start(
                  lastWorkout.exercises.map((e) => e.exerciseId),
                  lastWorkout.name
                )
              }
            >
              Reprendre « {lastWorkout.name} »
            </Button>
          )}
        </div>
      </Card>

      <div className="section-title">Modèles</div>
      {state.routines.length === 0 ? (
        <Card>
          <EmptyState
            emoji="📋"
            title="Aucun modèle"
            text="Crée des modèles depuis la page Séances pour démarrer plus vite."
          />
        </Card>
      ) : (
        <div className="grid grid-3">
          {state.routines.map((routine) => (
            <Card
              key={routine.id}
              title={routine.name}
              sub={`${routine.exercises.length} exercices`}
            >
              <div className="flex wrap gap-6">
                {routine.exercises.slice(0, 6).map((id) => {
                  const exercise = state.exercises.find((e) => e.id === id);
                  return exercise ? (
                    <span className="mini-tag" key={id}>
                      {MUSCLE_MAP[exercise.muscle]?.emoji} {exercise.name}
                    </span>
                  ) : null;
                })}
              </div>
              <Button
                variant="primary"
                className="btn-block"
                style={{ marginTop: 16 }}
                onClick={() => start(routine.exercises, routine.name)}
              >
                Démarrer ce modèle
              </Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ── One set row ───────────────────────────────────────────── */

function SetRow({ entry, set, index, unit, onToggleDone }) {
  const { actions } = useStore();
  const isTime = entry.type === 'time';

  const update = (patch) => actions.updateSet(entry.id, set.id, patch);

  return (
    <div className={`set-row ${set.done ? 'done' : ''}`}>
      <span className="set-index">{index + 1}</span>

      {isTime ? (
        <input
          className="set-input"
          type="number"
          inputMode="numeric"
          min="0"
          step="15"
          placeholder="sec"
          value={set.seconds === '' || set.seconds === null ? '' : set.seconds}
          onChange={(e) => update({ seconds: e.target.value === '' ? '' : Number(e.target.value) })}
        />
      ) : (
        <input
          className="set-input"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="réps"
          value={set.reps === '' || set.reps === null ? '' : set.reps}
          onChange={(e) => update({ reps: e.target.value === '' ? '' : Number(e.target.value) })}
        />
      )}

      <input
        className="set-input"
        type="number"
        inputMode="decimal"
        min="0"
        step={unit === 'lb' ? '5' : '2.5'}
        placeholder={unitLabel(unit)}
        value={weightToDisplay(set.weight, unit)}
        onChange={(e) =>
          update({ weight: e.target.value === '' ? '' : fromDisplayWeight(e.target.value, unit) })
        }
      />

      <button
        type="button"
        className={`check-btn ${set.done ? 'on' : ''}`}
        aria-label={set.done ? 'Série validée' : 'Valider la série'}
        title={set.done ? 'Série validée' : 'Valider la série'}
        onClick={() => onToggleDone(entry, set)}
      >
        {set.done ? '✓' : ''}
      </button>

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ padding: 4, width: 26, height: 26, minHeight: 26 }}
        aria-label="Supprimer la série"
        title="Supprimer la série"
        onClick={() => actions.deleteSet(entry.id, set.id)}
      >
        ✕
      </button>
    </div>
  );
}

/* ── One exercise block ────────────────────────────────────── */

function ExerciseBlock({ entry, unit, onToggleDone }) {
  const { state, actions } = useStore();
  const exercise = state.exercises.find((e) => e.id === entry.exerciseId);
  const type = exercise?.type || 'strength';
  const previous = lastEntryFor(state.workouts, entry.exerciseId);
  const volume = workoutVolume({
    exercises: [{ ...entry, sets: entry.sets.filter((s) => isLoggedSet(s)) }],
  });

  return (
    <div className="ex-block">
      <div className="ex-block-head">
        <span className="dot" style={{ background: MUSCLE_MAP[exercise?.muscle]?.color || 'var(--accent)' }} />
        <div className="grow">
          <div className="name">{entry.name}</div>
          <div className="meta">
            {MUSCLE_MAP[exercise?.muscle]?.label || 'Exercice'} ·{' '}
            {EQUIPMENT_MAP[exercise?.equipment]?.label || '—'}
            {volume > 0 && ` · ${Math.round(toDisplayWeight(volume, unit))} ${unit}`}
          </div>
        </div>
        <Button
          size="sm"
          variant="danger"
          onClick={() => actions.removeEntry(entry.id)}
          title="Retirer l’exercice"
        >
          Retirer
        </Button>
      </div>

      {previous && (
        <div className="prev-hint">
          Dernière fois ({formatDayMonth(previous.date)}) : {setsSummary(previous.entry, unit) || '—'}
        </div>
      )}

      <div className="set-row head">
        <span>#</span>
        <span>{type === 'time' ? 'Durée (s)' : 'Répétitions'}</span>
        <span>Poids ({unit})</span>
        <span />
        <span />
      </div>

      {entry.sets.map((set, index) => (
        <SetRow
          key={set.id}
          entry={{ ...entry, type }}
          set={set}
          index={index}
          unit={unit}
          onToggleDone={onToggleDone}
        />
      ))}

      <div style={{ padding: 12 }}>
        <Button variant="ghost" size="sm" icon="➕" onClick={() => actions.addSet(entry.id)}>
          Ajouter une série
        </Button>
      </div>
    </div>
  );
}

/* ── Session in progress ───────────────────────────────────── */

function Session() {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const { profile, active, exercises, workouts } = state;
  const unit = profile.unit;

  const elapsed = useElapsed(active.startedAt);
  const rest = useCountdown(profile.restTimer);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const wasRunning = useRef(false);

  useEffect(() => {
    if (rest.running) wasRunning.current = true;
    if (!rest.running && wasRunning.current && rest.remaining === 0) {
      wasRunning.current = false;
      toast('Repos terminé — à toi ! 💪', 'success');
    }
  }, [rest.running, rest.remaining, toast]);

  const handleToggleDone = (entry, set) => {
    const nextDone = !set.done;
    actions.updateSet(entry.id, set.id, { done: nextDone });
    if (nextDone) rest.start(profile.restTimer);
  };

  const doneSets = active.exercises.reduce(
    (total, entry) => total + entry.sets.filter((s) => isLoggedSet(s)).length,
    0
  );
  const liveVolume = workoutVolume({
    exercises: active.exercises.map((entry) => ({
      ...entry,
      sets: entry.sets.filter((s) => isLoggedSet(s)),
    })),
  });

  const handleFinish = () => {
    if (doneSets === 0) {
      toast('Valide au moins une série avant de terminer', 'error');
      return;
    }
    const id = active.id;
    actions.finishWorkout();
    toast('Séance enregistrée 🎉', 'success');
    navigate(`/workouts/${id}`);
  };

  return (
    <>
      <Card>
        <div className="flex items-center gap-12 wrap">
          <div className="grow" style={{ minWidth: 200 }}>
            <input
              className="input"
              style={{ fontSize: 18, fontWeight: 700 }}
              value={active.name}
              onChange={(e) => actions.renameActive(e.target.value)}
              placeholder="Nom de la séance"
            />
            <div className="dim text-sm" style={{ marginTop: 8 }}>
              ⏱ {formatClock(elapsed)} · {active.exercises.length} exercice
              {active.exercises.length > 1 ? 's' : ''} · {doneSets} série{doneSets > 1 ? 's' : ''} ·{' '}
              {Math.round(toDisplayWeight(liveVolume, unit))} {unit}
            </div>
          </div>
          <Button variant="danger" onClick={() => setConfirmCancel(true)}>
            Annuler
          </Button>
          <Button variant="primary" icon="✅" onClick={handleFinish}>
            Terminer
          </Button>
        </div>
      </Card>

      {active.exercises.length === 0 ? (
        <Card>
          <EmptyState
            emoji="🏋️"
            title="Ajoute ton premier exercice"
            text="Cherche dans la bibliothèque ou crée ton propre mouvement."
            action={
              <Button variant="primary" icon="➕" onClick={() => setPickerOpen(true)}>
                Ajouter un exercice
              </Button>
            }
          />
        </Card>
      ) : (
        active.exercises.map((entry) => (
          <ExerciseBlock
            key={entry.id}
            entry={entry}
            unit={unit}
            onToggleDone={handleToggleDone}
          />
        ))
      )}

      {active.exercises.length > 0 && (
        <Button variant="primary" icon="➕" size="lg" block onClick={() => setPickerOpen(true)}>
          Ajouter un exercice
        </Button>
      )}

      <div style={{ height: rest.running || rest.remaining < profile.restTimer ? 90 : 0 }} />

      {(rest.running || rest.remaining < profile.restTimer) && (
        <div className="timer-bar">
          <span aria-hidden="true" style={{ fontSize: 22 }}>⏳</span>
          <div className="time">{formatClock(rest.remaining)}</div>
          <div className="grow">
            <div className="bold" style={{ fontSize: 13 }}>Repos</div>
            <div className="dim" style={{ fontSize: 12 }}>
              {rest.running ? 'Récupère, la prochaine série arrive' : 'Timer en pause'}
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => rest.addTime(30)}>+30 s</Button>
          <Button
            size="sm"
            variant={rest.running ? 'default' : 'primary'}
            onClick={() => (rest.running ? rest.pause() : rest.start(rest.remaining || profile.restTimer))}
          >
            {rest.running ? 'Pause' : 'Reprendre'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => rest.reset(profile.restTimer)}>
            Reset
          </Button>
        </div>
      )}

      <ExercisePicker
        open={pickerOpen}
        exercises={exercises}
        workouts={workouts}
        onClose={() => setPickerOpen(false)}
        onPick={(exercise) => actions.addExerciseToActive(exercise)}
        onCreate={() => {
          setPickerOpen(false);
          setFormOpen(true);
        }}
      />

      <ExerciseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(payload) => {
          const created = actions.addExercise(payload);
          actions.addExerciseToActive(created);
          toast('Exercice créé et ajouté à la séance', 'success');
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={confirmCancel}
        title="Annuler la séance ?"
        message="Les séries enregistrées seront perdues."
        confirmLabel="Annuler la séance"
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => {
          actions.cancelWorkout();
          toast('Séance annulée');
          navigate('/');
        }}
      />
    </>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default function ActiveWorkout() {
  const { state } = useStore();
  return state.active ? <Session /> : <StartScreen />;
}
