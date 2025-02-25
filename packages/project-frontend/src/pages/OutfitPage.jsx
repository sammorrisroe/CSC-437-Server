import React, { useState } from "react";
import "./OutfitPage.css";

const GRID_SIZE = 20;

const OutfitPage = () => {
  const [outfits, setOutfits] = useState([
    {
      title: "Casual Day",
      hat: { title: "Baseball Cap", imageUrl: "/images/cap.jpg" },
      shirt: { title: "T-shirt", imageUrl: "/images/tshirt.jpg" },
      jacket: { title: "Denim Jacket", imageUrl: "/images/denim_jacket.jpg" },
      pants: { title: "Jeans", imageUrl: "/images/jeans.jpg" },
      shoes: { title: "Sneakers", imageUrl: "/images/sneakers.jpg" },
    },
    {
      title: "Formal Look",
      hat: { title: "Fedora", imageUrl: "/images/fedora.jpg" },
      shirt: { title: "Dress Shirt", imageUrl: "/images/dress_shirt.jpg" },
      jacket: { title: "Blazer", imageUrl: "/images/blazer.jpg" },
      pants: { title: "Chinos", imageUrl: "/images/chinos.jpg" },
      shoes: { title: "Loafers", imageUrl: "/images/loafers.jpg" },
    },
    {
      title: "Workout Gear",
      hat: { title: "Running Cap", imageUrl: "/images/running_cap.jpg" },
      shirt: { title: "Gym Shirt", imageUrl: "/images/gym_shirt.jpg" },
      jacket: null, // No jacket for this outfit
      pants: { title: "Track Pants", imageUrl: "/images/track_pants.jpg" },
      shoes: { title: "Running Shoes", imageUrl: "/images/running_shoes.jpg" },
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [newOutfit, setNewOutfit] = useState({
    title: "",
    hat: null,
    shirt: null,
    jacket: null,
    pants: null,
    shoes: null,
  });

  const handleAddOutfit = () => {
    setEditIndex(null);
    setShowModal(true);
    setNewOutfit({ title: "", hat: null, shirt: null, jacket: null, pants: null, shoes: null });
  };

  const handleEditOutfit = (index) => {
    setEditIndex(index);
    setNewOutfit(outfits[index]);
    setShowModal(true);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleInputChange = (e) => {
    setNewOutfit({ ...newOutfit, [e.target.name]: e.target.value });
  };

  const handleSaveOutfit = () => {
    if (!newOutfit.title || !newOutfit.hat || !newOutfit.shirt || !newOutfit.pants || !newOutfit.shoes) return;

    if (editIndex !== null) {
      const updatedOutfits = [...outfits];
      updatedOutfits[editIndex] = newOutfit;
      setOutfits(updatedOutfits);
    } else {
      setOutfits([...outfits, newOutfit]);
    }

    setShowModal(false);
    setNewOutfit({ title: "", hat: null, shirt: null, jacket: null, pants: null, shoes: null });
  };

  const handleDeleteOutfit = () => {
    if (editIndex !== null) {
      const updatedOutfits = outfits.filter((_, index) => index !== editIndex);
      setOutfits(updatedOutfits);
    }
    setShowModal(false);
  };

  const filteredOutfits = outfits.filter((item) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Favorites") return item.isFavorite;
  });

  return (
    <div className="outfit-container">
      {/* Navigation Tabs */}
      <nav className="category-nav">
        <button
          className={`category-button ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => handleCategoryChange("All")}
        >
          All
        </button>
        <button
          className={`category-button ${selectedCategory === "Favorites" ? "active" : ""}`}
          onClick={() => handleCategoryChange("Favorites")}
        >
          Favorites
        </button>
      </nav>

      {/* Dynamic Outfit Grid */}
      <div className="outfit-grid">
        {[...filteredOutfits, ...Array(GRID_SIZE - filteredOutfits.length).fill(null)].map((item, index) => {
          if (item) {
            return (
              <div key={index} className="grid-slot filled" onClick={() => handleEditOutfit(outfits.indexOf(item))}>
                <div className="outfit-4x1-grid">
                  <div className="outfit-row hat">{item.hat && <img src={item.hat.imageUrl} alt="Hat" />}</div>
                  <div className="outfit-row shirt-jacket">
                    {item.shirt && <img src={item.shirt.imageUrl} alt="Shirt" />}
                    {item.jacket && <img src={item.jacket.imageUrl} alt="Jacket" />}
                  </div>
                  <div className="outfit-row pants">{item.pants && <img src={item.pants.imageUrl} alt="Pants" />}</div>
                  <div className="outfit-row shoes">{item.shoes && <img src={item.shoes.imageUrl} alt="Shoes" />}</div>
                </div>
                <p className="outfit-title">{item.title}</p>
              </div>
            );
          } else if (index === filteredOutfits.length) {
            return (
              <div key={index} className="grid-slot empty" onClick={handleAddOutfit}>
                <div className="add-button">+ Add Outfit</div>
              </div>
            );
          } else {
            return <div key={index} className="grid-slot empty"></div>;
          }
        })}
      </div>

      {/* Modal for Adding/Editing Outfit */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editIndex !== null ? "Edit Outfit" : "Add New Outfit"}</h2>

            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={newOutfit.title} onChange={handleInputChange} required />
            </div>

            {/* Outfit Item Selectors */}
            <div className="form-group">
              <label>Hat</label>
              <select name="hat" value={newOutfit.hat?.title || ""} onChange={handleInputChange}>
                <option value="">Select Hat</option>
                {/* Add dynamic options for hats */}
              </select>
            </div>

            <div className="form-group">
              <label>Shirt</label>
              <select name="shirt" value={newOutfit.shirt?.title || ""} onChange={handleInputChange}>
                <option value="">Select Shirt</option>
                {/* Add dynamic options for shirts */}
              </select>
            </div>

            <div className="form-group">
              <label>Jacket</label>
              <select name="jacket" value={newOutfit.jacket?.title || ""} onChange={handleInputChange}>
                <option value="">Select Jacket</option>
                {/* Add dynamic options for jackets */}
              </select>
            </div>

            <div className="form-group">
              <label>Pants</label>
              <select name="pants" value={newOutfit.pants?.title || ""} onChange={handleInputChange}>
                <option value="">Select Pants</option>
                {/* Add dynamic options for pants */}
              </select>
            </div>

            <div className="form-group">
              <label>Shoes</label>
              <select name="shoes" value={newOutfit.shoes?.title || ""} onChange={handleInputChange}>
                <option value="">Select Shoes</option>
                {/* Add dynamic options for shoes */}
              </select>
            </div>

            <button onClick={handleSaveOutfit}>Save</button>
            {editIndex !== null && <button onClick={handleDeleteOutfit} className="delete-button">Delete</button>}
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitPage;
