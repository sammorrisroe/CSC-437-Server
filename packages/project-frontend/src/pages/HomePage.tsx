import { Link } from "react-router-dom";
import "./HomePage.css"; // Create a CSS file for custom styling if needed

export default function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Dem Bonez!</h1>
      <p>Your personal wardrobe management and outfit tracker.</p>
      <div className="navigation-buttons">
        <Link to="/closet" className="btn">
          Go to Closet
        </Link>
        <Link to="/outfits" className="btn">
          Go to Outfits
        </Link>
      </div>
    </div>
  );
}
