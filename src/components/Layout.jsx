import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { useStore } from '../store/StoreContext';
import { useElapsed } from '../hooks/useTimers';
import { formatClock } from '../utils/format';
import { workoutSetCount } from '../utils/stats';
import { Button } from './ui';

const NAV = [
  { to: '/', icon: '📊', label: 'Tableau de bord', end: true },
  { to: '/workouts', icon: '🗓️', label: 'Séances' },
  { to: '/workout/active', icon: '▶️', label: 'Séance en cours' },
  { to: '/exercises', icon: '🏋️', label: 'Exercices' },
  { to: '/progress', icon: '📈', label: 'Progression' },
  { to: '/profile', icon: '👤', label: 'Profil' },
];

const TITLES = {
  '/': { title: 'Tableau de bord', sub: 'Vue d’ensemble de ton entraînement' },
  '/workouts': { title: 'Séances', sub: 'Historique et modèles d’entraînement' },
  '/workout/active': { title: 'Séance en cours', sub: 'Enregistre tes séries au fil de l’eau' },
  '/exercises': { title: 'Bibliothèque d’exercices', sub: 'Tous les mouvements disponibles' },
  '/progress': { title: 'Progression', sub: 'Records, volume et courbes de force' },
  '/profile': { title: 'Profil & réglages', sub: 'Préférences, poids du corps et données' },
};

function ActiveBanner() {
  const { state } = useStore();
  const seconds = useElapsed(state.active?.startedAt);
  if (!state.active) return null;

  const sets = (state.active.exercises || []).reduce((t, e) => t + e.sets.length, 0);

  return (
    <div className="active-banner">
      <span className="pulse" />
      <div>
        <div className="bold" style={{ fontSize: 13.5 }}>Séance en cours</div>
        <div className="dim" style={{ fontSize: 12 }}>
          {state.active.name} · {sets} série{sets > 1 ? 's' : ''} · {formatClock(seconds)}
        </div>
      </div>
      <NavLink to="/workout/active">
        <Button variant="primary" size="sm">
          Reprendre
        </Button>
      </NavLink>
    </div>
  );
}

export default function Layout() {
  const { state, actions } = useStore();
  const location = useLocation();
  const meta = TITLES[location.pathname] || {
    title: 'GymTracker',
    sub: 'Suis tes entraînements',
  };

  const isActive = location.pathname === '/workout/active';
  const activeSets = state.active ? workoutSetCount({ exercises: state.active.exercises }) : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">🏋️</div>
          <div>
            <div className="brand-name">GymTracker</div>
            <div className="brand-sub">by Mohamed &amp; Fouad</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-label">Entraînement</div>
          {NAV.slice(0, 3).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive: active }) => `nav-item ${active ? 'active' : ''}`}
            >
              <span className="icon" aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.to === '/workouts' && state.workouts.length > 0 && (
                <span className="count">{state.workouts.length}</span>
              )}
            </NavLink>
          ))}

          <div className="nav-label" style={{ marginTop: 14 }}>Analyse</div>
          {NAV.slice(3).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive: active }) => `nav-item ${active ? 'active' : ''}`}
            >
              <span className="icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <NavLink to="/workout/active">
            <Button variant="primary" block icon="⚡">
              {state.active ? 'Reprendre la séance' : 'Démarrer une séance'}
            </Button>
          </NavLink>
          <Button
            variant="ghost"
            block
            icon={state.profile.theme === 'dark' ? '☀️' : '🌙'}
            onClick={() =>
              actions.updateProfile({ theme: state.profile.theme === 'dark' ? 'light' : 'dark' })
            }
          >
            {state.profile.theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
          </Button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1>{meta.title}</h1>
            <div className="sub">{meta.sub}</div>
          </div>
          <div className="topbar-actions">
            {isActive && state.active && (
              <span className="badge accent tabnum">{activeSets} séries</span>
            )}
            <NavLink to="/workout/active" className="hide-sm">
              <Button variant={state.active ? 'default' : 'primary'} icon="⚡">
                {state.active ? 'Séance en cours' : 'Nouvelle séance'}
              </Button>
            </NavLink>
            <Button
              variant="ghost"
              className="btn-icon"
              aria-label="Basculer le thème"
              title="Basculer le thème"
              onClick={() =>
                actions.updateProfile({ theme: state.profile.theme === 'dark' ? 'light' : 'dark' })
              }
            >
              {state.profile.theme === 'dark' ? '☀️' : '🌙'}
            </Button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive: active }) => (active ? 'active' : '')}
          >
            <span className="icon" aria-hidden="true">{item.icon}</span>
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>

      {!isActive && <ActiveBanner />}
    </div>
  );
}
