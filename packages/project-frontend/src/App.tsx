import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ClosetPage from "./pages/ClosetPage";
import OutfitPage from "./pages/OutfitPage";
import Header from "./components/header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

interface ProtectedRouteProps {
  authToken: string | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ authToken, children }) => {
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  // State for authentication token - always start as not logged in
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // State to track the logged in username - always start as not logged in
  const [username, setUsername] = useState<string | null>(null);
  
  // State to track if login prompt should be shown on home page
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(true);

  // Handler for successful login
  const handleLoginSuccess = (token: string, user: string): void => {
    setAuthToken(token);
    setUsername(user);
    // Store token and username in localStorage for persistence
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', user);
    // Hide login prompt after successful login
    setShowLoginPrompt(false);
  };
  
  // Handler for logout
  const handleLogout = (): void => {
    setAuthToken(null);
    setUsername(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setShowLoginPrompt(true);
  };

  // Dismiss login prompt
  const dismissLoginPrompt = (): void => {
    setShowLoginPrompt(false);
  };

  return (
    <Router>
      <Header isLoggedIn={!!authToken} username={username || ''} />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<RegisterPage onLoginSuccess={handleLoginSuccess} />} />
        
        {/* Home page is accessible to all but shows a login prompt */}
        <Route path="/" element={
          <HomePage 
            isLoggedIn={!!authToken} 
            showLoginPrompt={showLoginPrompt && !authToken} 
            onDismissPrompt={dismissLoginPrompt}
          />
        } />
        
        <Route path="/home" element={
          <HomePage 
            isLoggedIn={!!authToken} 
            showLoginPrompt={showLoginPrompt && !authToken} 
            onDismissPrompt={dismissLoginPrompt}
          />
        } />
        
        {/* Profile page - protected */}
        <Route path="/profile" element={
          <ProtectedRoute authToken={authToken}>
            <ProfilePage username={username || ''} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        
        {/* Other protected routes */}
        <Route path="/closet" element={
          <ProtectedRoute authToken={authToken}>
            <ClosetPage authToken={authToken} />
          </ProtectedRoute>
        } />
        
        <Route path="/outfits" element={
          <ProtectedRoute authToken={authToken}>
            <OutfitPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;