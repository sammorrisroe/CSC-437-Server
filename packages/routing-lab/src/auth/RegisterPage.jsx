import React from 'react';
import { Link, useNavigate } from 'react-router';
import UsernamePasswordForm from './UsernamePasswordForm';
import { sendPostRequest } from './sendPostRequest';

const RegisterPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleRegistration = async (formData) => {
    try {
      // Send registration request to backend
      const response = await sendPostRequest('/auth/register', formData);
      
      console.log("Registration successful, token:", response);
      
      // Handle auto-login after registration
      if (response && response.token) {
        onLoginSuccess(response.token);
        
        // Redirect to homepage
        navigate('/');
        
        return {
          type: "success",
          message: "Registration successful! Redirecting to homepage..."
        };
      }
      
      return {
        type: "success",
        message: "Registration successful! You can now log in."
      };
    } catch (error) {
      // Handle specific error cases
      if (error.message.includes("400")) {
        return {
          type: "error",
          message: "Username already exists. Please choose a different username."
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
        message: error.message || "Registration failed. Please try again."
      };
    }
  };

  return (
    <div className="auth-container">
      <h1>Register a New Account</h1>
      <UsernamePasswordForm onSubmit={handleRegistration} />
      <p className="login-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;