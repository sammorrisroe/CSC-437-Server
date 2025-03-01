import "./Header.css";
import { Link } from "react-router";
import { useState } from "react";

export function Header() {
  // Add state for the checkbox
  const [isChecked, setIsChecked] = useState(false);
  
  return (
    <header>
      <h1>My cool site</h1>
      <div>
        <label>
          Some switch (dark mode?)
          <input 
            type="checkbox" 
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)} 
          />
        </label>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/images">Image Gallery</Link>
          <Link to="/account">Account</Link>
        </nav>
      </div>
    </header>
  );
}