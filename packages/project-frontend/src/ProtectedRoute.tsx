import React from 'react';
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  authToken: string | null;
  children: React.ReactNode;
}

/**
 * A component that redirects to the login page if the user is not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ authToken, children }) => {
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}