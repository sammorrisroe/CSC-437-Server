import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UsernamePasswordForm from './UsernamePasswordForm';
import { sendPostRequest } from './sendPostRequest';

interface LoginResponse {
  token: string;
  // Add other properties returned from login endpoint as needed
}

interface FormData {
  username: string;
  password: string;
}

interface FormResult {
  type: "success" | "error";
  message: string;
}

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleLogin = async (formData: FormData): Promise<FormResult> => {
    try {
      // Send login request to backend
      const response = await sendPostRequest<LoginResponse>('/auth/login', formData);
      
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("401")) {
        return {
          type: "error",
          message: "Incorrect username or password. Please try again."
        };
      } else if (errorMessage.includes("500")) {
        return {
          type: "error",
          message: "Server error. Please try again later."
        };
      }
      
      // Return general error for other cases
      return {
        type: "error",
        message: errorMessage || "Login failed. Please try again."
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