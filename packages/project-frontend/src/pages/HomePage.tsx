import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

// Define the props interface
interface HomePageProps {
  isLoggedIn: boolean;
  showLoginPrompt: boolean;
  onDismissPrompt: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn, showLoginPrompt, onDismissPrompt }) => {
  return (
    <div className="home-page">
      <h1>Welcome to Dem Bonez</h1>
      
      {/* Login prompt banner */}
      {showLoginPrompt && (
        <div className="login-prompt">
          <p>Sign in to save your outfits and manage your closet!</p>
          <div className="prompt-actions">
            <Link to="/login" className="btn">Login</Link>
            <Link to="/register" className="btn">Register</Link>
            <button onClick={onDismissPrompt} className="dismiss-btn">Maybe Later</button>
          </div>
        </div>
      )}
      
      <p>Create, mix, and match outfits with your virtual closet. Dem Bonez helps you organize your wardrobe and discover new outfit combinations.</p>
      
      {/* Feature highlights */}
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Manage Your Closet</h3>
          <p>Upload photos of your clothes and categorize them for easy access.</p>
          {!isLoggedIn && <p className="login-required">Login required</p>}
        </div>
        
        <div className="feature-card">
          <h3>Create Outfits</h3>
          <p>Mix and match your clothes to create perfect outfits for any occasion.</p>
          {!isLoggedIn && <p className="login-required">Login required</p>}
        </div>
      </div>
      
      {/* Call to action for non-logged in users */}
      {!isLoggedIn && (
        <div className="cta-section">
          <h3>Ready to start organizing your wardrobe?</h3>
          <div className="navigation-buttons">
            <Link to="/login" className="btn">Login</Link>
            <Link to="/register" className="btn">Create an Account</Link>
          </div>
        </div>
      )}
      
      {/* If user is logged in, show quick access to primary features */}
      {isLoggedIn && (
        <div className="navigation-buttons">
          <Link to="/closet" className="btn">My Closet</Link>
          <Link to="/outfits" className="btn">My Outfits</Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;