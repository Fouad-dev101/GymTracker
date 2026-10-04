import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useStore } from '../store/StoreContext';
import { Card, StatCard, Button, EmptyState } from '../components/ui';
import { BarChart, MuscleBalance, RingProgress } from '../components/Charts';
import {
  currentStreak,
  muscleBalance,
  personalRecords,
  sortedWorkouts,
  totalStats,
  weeklyVolume,
  workoutsThisWeek,
  workoutVolume,
  workoutSetCount,
} from '../utils/stats';
import {
  formatDayMonth,
  formatDuration,
  formatVolume,
  relativeDay,
  toISODate,
  startOfWeek,
} from '../utils/format';
import { MUSCLE_MAP } from '../data/exercises';

export default function Dashboard() {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const { profile, workouts, exercises, routines } = state;

  const stats = useMemo(() => totalStats(workouts), [workouts]);
  const recent = useMemo(() => sortedWorkouts(workouts).slice(0, 4), [workouts]);
  const weeks = useMemo(() => {
    const data = weeklyVolume(workouts, 10);
    const thisWeekKey = toISODate(startOfWeek(new Date()));
    return data.map((week) => ({
      key: week.date,
      label: formatDayMonth(week.date),
      value: week.volume,
      count: week.count,
      highlight: week.date === thisWeekKey,
    }));
  }, [workouts]);

  const balance = useMemo(() => muscleBalance(workouts, exercises, 30), [workouts, exercises]);
  const records = useMemo(() => personalRecords(workouts, exercises).slice(0, 5), [workouts, exercises]);
  const streak = useMemo(() => currentStreak(workouts), [workouts]);
  const thisWeek = workoutsThisWeek(workouts);

  const startRoutine = (routine) => {
    if (state.active) {
      navigate('/workout/active');
      return;
    }
    actions.startWorkout({ name: routine.name, exerciseIds: routine.exercises });
    navigate('/workout/active');
  };

  const startBlank = () => {
    if (state.active) {
      navigate('/workout/active');
      return;
    }
    actions.startWorkout({ name: `Séance du ${formatDayMonth(new Date())}`, exerciseIds: [] });
    navigate('/workout/active');
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon aprèm';
    return 'Bonsoir';
  })();

  return (
    <>
      <section className="hero">
        <h2>
          {greeting}, {profile.name} 👋
        </h2>
        <p>
          {workouts.length === 0
            ? "Ton historique est vide pour l'instant. Lance ta première séance ou charge des données de démo pour explorer l'application."
            : streak > 1
              ? `🔥 ${streak} jours d'affilée — continue comme ça. Tu as ${thisWeek} séance${thisWeek > 1 ? 's' : ''} cette semaine sur un objectif de ${profile.weeklyGoal}.`
              : `Tu as ${thisWeek} séance${thisWeek > 1 ? 's' : ''} cette semaine sur un objectif de ${profile.weeklyGoal}. C'est le moment de bouger.`}
        </p>

        <div className="hero-actions">
          <Button variant="primary" size="lg" icon="⚡" onClick={startBlank}>
            Démarrer une séance
          </Button>
          <Link to="/progress">
            <Button size="lg" icon="📈">Voir ma progression</Button>
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="value">{thisWeek} / {profile.weeklyGoal}</div>
            <div className="label">Séances cette semaine</div>
          </div>
          <div className="hero-stat">
            <div className="value">{streak} j</div>
            <div className="label">Série en cours</div>
          </div>
          <div className="hero-stat">
            <div className="value">{formatVolume(stats.volume, profile.unit)}</div>
            <div className="label">Volume total</div>
          </div>
          <div className="hero-stat">
            <div className="value">{stats.minutes} min</div>
            <div className="label">Temps total</div>
          </div>
        </div>
      </section>

      <div className="grid grid-4">
        <StatCard icon="🏋️" label="Séances" value={stats.workouts} hint="depuis le début" />
        <StatCard icon="📦" label="Volume" value={formatVolume(stats.volume, profile.unit)} hint="cumulé" tone="accent" />
        <StatCard icon="🔢" label="Séries" value={stats.sets.toLocaleString('fr-FR')} hint={`${stats.reps.toLocaleString('fr-FR')} répétitions`} />
        <StatCard icon="🏆" label="Records" value={records.length} hint="exercices avec PR" tone="info" />
      </div>

      {workouts.length === 0 ? (
        <Card title="Commence ici">
          <EmptyState
            emoji="🚀"
            title="Aucune séance enregistrée"
            text="Crée ta première séance, ou charge 3 mois de données fictives pour voir les graphiques se remplir."
            action={
              <div className="flex gap-10 justify-between" style={{ justifyContent: 'center' }}>
                <Button variant="primary" icon="⚡" onClick={startBlank}>Démarrer une séance</Button>
                <Button
                  icon="✨"
                  onClick={() => {
                    actions.loadDemo();
                  }}
                >
                  Charger la démo
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
            <Card
              title="Volume hebdomadaire"
              sub="10 dernières semaines"
              actions={<span className="badge accent">{profile.unit}</span>}
            >
              <BarChart data={weeks} formatValue={(v) => formatVolume(v, profile.unit)} />
              <div className="legend">
                <span><i className="dot" style={{ background: 'var(--accent)' }} /> Semaines passées</span>
                <span><i className="dot" style={{ background: 'var(--accent-2)' }} /> Semaine en cours</span>
              </div>
            </Card>

            <Card title="Objectif hebdo" sub={`${profile.weeklyGoal} séances par semaine`}>
              <div className="ring-wrap">
                <RingProgress
                  value={thisWeek}
                  max={Math.max(1, profile.weeklyGoal)}
                  big={`${thisWeek}/${profile.weeklyGoal}`}
                  small="séances"
                />
                <div>
                  <div className="bold text-lg">
                    {thisWeek >= profile.weeklyGoal ? 'Objectif atteint 🎉' : 'En route'}
                  </div>
                  <p className="muted text-sm" style={{ marginTop: 8 }}>
                    {thisWeek >= profile.weeklyGoal
                      ? 'Bravo, tu as validé ta semaine. Pense à la récupération.'
                      : `Encore ${profile.weeklyGoal - thisWeek} séance${profile.weeklyGoal - thisWeek > 1 ? 's' : ''} pour valider la semaine.`}
                  </p>
                </div>
              </div>

              <div className="divider" style={{ margin: '18px 0 12px' }} />

              <div className="section-title">Répartition (30 jours)</div>
              <div style={{ marginTop: 10 }}>
                <MuscleBalance data={balance.slice(0, 6)} />
              </div>
            </Card>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}>
            <Card
              title="Dernières séances"
              actions={
                <Link to="/workouts">
                  <Button size="sm" variant="ghost">Tout voir</Button>
                </Link>
              }
            >
              {recent.map((workout) => (
                <Link key={workout.id} to={`/workouts/${workout.id}`} className="row clickable">
                  <div className="grow">
                    <div className="title">{workout.name}</div>
                    <div className="meta">
                      {relativeDay(workout.date)} · {formatDuration(workout.durationSec)} ·{' '}
                      {workoutSetCount(workout)} séries
                    </div>
                  </div>
                  <div className="trailing">
                    <div className="bold tabnum">{formatVolume(workoutVolume(workout), profile.unit)}</div>
                    <div className="meta">volume</div>
                  </div>
                </Link>
              ))}
            </Card>

            <Card
              title="Records récents"
              sub="Meilleure charge estimée (1RM)"
              actions={
                <Link to="/progress">
                  <Button size="sm" variant="ghost">Détails</Button>
                </Link>
              }
            >
              {records.length === 0 ? (
                <p className="dim text-sm">Aucun record enregistré pour le moment.</p>
              ) : (
                records.map((record) => (
                  <div className="row" key={record.exerciseId}>
                    <span className="dot" style={{ background: MUSCLE_MAP[record.muscle]?.color || 'var(--accent)' }} />
                    <div className="grow">
                      <div className="title truncate">{record.name}</div>
                      <div className="meta">{relativeDay(record.date)}</div>
                    </div>
                    <div className="trailing">
                      <div className="bold tabnum">
                        {Math.round(record.e1rm * 10) / 10} {profile.unit}
                      </div>
                      <div className="meta">
                        {record.reps} × {Math.round(record.weight * 10) / 10} {profile.unit}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>
        </>
      )}

      <Card title="Démarrage rapide" sub="Reprends un de tes modèles d'entraînement">
        <div className="grid grid-4">
          {routines.slice(0, 4).map((routine) => (
            <div className="card flat" key={routine.id} style={{ padding: 16 }}>
              <div className="bold">{routine.name}</div>
              <div className="dim text-sm" style={{ marginTop: 6 }}>
                {routine.exercises.length} exercices
              </div>
              <Button
                variant="primary"
                size="sm"
                className="btn-block"
                style={{ marginTop: 14 }}
                onClick={() => startRoutine(routine)}
              >
                Démarrer
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
