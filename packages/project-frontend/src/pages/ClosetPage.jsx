import React, { useState } from "react";
import "./ClosetPage.css";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css"; // Import styles for the cropper

const dummyClothes = [
  { id: 1, type: "shirt", isFavorite: false, description: "", imageUrl: "/shirt-icon.png" },
  { id: 2, type: "shirt", isFavorite: false, description: "", imageUrl: "/shirt-icon.png" },
  { id: 3, type: "shirt", isFavorite: false, description: "", imageUrl: "/shirt-icon.png" },
  // Add other dummy items
];

const ClosetPage = () => {
  const [clothes, setClothes] = useState(dummyClothes);
  const [showModal, setShowModal] = useState(false);
  const [newClothing, setNewClothing] = useState({
    type: "shirt",
    isFavorite: false,
    description: "",
    imageUrl: null,
  });
  const [imageFile, setImageFile] = useState(null); // Store the selected image file
  const [cropper, setCropper] = useState(null); // Reference to the cropper instance

  const categories = ["All", "Favorites", "Shirts", "Pants", "Jackets", "Hats", "Shoes", "Add"];

  const handleAddClothes = () => {
    setShowModal(true);
  };

  const handleCategoryChange = (e) => {
    setNewClothing({
      ...newClothing,
      type: e.target.value,
    });
  };

  const handleFavoriteToggle = () => {
    setNewClothing({
      ...newClothing,
      isFavorite: !newClothing.isFavorite,
    });
  };

  const handleDescriptionChange = (e) => {
    setNewClothing({
      ...newClothing,
      description: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(URL.createObjectURL(file)); // Create a preview URL for the image
    }
  };

  const handleSaveClothing = () => {
    // Get the cropped image data
    if (cropper) {
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      setClothes([...clothes, { ...newClothing, id: clothes.length + 1, imageUrl: croppedImage }]);
      setShowModal(false);
      setNewClothing({ type: "shirt", isFavorite: false, description: "", imageUrl: null });
      setImageFile(null); // Reset the image file state
    }
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

      {/* Clothing Grid */}
      <div className="clothing-grid">
        {clothes.map((item) => (
          <div key={item.id} className="clothing-item">
            <img src={item.imageUrl} alt="Clothing item" />
            <div>{item.isFavorite && <span>⭐</span>}</div>
            <p>{item.description}</p>
          </div>
        ))}

        {/* Add Clothes Button */}
        <div className="clothing-item add-button" onClick={handleAddClothes}>
          <span>+ Add Clothes</span>
        </div>
      </div>

      {/* Modal for Adding Clothes */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Clothing</h2>

            <div className="form-group">
              <label>Category</label>
              <select value={newClothing.type} onChange={handleCategoryChange}>
                <option value="shirt">Shirt</option>
                <option value="pants">Pants</option>
                <option value="jacket">Jacket</option>
                <option value="hat">Hat</option>
                <option value="shoes">Shoes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Favorite</label>
              <input
                type="checkbox"
                checked={newClothing.isFavorite}
                onChange={handleFavoriteToggle}
              />
              <span>⭐</span>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newClothing.description}
                onChange={handleDescriptionChange}
                placeholder="Add a short description"
              />
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            {imageFile && (
              <div className="form-group">
                <Cropper
                  src={imageFile}
                  style={{ width: "100%", height: "auto" }}
                  aspectRatio={1}
                  guides={false}
                  ref={(cropperInstance) => setCropper(cropperInstance)}
                />
              </div>
            )}

            <button onClick={handleSaveClothing}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosetPage;
