/**
 * Training routines (templates) offered out of the box.
 * They only reference exercise ids from the default library.
 */

export const DEFAULT_ROUTINES = [
  {
    id: 'rt-push',
    name: 'Push (Pecs / Épaules / Triceps)',
    exercises: [
      'ex-developpe-couche',
      'ex-developpe-halteres-assis',
      'ex-ecartes-halteres',
      'ex-elevations-laterales',
      'ex-extension-triceps-a-la-poulie',
      'ex-dips-triceps',
    ],
    custom: false,
  },
  {
    id: 'rt-pull',
    name: 'Pull (Dos / Biceps)',
    exercises: [
      'ex-tractions',
      'ex-rowing-barre',
      'ex-tirage-vertical',
      'ex-face-pull',
      'ex-curl-a-la-barre',
      'ex-curl-marteau',
    ],
    custom: false,
  },
  {
    id: 'rt-legs',
    name: 'Legs (Jambes / Fessiers)',
    exercises: [
      'ex-squat',
      'ex-presse-a-cuisses',
      'ex-fentes-bulgares',
      'ex-leg-curl',
      'ex-mollets-debout',
      'ex-crunch',
    ],
    custom: false,
  },
  {
    id: 'rt-fullbody',
    name: 'Full body débutant',
    exercises: [
      'ex-squat',
      'ex-developpe-couche',
      'ex-rowing-barre',
      'ex-developpe-militaire',
      'ex-crunch',
    ],
    custom: false,
  },
];
