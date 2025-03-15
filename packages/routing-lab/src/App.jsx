import { Routes, Route } from "react-router";
import { useState } from "react";
import { Homepage } from "./Homepage";
import { AccountSettings } from "./AccountSettings";
import { ImageGallery } from "./images/ImageGallery.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { useImageFetching } from "./images/useImageFetching.js";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import { ProtectedRoute } from "./ProtectedRoute";

function App() {
  // Add state for username
  const [userName, setUserName] = useState("John Doe");
  
  // Add state for authentication token
  const [authToken, setAuthToken] = useState(null);
  
  // Move image fetching to App level to prevent reloads
  const { isLoading, fetchedImages } = useImageFetching("");

  // Handler for successful login
  const handleLoginSuccess = (token) => {
    setAuthToken(token);
  };

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={
          <ProtectedRoute authToken={authToken}>
            <Homepage userName={userName} />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute authToken={authToken}>
            <AccountSettings userName={userName} onUserNameChange={setUserName} />
          </ProtectedRoute>
        } />
        <Route path="/images" element={
          <ProtectedRoute authToken={authToken}>
            <ImageGallery isLoading={isLoading} fetchedImages={fetchedImages} />
          </ProtectedRoute>
        } />
        <Route path="/images/:imageId" element={
          <ProtectedRoute authToken={authToken}>
            <ImageDetails />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<RegisterPage onLoginSuccess={handleLoginSuccess} />} />
      </Route>
    </Routes>
  );
}

export default App;