import React from 'react';
import { Link, useNavigate } from 'react-router';
import UsernamePasswordForm from './UsernamePasswordForm';
import { sendPostRequest } from './sendPostRequest';

interface RegisterResponse {
  token: string;
  username: string;
  // Add other properties returned from register endpoint as needed
}

interface AuthFormData {
  username: string;
  password: string;
}

interface FormResult {
  type: "success" | "error";
  message: string;
}

interface RegisterPageProps {
  onLoginSuccess: (token: string, username: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleRegistration = async (formData: AuthFormData): Promise<FormResult> => {
    try {
      // Send registration request to backend
      const response = await sendPostRequest<RegisterResponse>('/auth/register', formData);
      
      console.log("Registration successful, token:", response);
      
      // Handle auto-login after registration
      if (response && response.token) {
        onLoginSuccess(response.token, response.username || formData.username);
        
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("400")) {
        return {
          type: "error",
          message: "Username already exists. Please choose a different username."
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
        message: errorMessage || "Registration failed. Please try again."
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