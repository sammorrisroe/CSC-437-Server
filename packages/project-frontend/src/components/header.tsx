import React, { useState } from "react";
import { Link } from "react-router";
import "./header.css";
import logo from "../assets/logo.png";
import defaultUser from "../assets/user.png";

interface HeaderProps {
  isLoggedIn: boolean;
  username: string;
  onLogout?: () => void; // Make optional since we're not using it directly in header anymore
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

      {/* Profile Section (Right Side) */}
      <div className="profile">
        {isLoggedIn ? (
          // When logged in, show profile image and username as a link to profile page
          <Link to="/profile" className="profile-link">
            <img src={defaultUser} alt="User" className="profile-img" />
            <span className="username">{username}</span>
          </Link>
        ) : (
          // When not logged in, show login link
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;