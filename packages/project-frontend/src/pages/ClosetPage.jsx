import React, { useState } from "react";
import "./ClosetPage.css";

const GRID_SIZE = 20;
const categories = ["All", "Favorites", "Shirts", "Pants", "Jackets", "Hats", "Shoes", "Add"];

const ClosetPage = () => {
  const [clothes, setClothes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // Track the item being edited
  const [newClothing, setNewClothing] = useState({
    title: "",
    type: "shirt",
    isFavorite: false,
    description: "",
    imageUrl: null,
  });

  const handleAddClothes = () => {
    setEditIndex(null); // Ensure it's a new item
    setShowModal(true);
    setNewClothing({ title: "", type: "shirt", isFavorite: false, description: "", imageUrl: null });
  };

  const handleEditClothes = (index) => {
    setEditIndex(index);
    setNewClothing(clothes[index]);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setNewClothing({ ...newClothing, [e.target.name]: e.target.value });
  };

  const handleFavoriteToggle = () => {
    setNewClothing({ ...newClothing, isFavorite: !newClothing.isFavorite });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewClothing({ ...newClothing, imageUrl: URL.createObjectURL(file) });
    }
  };

  const handleSaveClothing = () => {
    if (!newClothing.imageUrl || !newClothing.title) return;

    if (editIndex !== null) {
      const updatedClothes = [...clothes];
      updatedClothes[editIndex] = newClothing;
      setClothes(updatedClothes);
    } else {
      setClothes([...clothes, newClothing]);
    }

    setShowModal(false);
    setNewClothing({ title: "", type: "shirt", isFavorite: false, description: "", imageUrl: null });
  };

  return (
    <div className="closet-container">
      {/* Navigation Tabs */}
      <nav className="category-nav">
        {categories.map((category, index) => (
          <button key={index} className="category-button">
            {category}
          </button>
        ))}
      </nav>

      {/* Dynamic Clothing Grid */}
      <div className="clothing-grid">
        {[...clothes, ...Array(GRID_SIZE - clothes.length).fill(null)].map((item, index) => (
          <div
            key={index}
            className={`grid-slot ${item ? "filled" : "empty"}`}
            onClick={item ? () => handleEditClothes(index) : handleAddClothes}
          >
            {item ? (
              <>
                <img src={item.imageUrl} alt={item.title} className="clothing-image" />
                <p className="clothing-title">{item.title}</p>
              </>
            ) : (
              <div className="add-button">+ Add Clothes</div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for Adding/Editing Clothes */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editIndex !== null ? "Edit Clothing" : "Add New Clothing"}</h2>

            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={newClothing.title} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="type" value={newClothing.type} onChange={handleInputChange}>
                <option value="shirt">Shirt</option>
                <option value="pants">Pants</option>
                <option value="jacket">Jacket</option>
                <option value="hat">Hat</option>
                <option value="shoes">Shoes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Favorite</label>
              <input type="checkbox" checked={newClothing.isFavorite} onChange={handleFavoriteToggle} />
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            {newClothing.imageUrl && <img src={newClothing.imageUrl} alt="Preview" className="preview-image" />}

            <button onClick={handleSaveClothing}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosetPage;
