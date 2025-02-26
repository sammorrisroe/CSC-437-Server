import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ClosetPage from "./pages/ClosetPage";
import OutfitPage from "./pages/OutfitPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/closet" element={<ClosetPage />} />
        <Route path="/outfits" element={<OutfitPage />} />
      </Routes>
    </Router>
  );
}

export default App;
