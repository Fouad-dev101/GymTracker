export default function ExerciseCard({ exercise, onDelete, onSelect }) {
  const muscleClass = `muscle-${exercise.muscle.toLowerCase()}`;

  return (
    <article className={`exercise-card ${muscleClass}`}>
      <div className="exercise-card__body">
        <h3>{exercise.name}</h3>
        <p className="exercise-card__tags">
          {exercise.muscle} — {exercise.equipment}
        </p>
        {exercise.notes && <p className="exercise-card__notes">{exercise.notes}</p>}
      </div>

      {(onSelect || onDelete) && (
        <div className="exercise-card__actions">
          {onSelect && (
            <button className="btn btn--small" onClick={() => onSelect(exercise)}>
              Add to workout
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn--small btn--ghost"
              onClick={() => onDelete(exercise.id)}
              aria-label={`Delete ${exercise.name}`}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}
