import React, { useEffect, useState } from 'react';
import { Button, Field, Modal } from './ui';
import { EQUIPMENT, MUSCLES } from '../data/exercises';

const TYPES = [
  { value: 'strength', label: 'Charge (répétitions + poids)' },
  { value: 'bodyweight', label: 'Poids du corps (répétitions)' },
  { value: 'time', label: 'Temps (durée en secondes)' },
];

const blank = {
  name: '',
  muscle: 'chest',
  type: 'strength',
  equipment: 'barbell',
};

export default function ExerciseForm({ open, exercise, onClose, onSave }) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    setForm(exercise ? { ...exercise } : blank);
  }, [exercise, open]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal
      open={open}
      title={exercise ? 'Modifier l’exercice' : 'Nouvel exercice'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            disabled={!form.name.trim()}
            onClick={() => onSave({ ...form, name: form.name.trim() })}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <Field label="Nom">
        <input
          className="input"
          value={form.name}
          placeholder="ex. Développé couché prise serrée"
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>

      <div className="grid grid-2" style={{ gap: 14 }}>
        <Field label="Groupe musculaire">
          <select className="select" value={form.muscle} onChange={(e) => set('muscle', e.target.value)}>
            {MUSCLES.map((muscle) => (
              <option key={muscle.key} value={muscle.key}>
                {muscle.emoji} {muscle.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Matériel">
          <select
            className="select"
            value={form.equipment}
            onChange={(e) => set('equipment', e.target.value)}
          >
            {EQUIPMENT.map((equipment) => (
              <option key={equipment.key} value={equipment.key}>
                {equipment.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Type de saisie" hint="Détermine quels champs apparaissent lors de l’enregistrement.">
        <select className="select" value={form.type} onChange={(e) => set('type', e.target.value)}>
          {TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </Field>
    </Modal>
  );
}
