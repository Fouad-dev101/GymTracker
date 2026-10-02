import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Workouts from "./pages/Workouts.jsx";
import WorkoutDetails from "./pages/WorkoutDetails.jsx";
import Exercises from "./pages/Exercises.jsx";
import Progress from "./pages/Progress.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <Navbar onMenuClick={() => setMenuOpen((open) => !open)} menuOpen={menuOpen} />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main" id="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/:id" element={<WorkoutDetails />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<p className="empty">Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
