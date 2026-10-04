import React, { useMemo, useState } from 'react';
import { Button, Modal, SearchInput } from './ui';
import { MUSCLES, MUSCLE_MAP, EQUIPMENT_MAP } from '../data/exercises';
import { timesUsed } from '../utils/stats';

/** Searchable exercise list inside a modal, with an optional "create" action. */
export default function ExercisePicker({
  open,
  exercises,
  workouts = [],
  onClose,
  onPick,
  onCreate,
  title = 'Ajouter un exercice',
}) {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('all');

  return (
    <Modal open={open} title={title} onClose={onClose} maxWidth={560}>
      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un exercice…" />

      <div className="chips">
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
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <ExerciseList
        exercises={exercises}
        workouts={workouts}
        query={query}
        muscle={muscle}
        onPick={(exercise) => {
          onPick?.(exercise);
          onClose?.();
        }}
      />

      {onCreate && (
        <Button variant="primary" icon="➕" block onClick={onCreate}>
          Créer un exercice personnalisé
        </Button>
      )}
    </Modal>
  );
}

/** Shared list markup (used by the picker and the Exercises page). */
export function ExerciseList({
  exercises = [],
  workouts = [],
  query = '',
  muscle = 'all',
  onPick,
  onEdit,
  onDelete,
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises
      .filter((ex) => muscle === 'all' || ex.muscle === muscle)
      .filter((ex) => !q || ex.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const usageA = timesUsed(workouts, a.id);
        const usageB = timesUsed(workouts, b.id);
        if (usageA !== usageB) return usageB - usageA;
        return a.name.localeCompare(b.name, 'fr');
      });
  }, [exercises, query, muscle, workouts]);

  if (!filtered.length) {
    return (
      <div className="empty" style={{ padding: 28 }}>
        <p>Aucun exercice ne correspond à ta recherche.</p>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: 420, overflow: 'auto', margin: '0 -4px' }}>
      {filtered.map((exercise) => {
        const usage = timesUsed(workouts, exercise.id);
        return (
          <div
            className="row clickable"
            key={exercise.id}
            onClick={() => onPick?.(exercise)}
            role={onPick ? 'button' : undefined}
          >
            <span className="dot" style={{ background: MUSCLE_MAP[exercise.muscle]?.color }} />
            <span className="grow">
              <span className="title" style={{ display: 'block' }}>{exercise.name}</span>
              <span className="meta">
                {MUSCLE_MAP[exercise.muscle]?.label} · {EQUIPMENT_MAP[exercise.equipment]?.label}
                {usage > 0 && ` · ${usage} séance${usage > 1 ? 's' : ''}`}
              </span>
            </span>
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(exercise);
                }}
              >
                ✏️
              </Button>
            )}
            {onDelete && exercise.custom && (
              <Button
                size="sm"
                variant="danger"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(exercise);
                }}
              >
                🗑
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
