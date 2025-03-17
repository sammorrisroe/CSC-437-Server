import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ClosetPage from "./pages/ClosetPage";
import OutfitPage from "./pages/OutfitPage";
import Header from "./components/header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

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
  // State for authentication token
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Handler for successful login
  const handleLoginSuccess = (token: string): void => {
    setAuthToken(token);
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<RegisterPage onLoginSuccess={handleLoginSuccess} />} />
        
        <Route path="/" element={
          <ProtectedRoute authToken={authToken}>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/home" element={
          <ProtectedRoute authToken={authToken}>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/closet" element={
          <ProtectedRoute authToken={authToken}>
            <ClosetPage />
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