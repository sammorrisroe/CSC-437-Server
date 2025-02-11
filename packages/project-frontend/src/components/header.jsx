import { useState } from "react";
import "./Header.css"; // Import CSS file for styling
import logo from "../assets/logo.png";
import defaultUser from "../assets/user.png";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      {/* Mobile Menu Button (Left Side) */}
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
        ☰
      </button>

      {/* Logo (Center on Mobile, Left on Desktop) */}
      <div className="logo">
        <img src={logo} alt="Dem Bonez Logo" className="logo-img" />
        <span className="logo-text">Dem Bonez</span>
      </div>

      {/* Navigation Links (Hidden on Mobile, Visible on Desktop) */}
      <nav className={`nav-links ${isOpen ? "open" : ""}`}>
        {["Home", "Closet", "Outfits", "Style Tracker", "Create"].map((link) => (
          <a key={link} href={`/${link.toLowerCase()}`} className="nav-item">
            {link}
          </a>
        ))}
      </nav>

      {/* Profile Section (Right Side) */}
      <div className="profile">
        <img src={defaultUser} alt="User" className="profile-img" />
        <span className="username">SammyBoBammy</span>
      </div>
    </header>
  );
}
