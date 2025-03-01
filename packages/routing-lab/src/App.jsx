import { Routes, Route } from "react-router";
import { useState } from "react";
import { Homepage } from "./Homepage";
import { AccountSettings } from "./AccountSettings";
import { ImageGallery } from "./images/ImageGallery.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { useImageFetching } from "./images/useImageFetching.js"; // Moved image fetching to App level

function App() {
  // Add state for username
  const [userName, setUserName] = useState("John Doe");
  
  // Move image fetching to App level to prevent reloads
  const { isLoading, fetchedImages } = useImageFetching("");

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Homepage userName={userName} />} />
        <Route path="/account" element={<AccountSettings userName={userName} onUserNameChange={setUserName} />} />
        <Route path="/images" element={<ImageGallery isLoading={isLoading} fetchedImages={fetchedImages} />} />
        <Route path="/images/:imageId" element={<ImageDetails />} />
      </Route>
    </Routes>
  );
}

export default App;