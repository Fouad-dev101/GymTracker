# 🏋️ GymTracker

Application web de suivi sportif développée avec **React.js**. Elle permet de gérer ses
séances d'entraînement, d'enregistrer ses séries / répétitions / charges et de suivre sa
progression. Tout est sauvegardé localement dans le navigateur (LocalStorage) : aucun
backend requis.

Le projet est développé par **Mohamed** et **Fouad**.

---

## 🚀 Démarrage rapide

```bash
npm install     # installer les dépendances
npm start       # serveur de dev sur http://localhost:3000
npm run build   # bundle de production dans /build
npm test        # tests (React Testing Library + Jest)
```

> Le fichier `.env` lie le serveur de dev à `0.0.0.0` et désactive le contrôle d'hôte,
> ce qui permet d'ouvrir l'app depuis un autre appareil du réseau, un conteneur Docker
> ou une URL de prévisualisation.

---

## ✨ Fonctionnalités

### Tableau de bord
* Message de bienvenue, série de jours consécutifs, objectif hebdomadaire (anneau de progression)
* Statistiques clés : séances, volume total, séries, répétitions, temps total
* Volume hebdomadaire sur 10 semaines et répartition par groupe musculaire (30 jours)
* Dernières séances, derniers records, démarrage rapide depuis un modèle

### Séances
* **Historique** : regroupé par mois, recherche, suppression, « refaire cette séance »
* **Modèles (routines)** : Push / Pull / Legs / Full body fournis, création et édition
  de modèles personnalisés avec sélection d'exercices
* **Détail d'une séance** : durée, volume, séries, 1RM estimé par exercice, notes libres

### Séance en cours
* Chronomètre de séance, ajout d'exercices à la volée (recherche + filtres par muscle)
* Saisie rapide des séries avec pré-remplissage de la dernière série
* Rappel de la **dernière performance** (« Dernière fois : 3 × 60 kg »)
* Case de validation de série qui déclenche le **timer de repos** (+30 s, pause, reset)
* Création d'un exercice personnalisé sans quitter la séance

### Bibliothèque d'exercices
* 65+ exercices classés par groupe musculaire et matériel
* Recherche, filtres, création / modification / suppression d'exercices perso
* Fiche détaillée : record, 1RM estimé, 6 dernières performances

### Progression
* Courbe de force (1RM estimé, formule d'Epley) pour chaque exercice, avec évolution en %
* Volume par séance et volume hebdomadaire
* Tableau des records personnels et répartition musculaire

### Profil & réglages
* Prénom, objectif hebdo, temps de repos par défaut, unité **kg / lb**, thème **sombre / clair**
* Suivi du poids du corps avec courbe d'évolution
* Export / import des données en JSON, chargement de données de démo, réinitialisation

---

## 🛠️ Technologies

| Domaine        | Choix                                              |
| -------------- | -------------------------------------------------- |
| UI             | React 19 (fonctions + hooks)                        |
| Routing        | React Router v6 (`BrowserRouter`, routes imbriquées) |
| État           | Context API + `useReducer`                          |
| Persistance    | LocalStorage (clé `gymtracker:v1`)                  |
| Styles         | CSS natif avec variables CSS (thème clair / sombre)  |
| Graphiques     | Composons SVG maison (aucune dépendance)             |
| Build          | Create React App (`react-scripts 5`)                 |

---

## 📁 Structure du projet

```text
src/
├── App.jsx                 # providers (store, toasts) + routes
├── index.js                # point d'entrée React
├── index.css               # design system : tokens, thèmes, composants CSS
├── store/
│   └── StoreContext.jsx    # reducer, persistance LocalStorage, actions
├── data/
│   ├── exercises.js        # bibliothèque d'exercices + groupes musculaires
│   ├── routines.js         # modèles d'entraînement fournis
│   └── demo.js             # générateur de 3 mois d'historique fictif
├── utils/
│   ├── format.js           # dates, durées, conversions kg/lb
│   └── stats.js            # volume, 1RM, PR, séries, streaks
├── hooks/
│   └── useTimers.js        # chronomètre de séance + timer de repos
├── components/
│   ├── Layout.jsx          # sidebar, topbar, nav mobile, bandeau séance en cours
│   ├── ui.jsx              # Card, Button, Modal, Toast, EmptyState, Toggle…
│   ├── Charts.jsx          # BarChart, LineChart, RingProgress, MuscleBalance
│   ├── ExercisePicker.jsx  # sélecteur d'exercices (recherche + filtres)
│   └── ExerciseForm.jsx    # création / édition d'un exercice
└── pages/
    ├── Dashboard.jsx       # vue d'ensemble
    ├── Workouts.jsx        # historique + modèles
    ├── ActiveWorkout.jsx   # séance en cours
    ├── WorkoutDetail.jsx   # détail d'une séance
    ├── Exercises.jsx       # bibliothèque
    ├── Progress.jsx        # courbes et records
    └── Profile.jsx         # réglages, poids du corps, données
```

---

## 🗄️ Modèle de données

Les poids sont **toujours stockés en kg** et convertis à l'affichage selon l'unité
choisie dans le profil.

```js
{
  version: 1,
  profile: { name, unit: 'kg' | 'lb', theme, weeklyGoal, restTimer, bodyweight },
  exercises: [{ id, name, muscle, type: 'strength' | 'bodyweight' | 'time', equipment, custom }],
  routines:  [{ id, name, exercises: [exerciseId], custom }],
  workouts:  [{
    id, name, date: 'YYYY-MM-DD', startedAt, finishedAt, durationSec, notes,
    exercises: [{ id, exerciseId, name, sets: [{ id, reps, weight, seconds, done }] }]
  }],
  bodyweights: [{ id, date, weight }],
  active: null | { id, name, startedAt, notes, exercises: [...] }
}
```

---

## 🔮 Prochaines étapes

```text
React.js (local)  →  REST API  →  Laravel / Node.js  →  MySQL
```

* 🔐 Authentification et synchronisation cloud
* 📊 Statistiques avancées (RPE, tonnage par muscle, charge interne)
* 🔔 Rappels d'entraînement
* 🏆 Achievements / badges
* 🥗 Suivi nutrition
* 📱 Application mobile (PWA puis React Native)
* 🤖 Suggestions d'entraînement assistées par IA

---

## 📄 Licence

Projet personnel — Mohamed & Fouad.
