import { Link } from "react-router-dom";
import { useGym } from "../context/GymContext.jsx";

export default function Navbar({ onMenuClick, menuOpen }) {
  const { profile } = useGym();
  const name = profile?.name?.trim();

  return (
    <header className="navbar">
      <button
        className="navbar__menu"
        onClick={onMenuClick}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="sidebar"
      >
        <span />
        <span />
        <span />
      </button>

      <Link to="/" className="navbar__brand">
        Gym<b>Tracker</b>
      </Link>

      <Link to="/profile" className="navbar__user">
        <span className="navbar__avatar" aria-hidden="true">
          {name ? name[0].toUpperCase() : "?"}
        </span>
        <span className="navbar__name">{name || "Set up profile"}</span>
      </Link>
    </header>
  );
}
