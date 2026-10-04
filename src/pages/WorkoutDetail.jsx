import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useStore } from '../store/StoreContext';
import { Button, Card, ConfirmDialog, EmptyState, Field, useToast } from '../components/ui';
import { MUSCLE_MAP } from '../data/exercises';
import { estimated1RM, workoutSetCount, workoutVolume } from '../utils/stats';
import {
  formatDuration,
  formatLongDate,
  toDisplayWeight,
  unitLabel,
} from '../utils/format';

export default function WorkoutDetail() {
  const { id } = useParams();
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = state;
  const unit = profile.unit;

  const workout = useMemo(() => state.workouts.find((w) => w.id === id), [state.workouts, id]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes] = useState(workout?.notes || '');

  // Re-sync the local note editor whenever another workout is opened.
  React.useEffect(() => setNotes(workout?.notes || ''), [workout?.id, workout?.notes]);

  if (!workout) {
    return (
      <Card>
        <EmptyState
          emoji="🔍"
          title="Séance introuvable"
          text="Elle a peut-être été supprimée."
          action={
            <Link to="/workouts">
              <Button variant="primary">Retour à l’historique</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const volume = workoutVolume(workout);
  const sets = workoutSetCount(workout);

  return (
    <>
      <div className="flex items-center gap-10 wrap">
        <Link to="/workouts">
          <Button variant="ghost" size="sm">← Historique</Button>
        </Link>
        <div className="ml-auto flex gap-8">
          <Button
            size="sm"
            icon="🔁"
            onClick={() => {
              if (state.active) {
                toast('Une séance est déjà en cours', 'error');
                return;
              }
              actions.startWorkout({
                name: workout.name,
                exerciseIds: workout.exercises.map((e) => e.exerciseId),
              });
              navigate('/workout/active');
            }}
          >
            Refaire
          </Button>
          <Button size="sm" variant="danger" icon="🗑" onClick={() => setConfirmDelete(true)}>
            Supprimer
          </Button>
        </div>
      </div>

      <section className="hero">
        <h2>{workout.name}</h2>
        <p>{formatLongDate(workout.date)}</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="value">{formatDuration(workout.durationSec)}</div>
            <div className="label">Durée</div>
          </div>
          <div className="hero-stat">
            <div className="value">{Math.round(toDisplayWeight(volume, unit))} {unit}</div>
            <div className="label">Volume total</div>
          </div>
          <div className="hero-stat">
            <div className="value">{sets}</div>
            <div className="label">Séries</div>
          </div>
          <div className="hero-stat">
            <div className="value">{workout.exercises.length}</div>
            <div className="label">Exercices</div>
          </div>
        </div>
      </section>

      {workout.exercises.map((entry) => {
        const exercise = state.exercises.find((e) => e.id === entry.exerciseId);
        const isTime = exercise?.type === 'time';
        const best = entry.sets.reduce(
          (acc, set) => (estimated1RM(set) > (acc?.e1rm || 0) ? { ...set, e1rm: estimated1RM(set) } : acc),
          null
        );

        return (
          <Card
            key={entry.id}
            title={entry.name}
            sub={`${MUSCLE_MAP[exercise?.muscle]?.label || 'Exercice'} · ${entry.sets.length} séries`}
            actions={
              best && best.e1rm > 0 ? (
                <span className="badge accent">
                  1RM ≈ {Math.round(toDisplayWeight(best.e1rm, unit) * 10) / 10} {unit}
                </span>
              ) : null
            }
          >
            <div className="set-row head" style={{ padding: '6px 0' }}>
              <span>#</span>
              <span>{isTime ? 'Durée' : 'Répétitions'}</span>
              <span>{isTime ? 'Distance / Poids' : `Poids (${unitLabel(unit)})`}</span>
              <span className="right">Volume</span>
              <span />
            </div>
            {entry.sets.map((set, index) => {
              const setVol = isTime ? 0 : (Number(set.reps) || 0) * (Number(set.weight) || 0);
              return (
                <div className="set-row" style={{ padding: '10px 0' }} key={set.id}>
                  <span className="set-index">{index + 1}</span>
                  <span className="tabnum center">
                    {isTime ? `${Math.round((set.seconds || 0) / 60)} min` : set.reps}
                  </span>
                  <span className="tabnum center">
                    {set.weight ? `${Math.round(toDisplayWeight(set.weight, unit) * 10) / 10}` : '—'}
                  </span>
                  <span className="tabnum right dim" style={{ fontSize: 12.5 }}>
                    {setVol ? Math.round(toDisplayWeight(setVol, unit)) : '—'}
                  </span>
                  <span />
                </div>
              );
            })}
          </Card>
        );
      })}

      <Card title="Notes">
        <Field label="Notes de séance">
          <textarea
            className="textarea"
            value={notes}
            placeholder="Ressenti, charge perçue, points à améliorer…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        <Button
          variant="primary"
          style={{ marginTop: 12 }}
          onClick={() => {
            actions.updateWorkout(workout.id, { notes });
            toast('Notes enregistrées', 'success');
          }}
        >
          Enregistrer les notes
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer la séance ?"
        message="Cette action est définitive."
        confirmLabel="Supprimer"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          actions.deleteWorkout(workout.id);
          toast('Séance supprimée');
          navigate('/workouts');
        }}
      />
    </>
  );
}
