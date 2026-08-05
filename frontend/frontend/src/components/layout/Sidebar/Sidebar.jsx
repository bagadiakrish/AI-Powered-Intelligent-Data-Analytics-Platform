import { NavLink } from "react-router-dom";
import { 
  FaChartPie, 
  FaDatabase, 
  FaBrain, 
  FaFileAlt, 
  FaTachometerAlt, 
  FaTimes 
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`} 
        onClick={onClose} 
      />
      
      <aside className={`premium-sidebar ${isOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">N</div>
          <div className="brand-copy">
            <strong>Nexora</strong>
            <span>Analytics</span>
          </div>
          <button className="sidebar-mobile-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={onClose}
          >
            <FaTachometerAlt className="sidebar-link-icon" />
            <span className="sidebar-link-label">Dashboard</span>
          </NavLink>

          <NavLink 
            to="/dataset" 
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={onClose}
          >
            <FaDatabase className="sidebar-link-icon" />
            <span className="sidebar-link-label">Datasets</span>
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={onClose}
          >
            <FaChartPie className="sidebar-link-icon" />
            <span className="sidebar-link-label">Analytics</span>
          </NavLink>

          <NavLink 
            to="/prediction" 
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={onClose}
          >
            <FaBrain className="sidebar-link-icon" />
            <span className="sidebar-link-label">Prediction</span>
          </NavLink>

          <NavLink 
            to="/reports" 
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={onClose}
          >
            <FaFileAlt className="sidebar-link-icon" />
            <span className="sidebar-link-label">Reports</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-version">v1.1.0</div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
