import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserProfile } from "../../../services/auth";
import { FaBars, FaChevronDown, FaSignOutAlt, FaUser } from "react-icons/fa";
import "./Navbar.css";

const pageTitles = {
  "/dashboard": { title: "Analytics Overview", desc: "Monitor dynamic statistics and model metrics." },
  "/dataset": { title: "Datasets Workspace", desc: "Upload and preprocess raw data files." },
  "/analytics": { title: "EDA Visualizer", desc: "Interactive statistical modeling charts." },
  "/prediction": { title: "ML Prediction Deck", desc: "Train models and examine predictions." },
  "/reports": { title: "Generated Reports", desc: "Review and export ML model analysis reports." },
};

function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: "User", role: "Member", initial: "U" });

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        const name = data.username || "User";
        setUserInfo({
          username: name,
          role: data.role || "Member",
          initial: name.charAt(0).toUpperCase(),
        });
      })
      .catch((err) => console.error("Navbar profile load error:", err));
  }, []);

  const currentPath = location.pathname;
  const pageMeta = pageTitles[currentPath] || { title: "Intelligence Center", desc: "Intelligent analytics dashboard." };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <header className="premium-navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <FaBars />
        </button>
        <div className="navbar-page-copy">
          <h1>{pageMeta.title}</h1>
          <p>{pageMeta.desc}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="profile-menu-wrapper">
          <button 
            className="navbar-profile-btn" 
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="navbar-avatar">{userInfo.initial}</div>
            <div className="navbar-profile-copy">
              <strong>{userInfo.username}</strong>
              <span>{userInfo.role}</span>
            </div>
            <FaChevronDown className={profileOpen ? "opened" : ""} />
          </button>

          {profileOpen && (
            <div className="navbar-profile-menu">
              <button className="logout-menu-item" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
