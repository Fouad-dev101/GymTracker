import React, { useMemo, useState } from 'react';

import { useStore } from '../store/StoreContext';
import { Card, EmptyState, StatCard } from '../components/ui';
import { LineChart, BarChart, MuscleBalance } from '../components/Charts';
import { MUSCLE_MAP } from '../data/exercises';
import {
  exerciseHistory,
  muscleBalance,
  personalRecords,
  sortedWorkouts,
  totalStats,
  weeklyVolume,
  workoutVolume,
} from '../utils/stats';
import {
  formatDayMonth,
  toDisplayWeight,
} from '../utils/format';
import { Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';

export default function Progress() {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const { profile, workouts, exercises } = state;
  const unit = profile.unit;

  const sorted = useMemo(() => sortedWorkouts(workouts), [workouts]);
  const stats = useMemo(() => totalStats(workouts), [workouts]);
  const records = useMemo(() => personalRecords(workouts, exercises), [workouts, exercises]);
  const balance = useMemo(() => muscleBalance(workouts, exercises, 30), [workouts, exercises]);
  const weeks = useMemo(() => weeklyVolume(workouts, 12), [workouts]);

  const withHistory = useMemo(
    () =>
      exercises
        .filter((exercise) => exerciseHistory(workouts, exercise.id).length >= 2)
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    [exercises, workouts]
  );

  const [selectedId, setSelectedId] = useState('');
  const activeId = selectedId || withHistory[0]?.id || '';

  const history = useMemo(() => exerciseHistory(workouts, activeId), [workouts, activeId]);
  const chartPoints = history.map((point) => ({
    date: point.date,
    value: toDisplayWeight(point.e1rm, unit),
  }));

  const first = chartPoints[0]?.value || 0;
  const last = chartPoints[chartPoints.length - 1]?.value || 0;
  const delta = first > 0 ? ((last - first) / first) * 100 : 0;

  const sessionPoints = useMemo(
    () =>
      sorted
        .slice(0, 20)
        .reverse()
        .map((workout) => ({
          date: workout.date,
          value: toDisplayWeight(workoutVolume(workout), unit),
        })),
    [sorted, unit]
  );

  const bestWeek = useMemo(
    () => weeks.reduce((best, week) => (week.volume > (best?.volume || 0) ? week : best), null),
    [weeks]
  );

  const selectedExercise = exercises.find((e) => e.id === activeId);

  if (workouts.length === 0) {
    return (
      <Card>
        <EmptyState
          emoji="📈"
          title="Pas encore de données"
          text="Enregistre quelques séances (ou charge la démo) pour voir tes courbes de progression."
          action={
            <div className="flex gap-10" style={{ justifyContent: 'center' }}>
              <Button variant="primary" onClick={() => navigate('/workout/active')}>
                Démarrer une séance
              </Button>
              <Button onClick={() => actions.loadDemo()}>Charger la démo</Button>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-4">
        <StatCard icon="🏋️" label="Séances" value={stats.workouts} hint={`${stats.minutes} min au total`} />
        <StatCard
          icon="📦"
          label="Volume total"
          value={`${Math.round(toDisplayWeight(stats.volume, unit)).toLocaleString('fr-FR')} ${unit}`}
          hint="cumulé"
          tone="accent"
        />
        <StatCard
          icon="🔥"
          label="Meilleure semaine"
          value={bestWeek ? `${Math.round(toDisplayWeight(bestWeek.volume, unit)).toLocaleString('fr-FR')} ${unit}` : '—'}
          hint={bestWeek ? `${bestWeek.count} séances` : ''}
        />
        <StatCard icon="🏆" label="Records" value={records.length} hint="exercices suivis" tone="info" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}>
        <Card
          title="Force par exercice"
          sub="1RM estimé (formule d’Epley)"
          actions={
            <select
              className="select"
              style={{ maxWidth: 230 }}
              value={activeId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {withHistory.length === 0 && <option value="">Aucun historique</option>}
              {withHistory.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          }
        >
          {chartPoints.length >= 2 ? (
            <>
              <div className="flex items-center gap-16 wrap" style={{ marginBottom: 12 }}>
                <div>
                  <div className="label">Actuel</div>
                  <div className="text-xl tabnum">
                    {Math.round(last * 10) / 10} {unit}
                  </div>
                </div>
                <div>
                  <div className="label">Départ</div>
                  <div className="text-xl tabnum">
                    {Math.round(first * 10) / 10} {unit}
                  </div>
                </div>
                <div>
                  <div className="label">Évolution</div>
                  <div
                    className="text-xl tabnum"
                    style={{ color: delta >= 0 ? 'var(--accent)' : 'var(--danger)' }}
                  >
                    {delta >= 0 ? '+' : ''}
                    {Math.round(delta * 10) / 10} %
                  </div>
                </div>
                <div>
                  <div className="label">Séances</div>
                  <div className="text-xl tabnum">{chartPoints.length}</div>
                </div>
              </div>

              <LineChart
                points={chartPoints}
                label={`Progression ${selectedExercise?.name || ''}`}
                formatValue={(v) => `${Math.round(v)}`}
              />
              <p className="dim text-sm" style={{ marginTop: 10 }}>
                {selectedExercise?.name} — valeurs converties en {unit}.
              </p>
            </>
          ) : (
            <EmptyState
              emoji="📊"
              title="Pas assez de données"
              text="Il faut au moins deux séances avec cet exercice pour tracer une courbe."
            />
          )}
        </Card>

        <Card title="Records personnels" sub="Meilleur 1RM estimé par exercice">
          <div style={{ maxHeight: 430, overflow: 'auto' }}>
            {records.slice(0, 12).map((record) => (
              <div className="row" key={record.exerciseId}>
                <span className="dot" style={{ background: MUSCLE_MAP[record.muscle]?.color }} />
                <div className="grow">
                  <div className="title truncate">{record.name}</div>
                  <div className="meta">
                    {record.reps} × {Math.round(toDisplayWeight(record.weight, unit) * 10) / 10} {unit} ·{' '}
                    {formatDayMonth(record.date)}
                  </div>
                </div>
                <div className="trailing">
                  <span className="badge accent tabnum">
                    {Math.round(toDisplayWeight(record.e1rm, unit) * 10) / 10} {unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card title="Volume par séance" sub="20 dernières séances">
          <LineChart
            points={sessionPoints}
            color="var(--accent-2)"
            label="Volume par séance"
            formatValue={(v) => `${Math.round(v)}`}
            height={220}
          />
        </Card>

        <Card title="Volume hebdomadaire" sub="12 dernières semaines">
          <BarChart
            data={weeks.map((week) => ({
              key: week.date,
              label: formatDayMonth(week.date),
              value: week.volume,
            }))}
            formatValue={(v) => Math.round(toDisplayWeight(v, unit)).toLocaleString('fr-FR')}
          />
          <div className="divider" style={{ margin: '18px 0 12px' }} />
          <div className="section-title">Répartition (30 jours)</div>
          <div style={{ marginTop: 10 }}>
            <MuscleBalance data={balance} />
          </div>
        </Card>
      </div>
    </>
  );
}
