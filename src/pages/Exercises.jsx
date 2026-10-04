import React, { useMemo, useState } from 'react';

import { useStore } from '../store/StoreContext';
import {
  Button,
  Card,
  ConfirmDialog,
  Modal,
  SearchInput,
  StatCard,
  useToast,
} from '../components/ui';
import ExerciseForm from '../components/ExerciseForm';
import { ExerciseList } from '../components/ExercisePicker';
import { MUSCLES, MUSCLE_MAP, EQUIPMENT_MAP } from '../data/exercises';
import { bestSetFor, exerciseHistory, timesUsed } from '../utils/stats';
import { formatDayMonth, toDisplayWeight } from '../utils/format';

function ExerciseDetail({ exercise, onClose }) {
  const { state } = useStore();
  const { unit } = state.profile;
  const history = useMemo(() => exerciseHistory(state.workouts, exercise.id).slice(-6), [
    state.workouts,
    exercise.id,
  ]);
  const best = bestSetFor(state.workouts, exercise.id);
  const usage = timesUsed(state.workouts, exercise.id);

  return (
    <Modal open={Boolean(exercise)} title={exercise?.name || ''} onClose={onClose} maxWidth={520}>
      <div className="flex gap-8 wrap">
        <span className="badge">{MUSCLE_MAP[exercise?.muscle]?.label}</span>
        <span className="badge info">{EQUIPMENT_MAP[exercise?.equipment]?.label}</span>
        <span className="badge">{usage} séance{usage > 1 ? 's' : ''}</span>
      </div>

      {best ? (
        <div className="card flat" style={{ padding: 16 }}>
          <div className="section-title">Record</div>
          <div className="text-xl" style={{ marginTop: 8 }}>
            {Math.round(toDisplayWeight(best.weight, unit) * 10) / 10} {unit} × {best.reps} rép
          </div>
          <div className="dim text-sm" style={{ marginTop: 4 }}>
            1RM estimé ≈ {Math.round(toDisplayWeight(best.e1rm, unit) * 10) / 10} {unit} ·{' '}
            {formatDayMonth(best.date)}
          </div>
        </div>
      ) : (
        <p className="dim text-sm">Pas encore utilisé dans une séance.</p>
      )}

      {history.length > 0 && (
        <div>
          <div className="section-title">Dernières performances</div>
          <div style={{ marginTop: 10 }}>
            {history
              .slice()
              .reverse()
              .map((point, index) => (
                <div className="row" key={`${point.date}-${index}`}>
                  <div className="grow">
                    <div className="title">{formatDayMonth(point.date)}</div>
                    <div className="meta">
                      {point.reps} rép · {Math.round(toDisplayWeight(point.weight, unit) * 10) / 10} {unit}
                    </div>
                  </div>
                  <div className="trailing">
                    <span className="badge accent">
                      1RM ≈ {Math.round(toDisplayWeight(point.e1rm, unit) * 10) / 10} {unit}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Exercises() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const customCount = state.exercises.filter((e) => e.custom).length;

  const byMuscle = useMemo(() => {
    const counts = new Map();
    state.exercises.forEach((exercise) => {
      counts.set(exercise.muscle, (counts.get(exercise.muscle) || 0) + 1);
    });
    return counts;
  }, [state.exercises]);

  return (
    <>
      <div className="grid grid-4">
        <StatCard icon="🏋️" label="Exercices" value={state.exercises.length} hint="dans la bibliothèque" />
        <StatCard icon="✨" label="Personnalisés" value={customCount} hint="créés par toi" tone="accent" />
        <StatCard icon="🎯" label="Groupes" value={byMuscle.size} hint="musculaires couverts" />
        <StatCard icon="🔥" label="Les plus utilisés" value={state.workouts.length} hint="séances enregistrées" tone="info" />
      </div>

      <Card
        title="Bibliothèque"
        sub="Clique sur un exercice pour voir son historique"
        actions={
          <Button
            variant="primary"
            icon="➕"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Nouvel exercice
          </Button>
        }
      >
        <div className="flex gap-12 wrap" style={{ marginBottom: 14 }}>
          <div className="grow" style={{ minWidth: 220 }}>
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un exercice…" />
          </div>
        </div>

        <div className="chips" style={{ marginBottom: 6 }}>
          <button
            type="button"
            className={`chip ${muscle === 'all' ? 'active' : ''}`}
            onClick={() => setMuscle('all')}
          >
            Tous
          </button>
          {MUSCLES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`chip ${muscle === m.key ? 'active' : ''}`}
              onClick={() => setMuscle(m.key)}
            >
              {m.emoji} {m.label} ({byMuscle.get(m.key) || 0})
            </button>
          ))}
        </div>

        <ExerciseList
          exercises={state.exercises}
          workouts={state.workouts}
          query={query}
          muscle={muscle}
          onPick={setDetail}
          onEdit={(exercise) => {
            setEditing(exercise);
            setFormOpen(true);
          }}
          onDelete={setPendingDelete}
        />
      </Card>

      <ExerciseForm
        open={formOpen}
        exercise={editing}
        onClose={() => setFormOpen(false)}
        onSave={(payload) => {
          if (editing) {
            actions.updateExercise(editing.id, payload);
            toast('Exercice mis à jour', 'success');
          } else {
            actions.addExercise(payload);
            toast('Exercice créé', 'success');
          }
          setFormOpen(false);
        }}
      />

      {detail && <ExerciseDetail exercise={detail} onClose={() => setDetail(null)} />}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Supprimer l’exercice ?"
        message={`« ${pendingDelete?.name || ''} » sera retiré de la bibliothèque. L’historique reste intact.`}
        confirmLabel="Supprimer"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          actions.deleteExercise(pendingDelete.id);
          toast('Exercice supprimé');
        }}
      />
    </>
  );
}
