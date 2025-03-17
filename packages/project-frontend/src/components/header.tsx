import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../assets/logo.png";
import defaultUser from "../assets/user.png";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
      document.body.classList.add("dark-mode"); // Apply to body
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.body.classList.remove("dark-mode"); // Remove from body
    }
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  return (
    <header className="header">
      {/* Mobile Menu Button (Left Side) */}
      <button 
        className="menu-btn" 
        onClick={() => setIsOpen(!isOpen)} 
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Logo (Center on Mobile, Left on Desktop) */}
      <div className="logo">
        <img src={logo} alt="Dem Bonez Logo" className="logo-img" />
        <span className="logo-text">Dem Bonez</span>
      </div>

      {/* Navigation Links (Hidden on Mobile, Visible on Desktop) */}
      <nav className={`nav-links ${isOpen ? "open" : ""}`}>
        {["Home", "Closet", "Outfits"].map((link) => (
          <Link key={link} to={`/${link.toLowerCase()}`} className="nav-item">
            {link}
          </Link>
        ))}
      </nav>

      {/* Dark Mode Toggle */}
      <label className="dark-mode-toggle">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={() => setIsDarkMode(!isDarkMode)}
        />
        Dark Mode
      </label>

      {/* Profile Section (Right Side) */}
      <div className="profile">
        <img src={defaultUser} alt="User" className="profile-img" />
        <span className="username">SammyBoBammy</span>
      </div>
    </header>
  );
};

export default Header;