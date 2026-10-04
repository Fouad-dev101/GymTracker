import React, { useMemo, useState } from 'react';

import { useStore } from '../store/StoreContext';
import {
  Button,
  Card,
  ConfirmDialog,
  Field,
  Segmented,
  StatCard,
  Toggle,
  useToast,
} from '../components/ui';
import { LineChart } from '../components/Charts';
import {
  currentStreak,
  longestStreak,
  sortedWorkouts,
  totalStats,
} from '../utils/stats';
import {
  formatDayMonth,
  formatDuration,
  fromDisplayWeight,
  toDisplayWeight,
  toISODate,
} from '../utils/format';

export default function Profile() {
  const { state, actions } = useStore();
  const toast = useToast();
  const { profile, workouts, bodyweights } = state;
  const unit = profile.unit;

  const [confirmReset, setConfirmReset] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(toISODate(new Date()));

  const stats = useMemo(() => totalStats(workouts), [workouts]);
  const streak = useMemo(() => currentStreak(workouts), [workouts]);
  const bestStreak = useMemo(() => longestStreak(workouts), [workouts]);
  const lastWorkouts = useMemo(() => sortedWorkouts(workouts).slice(0, 5), [workouts]);

  const weightPoints = useMemo(
    () =>
      bodyweights.map((entry) => ({
        date: entry.date,
        value: toDisplayWeight(entry.weight, unit),
      })),
    [bodyweights, unit]
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gymtracker-${toISODate(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Export téléchargé', 'success');
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.workouts)) {
          throw new Error('Format invalide');
        }
        actions.importData(parsed);
        toast('Données importées', 'success');
      } catch (error) {
        console.error(error);
        toast('Fichier invalide', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const addWeight = () => {
    const kg = fromDisplayWeight(weightInput, unit);
    if (!weightInput || !Number.isFinite(kg) || kg <= 0) {
      toast('Saisis un poids valide', 'error');
      return;
    }
    actions.addBodyweight(dateInput || toISODate(new Date()), kg);
    if (dateInput === toISODate(new Date())) {
      actions.updateProfile({ bodyweight: kg });
    }
    setWeightInput('');
    toast('Poids enregistré', 'success');
  };

  return (
    <>
      <div className="grid grid-4">
        <StatCard icon="🏋️" label="Séances" value={stats.workouts} hint={`${stats.minutes} min`} />
        <StatCard icon="🔥" label="Série en cours" value={`${streak} j`} hint={`record ${bestStreak} j`} tone="accent" />
        <StatCard icon="🔢" label="Séries" value={stats.sets.toLocaleString('fr-FR')} hint={`${stats.reps.toLocaleString('fr-FR')} répétitions`} />
        <StatCard
          icon="⚖️"
          label="Poids actuel"
          value={
            bodyweights.length
              ? `${Math.round(toDisplayWeight(bodyweights[bodyweights.length - 1].weight, unit) * 10) / 10} ${unit}`
              : '—'
          }
          hint={bodyweights.length > 1 ? `${bodyweights.length} relevés` : 'aucun relevé'}
          tone="info"
        />
      </div>

      <div className="grid grid-2">
        <Card title="Profil" sub="Ces infos personnalisent l’application">
          <div className="grid" style={{ gap: 16 }}>
            <Field label="Prénom / pseudo">
              <input
                className="input"
                value={profile.name}
                onChange={(e) => actions.updateProfile({ name: e.target.value })}
              />
            </Field>

            <div className="grid grid-2" style={{ gap: 14 }}>
              <Field label="Séances par semaine (objectif)">
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="14"
                  value={profile.weeklyGoal}
                  onChange={(e) =>
                    actions.updateProfile({
                      weeklyGoal: Math.min(14, Math.max(1, Number(e.target.value) || 1)),
                    })
                  }
                />
              </Field>

              <Field label="Repos par défaut (secondes)">
                <input
                  className="input"
                  type="number"
                  min="15"
                  step="15"
                  value={profile.restTimer}
                  onChange={(e) =>
                    actions.updateProfile({
                      restTimer: Math.max(15, Number(e.target.value) || 60),
                    })
                  }
                />
              </Field>
            </div>

            <Field label="Unité de poids">
              <Segmented
                value={profile.unit}
                onChange={(value) => actions.updateProfile({ unit: value })}
                options={[
                  { value: 'kg', label: 'Kilogrammes (kg)' },
                  { value: 'lb', label: 'Livres (lb)' },
                ]}
              />
            </Field>

            <div>
              <Toggle
                label="Thème sombre"
                hint="Bascule entre le mode clair et sombre"
                checked={profile.theme === 'dark'}
                onChange={(checked) =>
                  actions.updateProfile({ theme: checked ? 'dark' : 'light' })
                }
              />
            </div>
          </div>
        </Card>

        <Card title="Poids du corps" sub="Suis ton évolution semaine après semaine">
          <div className="grid grid-2" style={{ gap: 12 }}>
            <Field label="Date">
              <input
                className="input"
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
              />
            </Field>
            <Field label={`Poids (${unit})`}>
              <input
                className="input"
                type="number"
                step="0.1"
                placeholder={`ex. ${unit === 'lb' ? '165' : '75'}`}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
              />
            </Field>
          </div>
          <Button variant="primary" style={{ marginTop: 12 }} icon="➕" onClick={addWeight}>
            Ajouter le relevé
          </Button>

          {weightPoints.length >= 2 ? (
            <div style={{ marginTop: 18 }}>
              <LineChart
                points={weightPoints}
                color="var(--accent-2)"
                label="Poids du corps"
                formatValue={(v) => Math.round(v)}
                height={200}
              />
            </div>
          ) : (
            <p className="dim text-sm" style={{ marginTop: 16 }}>
              Ajoute au moins deux relevés pour voir la courbe.
            </p>
          )}

          {bodyweights.length > 0 && (
            <div style={{ marginTop: 12, maxHeight: 190, overflow: 'auto' }}>
              {bodyweights
                .slice()
                .reverse()
                .slice(0, 8)
                .map((entry) => (
                  <div className="row" key={entry.id}>
                    <div className="grow">
                      <div className="title">{formatDayMonth(entry.date)}</div>
                    </div>
                    <div className="trailing">
                      <span className="bold tabnum">
                        {Math.round(toDisplayWeight(entry.weight, unit) * 10) / 10} {unit}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => actions.deleteBodyweight(entry.id)}
                    >
                      🗑
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-2">
        <Card title="Données" sub="Tout est stocké localement dans ton navigateur">
          <div className="flex gap-10 wrap">
            <Button variant="primary" icon="⬇️" onClick={handleExport}>
              Exporter (JSON)
            </Button>
            <label className="btn" style={{ cursor: 'pointer' }}>
              <span aria-hidden="true">⬆️</span> Importer
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
            <Button
              icon="✨"
              onClick={() => {
                actions.loadDemo();
                toast('Données de démo chargées', 'success');
              }}
            >
              Charger la démo
            </Button>
            <Button variant="danger" icon="♻️" onClick={() => setConfirmReset(true)}>
              Tout réinitialiser
            </Button>
          </div>
          <p className="dim text-sm" style={{ marginTop: 14 }}>
            L’export contient tes séances, exercices, modèles et réglages. L’import remplace
            toutes les données actuelles.
          </p>
        </Card>

        <Card title="Récapitulatif">
          <div className="row">
            <div className="grow">Séances enregistrées</div>
            <div className="bold tabnum">{stats.workouts}</div>
          </div>
          <div className="row">
            <div className="grow">Temps total d’entraînement</div>
            <div className="bold tabnum">{formatDuration(stats.minutes * 60)}</div>
          </div>
          <div className="row">
            <div className="grow">Durée moyenne d’une séance</div>
            <div className="bold tabnum">
              {stats.workouts
                ? formatDuration(Math.round((stats.minutes * 60) / stats.workouts))
                : '—'}
            </div>
          </div>
          <div className="row">
            <div className="grow">Volume total soulevé</div>
            <div className="bold tabnum">
              {Math.round(toDisplayWeight(stats.volume, unit)).toLocaleString('fr-FR')} {unit}
            </div>
          </div>
          <div className="row">
            <div className="grow">Dernière séance</div>
            <div className="bold">
              {lastWorkouts[0] ? formatDayMonth(lastWorkouts[0].date) : '—'}
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Tout réinitialiser ?"
        message="Tes séances, tes exercices personnalisés et tes réglages seront supprimés. Cette action est irréversible."
        confirmLabel="Réinitialiser"
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          actions.resetAll();
          toast('Données réinitialisées');
        }}
      />
    </>
  );
}
