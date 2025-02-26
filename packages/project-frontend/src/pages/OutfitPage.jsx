import React, { useState } from "react";
import "./OutfitPage.css";

const GRID_SIZE = 20;

const hatOptions = [
  { title: "Baseball Cap", imageUrl: "/images/cap.jpg" },
  { title: "Fedora", imageUrl: "/images/fedora.jpg" },
  { title: "Running Cap", imageUrl: "/images/running_cap.jpg" },
];

const shirtOptions = [
  { title: "T-shirt", imageUrl: "/images/tshirt.jpg" },
  { title: "Dress Shirt", imageUrl: "/images/dress_shirt.jpg" },
  { title: "Gym Shirt", imageUrl: "/images/gym_shirt.jpg" },
];

const jacketOptions = [
  { title: "Denim Jacket", imageUrl: "/images/denim_jacket.jpg" },
  { title: "Blazer", imageUrl: "/images/blazer.jpg" },
];

const pantsOptions = [
  { title: "Jeans", imageUrl: "/images/jeans.jpg" },
  { title: "Chinos", imageUrl: "/images/chinos.jpg" },
  { title: "Track Pants", imageUrl: "/images/track_pants.jpg" },
];

const shoesOptions = [
  { title: "Sneakers", imageUrl: "/images/sneakers.jpg" },
  { title: "Loafers", imageUrl: "/images/loafers.jpg" },
  { title: "Running Shoes", imageUrl: "/images/running_shoes.jpg" },
];

const OutfitPage = () => {
  const [outfits, setOutfits] = useState([
    {
      title: "Casual Day",
      hat: hatOptions[0],
      shirt: shirtOptions[0],
      jacket: jacketOptions[0],
      pants: pantsOptions[0],
      shoes: shoesOptions[0],
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
    const { name, value } = e.target;
    let selectedItem = null;

    switch (name) {
      case "hat":
        selectedItem = hatOptions.find((item) => item.title === value) || null;
        break;
      case "shirt":
        selectedItem = shirtOptions.find((item) => item.title === value) || null;
        break;
      case "jacket":
        selectedItem = jacketOptions.find((item) => item.title === value) || null;
        break;
      case "pants":
        selectedItem = pantsOptions.find((item) => item.title === value) || null;
        break;
      case "shoes":
        selectedItem = shoesOptions.find((item) => item.title === value) || null;
        break;
      default:
        selectedItem = value;
    }

    setNewOutfit({ ...newOutfit, [name]: selectedItem });
  };

  const handleSaveOutfit = () => {
    if (!newOutfit.title || !newOutfit.shirt || !newOutfit.pants || !newOutfit.shoes) {
      alert("Please fill out all required fields (Title, Shirt, Pants, and Shoes).");
      return;
    }

    if (editIndex !== null) {
      const updatedOutfits = [...outfits];
      updatedOutfits[editIndex] = { ...newOutfit };
      setOutfits(updatedOutfits);
    } else {
      setOutfits([...outfits, { ...newOutfit }]);
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

  return (
    <div className="outfit-container">
      <nav className="category-nav">
        <button className={`category-button ${selectedCategory === "All" ? "active" : ""}`} onClick={() => handleCategoryChange("All")}>
          All
        </button>
        <button className={`category-button ${selectedCategory === "Favorites" ? "active" : ""}`} onClick={() => handleCategoryChange("Favorites")}>
          Favorites
        </button>
      </nav>

      <div className="outfit-grid">
        {[...outfits, ...Array(GRID_SIZE - outfits.length).fill(null)].map((item, index) => {
          if (item) {
            return (
              <div key={index} className="grid-slot filled" onClick={() => handleEditOutfit(index)}>
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
          } else if (index === outfits.length) {
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

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editIndex !== null ? "Edit Outfit" : "Add New Outfit"}</h2>
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={newOutfit.title} onChange={handleInputChange} required />
            </div>

            {[{ name: "hat", options: hatOptions }, { name: "shirt", options: shirtOptions }, { name: "jacket", options: jacketOptions }, { name: "pants", options: pantsOptions }, { name: "shoes", options: shoesOptions }].map(({ name, options }) => (
              <div className="form-group" key={name}>
                <label>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
                <select name={name} value={newOutfit[name]?.title || ""} onChange={handleInputChange}>
                  <option value="">Select {name}</option>
                  {options.map((option) => (
                    <option key={option.title} value={option.title}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>
            ))}

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
