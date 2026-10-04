import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useStore } from '../store/StoreContext';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  SearchInput,
  Segmented,
  useToast,
} from '../components/ui';
import { MUSCLE_MAP, EQUIPMENT_MAP } from '../data/exercises';
import {
  groupByMonth,
  sortedWorkouts,
  workoutSetCount,
  workoutVolume,
} from '../utils/stats';
import { formatDuration, formatMonthYear, relativeDay } from '../utils/format';

function WorkoutCard({ workout, unit, onDelete }) {
  return (
    <div className="workout-card" style={{ marginBottom: 14 }}>
      <div className="wc-top">
        <div className="grow">
          <div className="wc-date">{relativeDay(workout.date)}</div>
          <div className="wc-name">{workout.name}</div>
        </div>
        <div className="trailing" style={{ textAlign: 'right' }}>
          <div className="text-xl tabnum">{workoutVolume(workout) > 0 ? `${Math.round(workoutVolume(workout))} ${unit}` : '—'}</div>
          <div className="dim" style={{ fontSize: 11.5 }}>volume</div>
        </div>
      </div>

      <div className="wc-meta">
        <span>⏱ {formatDuration(workout.durationSec)}</span>
        <span>🔢 {workoutSetCount(workout)} séries</span>
        <span>🏋️ {workout.exercises.length} exercices</span>
      </div>

      <div className="wc-exercises">
        {workout.exercises.slice(0, 6).map((entry) => (
          <span className="mini-tag" key={entry.id}>{entry.name}</span>
        ))}
        {workout.exercises.length > 6 && (
          <span className="mini-tag">+{workout.exercises.length - 6}</span>
        )}
      </div>

      <div className="flex gap-8" style={{ marginTop: 14 }}>
        <Link to={`/workouts/${workout.id}`}>
          <Button size="sm" variant="ghost">Détails</Button>
        </Link>
        <Button size="sm" variant="danger" onClick={() => onDelete(workout)}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}

function RoutineEditor({ open, routine, onClose, onSave }) {
  const { state } = useStore();
  const [name, setName] = useState(routine?.name || '');
  const [selected, setSelected] = useState(routine?.exercises || []);
  const [query, setQuery] = useState('');

  React.useEffect(() => {
    setName(routine?.name || '');
    setSelected(routine?.exercises || []);
    setQuery('');
  }, [routine, open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.exercises
      .filter((ex) => !q || ex.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [state.exercises, query]);

  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );

  return (
    <Modal
      open={open}
      title={routine ? 'Modifier le modèle' : 'Nouveau modèle'}
      onClose={onClose}
      maxWidth={620}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            disabled={!name.trim() || selected.length === 0}
            onClick={() => onSave({ name: name.trim(), exercises: selected })}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <Field label="Nom du modèle">
        <input
          className="input"
          value={name}
          placeholder="ex. Push lourd"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label={`Exercices (${selected.length} sélectionnés)`}>
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un exercice…" />
        <div
          style={{
            maxHeight: 280,
            overflow: 'auto',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginTop: 8,
          }}
        >
          {filtered.map((exercise) => {
            const isSelected = selected.includes(exercise.id);
            return (
              <button
                type="button"
                key={exercise.id}
                onClick={() => toggle(exercise.id)}
                className="row"
                style={{
                  padding: '10px 12px',
                  margin: 0,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--accent-soft)' : 'transparent',
                  textAlign: 'left',
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span className="dot" style={{ background: MUSCLE_MAP[exercise.muscle]?.color }} />
                <span className="grow">
                  <span className="title" style={{ display: 'block' }}>{exercise.name}</span>
                  <span className="meta">
                    {MUSCLE_MAP[exercise.muscle]?.label} · {EQUIPMENT_MAP[exercise.equipment]?.label}
                  </span>
                </span>
                <span className="badge" style={isSelected ? { background: 'var(--accent)', color: 'var(--accent-ink)' } : undefined}>
                  {isSelected ? '✓' : '+'}
                </span>
              </button>
            );
          })}
        </div>
      </Field>
    </Modal>
  );
}

export default function Workouts() {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const { unit } = state.profile;

  const [tab, setTab] = useState('history');
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedWorkouts(
      state.workouts.filter(
        (w) =>
          !q ||
          w.name.toLowerCase().includes(q) ||
          (w.exercises || []).some((e) => e.name.toLowerCase().includes(q))
      )
    );
  }, [state.workouts, query]);

  const months = useMemo(() => groupByMonth(filtered), [filtered]);

  const startRoutine = (routine) => {
    if (state.active) {
      toast('Une séance est déjà en cours', 'error');
      navigate('/workout/active');
      return;
    }
    actions.startWorkout({ name: routine.name, exerciseIds: routine.exercises });
    navigate('/workout/active');
  };

  const startFromPast = (workout) => {
    if (state.active) {
      toast('Une séance est déjà en cours', 'error');
      navigate('/workout/active');
      return;
    }
    actions.startWorkout({
      name: workout.name,
      exerciseIds: workout.exercises.map((e) => e.exerciseId),
    });
    navigate('/workout/active');
  };

  return (
    <>
      <div className="flex items-center gap-12 wrap">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'history', label: `Historique (${state.workouts.length})` },
            { value: 'routines', label: `Modèles (${state.routines.length})` },
          ]}
        />
        <div className="ml-auto" style={{ minWidth: 240 }}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={tab === 'history' ? 'Chercher une séance…' : 'Filtrer les modèles…'}
          />
        </div>
      </div>

      {tab === 'history' ? (
        <>
          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                emoji="🗓️"
                title={state.workouts.length === 0 ? 'Aucune séance' : 'Aucun résultat'}
                text={
                  state.workouts.length === 0
                    ? 'Ton historique apparaîtra ici dès que tu termines une séance.'
                    : 'Aucune séance ne correspond à ta recherche.'
                }
                action={
                  <Link to="/workout/active">
                    <Button variant="primary" icon="⚡">Démarrer une séance</Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            months.map((month) => (
              <div key={month.key}>
                <div className="section-title" style={{ margin: '8px 0 12px' }}>
                  {formatMonthYear(`${month.key}-01`)}
                </div>
                {month.items.map((workout) => (
                  <div key={workout.id}>
                    <WorkoutCard
                      workout={workout}
                      unit={unit}
                      onDelete={setPendingDelete}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: -6, marginBottom: 18 }}
                      onClick={() => startFromPast(workout)}
                    >
                      🔁 Refaire cette séance
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <div className="flex">
            <Button
              variant="primary"
              icon="➕"
              className="ml-auto"
              onClick={() => {
                setEditing(null);
                setEditorOpen(true);
              }}
            >
              Nouveau modèle
            </Button>
          </div>

          <div className="grid grid-3">
            {state.routines
              .filter((r) => !query.trim() || r.name.toLowerCase().includes(query.toLowerCase()))
              .map((routine) => (
                <Card
                  key={routine.id}
                  title={routine.name}
                  sub={`${routine.exercises.length} exercices`}
                  actions={
                    <span className="badge">{routine.custom ? 'Perso' : 'Standard'}</span>
                  }
                >
                  <div className="flex wrap gap-6">
                    {routine.exercises.slice(0, 8).map((id) => {
                      const exercise = state.exercises.find((e) => e.id === id);
                      if (!exercise) return null;
                      return (
                        <span className="mini-tag" key={id}>
                          {MUSCLE_MAP[exercise.muscle]?.emoji} {exercise.name}
                        </span>
                      );
                    })}
                    {routine.exercises.length > 8 && (
                      <span className="mini-tag">+{routine.exercises.length - 8}</span>
                    )}
                  </div>

                  <div className="flex gap-8" style={{ marginTop: 16 }}>
                    <Button variant="primary" size="sm" onClick={() => startRoutine(routine)}>
                      Démarrer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(routine);
                        setEditorOpen(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        actions.deleteRoutine(routine.id);
                        toast('Modèle supprimé');
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </>
      )}

      <RoutineEditor
        open={editorOpen}
        routine={editing}
        onClose={() => setEditorOpen(false)}
        onSave={(payload) => {
          if (editing) {
            actions.updateRoutine(editing.id, payload);
            toast('Modèle mis à jour', 'success');
          } else {
            actions.addRoutine({ ...payload, custom: true });
            toast('Modèle créé', 'success');
          }
          setEditorOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Supprimer la séance ?"
        message={`« ${pendingDelete?.name || ''} » sera définitivement retirée de ton historique.`}
        confirmLabel="Supprimer"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          actions.deleteWorkout(pendingDelete.id);
          toast('Séance supprimée');
        }}
      />
    </>
  );
}
