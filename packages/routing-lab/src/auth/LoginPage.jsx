import React from 'react';
import { Link, useNavigate } from 'react-router';
import UsernamePasswordForm from './UsernamePasswordForm';
import { sendPostRequest } from './sendPostRequest';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      // Send login request to backend
      const response = await sendPostRequest('/auth/login', formData);
      
      console.log("Authentication token:", response);
      
      // Call the callback to pass auth token to parent
      if (response && response.token) {
        onLoginSuccess(response.token);
        
        // Redirect to homepage
        navigate('/');
      }
      
      return {
        type: "success",
        message: "Login successful!"
      };
    } catch (error) {
      // Handle specific error cases
      if (error.message.includes("401")) {
        return {
          type: "error",
          message: "Incorrect username or password. Please try again."
        };
      } else if (error.message.includes("500")) {
        return {
          type: "error",
          message: "Server error. Please try again later."
        };
      }
      
      // Return general error for other cases
      return {
        type: "error",
        message: error.message || "Login failed. Please try again."
      };
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      <UsernamePasswordForm onSubmit={handleLogin} />
      <p className="register-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;