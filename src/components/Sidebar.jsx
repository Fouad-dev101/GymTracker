import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/workouts", label: "Workouts" },
  { to: "/exercises", label: "Exercises" },
  { to: "/progress", label: "Progress" },
  { to: "/profile", label: "Profile" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`scrim ${open ? "scrim--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav id="sidebar" className={`sidebar ${open ? "sidebar--open" : ""}`} aria-label="Main">
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="sidebar__foot">Mohamed &amp; Fouad · 2026</p>
      </nav>
    </>
  );
}
