import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import defaultUser from "../assets/user.png";
import './ProfilePage.css';

interface ProfilePageProps {
  username: string;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
      document.body.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={defaultUser} alt="User" className="profile-avatar" />
        <h1>{username}</h1>
      </div>

      <div className="profile-section">
        <h2>Account Settings</h2>
        
        <div className="settings-row">
          <div className="setting-label">
            <label htmlFor="dark-mode-toggle">Dark Mode</label>
            <p className="setting-description">Switch between light and dark theme</p>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input
                id="dark-mode-toggle"
                type="checkbox"
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        {/* Add more settings here as needed */}
      </div>

      <div className="profile-actions">
        <button onClick={handleLogout} className="logout-btn">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;