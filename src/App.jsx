import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { StoreProvider } from './store/StoreContext';
import { ToastProvider } from './components/ui';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import ActiveWorkout from './pages/ActiveWorkout';
import WorkoutDetail from './pages/WorkoutDetail';
import Exercises from './pages/Exercises';
import Progress from './pages/Progress';
import Profile from './pages/Profile';

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/workouts/:id" element={<WorkoutDetail />} />
              <Route path="/workout/active" element={<ActiveWorkout />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
