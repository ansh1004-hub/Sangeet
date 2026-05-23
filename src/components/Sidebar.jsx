import { NavLink } from "react-router-dom";
import { Home, Search, Library } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h1>Sangeet 🎧</h1>
      </div>

      <nav className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Home size={24} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Search size={24} />
          <span>Search</span>
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Library size={24} />
          <span>Your Library</span>
        </NavLink>
      </nav>
    </div>
  );
}
