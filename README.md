# 🏋️ GymTracker

GymTracker est une application web de suivi sportif développée avec **React.js**.
Elle permet aux utilisateurs de gérer leurs entraînements, suivre leurs exercices et consulter leur progression.

Le projet est développé par **Mohamed** et **Fouad**.

---

## 🚀 Objectif du projet

Créer une application simple et moderne permettant de :

* 🏋️ Créer et gérer des séances d'entraînement
* 💪 Ajouter des exercices
* 🔢 Enregistrer les séries, répétitions et poids
* 📅 Consulter l'historique des séances
* 📈 Suivre la progression
* 👤 Gérer son profil
* 💾 Sauvegarder les données localement

Le projet commencera avec **React.js uniquement** et pourra évoluer vers une architecture complète avec Backend et Base de données.

---

## 🛠️ Technologies

### Version actuelle

* React.js
* JavaScript
* React Router
* Context API
* LocalStorage
* CSS / Tailwind CSS
* Vite
* Git & GitHub

### 🔮 Évolutions futures

```text
React.js
    ↓
REST API
    ↓
Laravel / Node.js
    ↓
MySQL
```

Fonctionnalités prévues :

* 🔐 Authentication
* ☁️ Synchronisation des données
* 📊 Statistiques avancées
* 🔔 Notifications
* 🏆 Achievements
* 🥗 Nutrition tracking
* 📱 Application mobile
* 🤖 Fonctionnalités basées sur l'IA

---

## 📂 Structure du projet

```text
gymtracker/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── WorkoutCard.jsx
│   │   └── ExerciseCard.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Workouts.jsx
│   │   ├── WorkoutDetails.jsx
│   │   ├── Exercises.jsx
│   │   ├── Progress.jsx
│   │   └── Profile.jsx
│   │
│   ├── context/
│   │   └── GymContext.jsx
│   │
│   ├── data/
│   │   └── exercises.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── README.md
```

---

## ⚙️ Installation

### 1. Cloner le projet

```bash
git clone <URL_DU_REPOSITORY>
```

### 2. Entrer dans le projet

```bash
cd gymtracker
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Lancer le projet

```bash
npm run dev
```

L'application sera disponible sur l'adresse affichée par Vite.

---

## 👥 Équipe

### Mohamed

Responsabilités principales :

* Dashboard
* Workouts
* Workout Details
* Context API
* Gestion des données
* LocalStorage
* Progress

### Fouad

Responsabilités principales :

* UI/UX
* Components
* Navbar / Sidebar
* Exercises
* Profile
* Forms
* Responsive Design

---

## 🌿 Git Workflow

Chaque développeur travaille sur sa propre branche.

### Mohamed

```bash
git checkout -b feature/mohamed
```

### Fouad

```bash
git checkout -b feature/fouad
```

Après avoir terminé une fonctionnalité :

```bash
git add .
git commit -m "feat: add workout management"
git push origin feature/mohamed
```

Puis créer une **Pull Request** vers `main`.

---

## 📋 Exemple de données

```js
{
  id: 1,
  name: "Push Day",
  date: "2026-10-01",
  duration: 65,
  exercises: [
    {
      name: "Bench Press",
      sets: [
        {
          weight: 60,
          reps: 10
        },
        {
          weight: 70,
          reps: 8
        }
      ]
    }
  ]
}
```

---

## 📈 Roadmap

### Version 1.0

* [ ] Dashboard
* [ ] Workouts
* [ ] Exercises
* [ ] Workout details
* [ ] LocalStorage
* [ ] Progress
* [ ] Profile
* [ ] Responsive design

### Version 2.0

* [ ] Backend API
* [ ] Authentication
* [ ] Database
* [ ] User accounts
* [ ] Cloud synchronization

### Version 3.0

* [ ] Advanced statistics
* [ ] Achievements
* [ ] Notifications
* [ ] Nutrition
* [ ] Mobile application
* [ ] AI features

---

## 📜 License

This project is developed for educational and portfolio purposes.

© 2026 Mohamed & Fouad
