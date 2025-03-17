import React, { useState } from "react";
import "./ClosetPage.css";

const GRID_SIZE = 20;
const categories = ["All", "Favorites", "Shirts", "Pants", "Jackets", "Hats", "Shoes"];

type ClothingType = "shirts" | "pants" | "jackets" | "hats" | "shoes";
type CategoryType = "All" | "Favorites" | "Shirts" | "Pants" | "Jackets" | "Hats" | "Shoes";

interface ClothingItem {
  title: string;
  type: ClothingType;
  isFavorite: boolean;
  description: string;
  imageUrl: string | null;
}

const ClosetPage: React.FC = () => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");

  const [newClothing, setNewClothing] = useState<ClothingItem>({
    title: "",
    type: "shirts",
    isFavorite: false,
    description: "",
    imageUrl: null,
  });

  const handleAddClothes = (): void => {
    setEditIndex(null);
    setShowModal(true);
    setNewClothing({ title: "", type: "shirts", isFavorite: false, description: "", imageUrl: null });
  };

  const handleEditClothes = (index: number): void => {
    setEditIndex(index);
    setNewClothing(clothes[index]);
    setShowModal(true);
  };

  const handleCategoryChange = (category: CategoryType): void => {
    setSelectedCategory(category);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setNewClothing({ ...newClothing, [e.target.name]: e.target.value });
  };

  const handleFavoriteToggle = (): void => {
    setNewClothing({ ...newClothing, isFavorite: !newClothing.isFavorite });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files[0]) {
      setNewClothing({ ...newClothing, imageUrl: URL.createObjectURL(files[0]) });
    }
  };

  const handleSaveClothing = (): void => {
    if (!newClothing.imageUrl || !newClothing.title) return;

    if (editIndex !== null) {
      const updatedClothes = [...clothes];
      updatedClothes[editIndex] = newClothing;
      setClothes(updatedClothes);
    } else {
      setClothes([...clothes, newClothing]);
    }

    setShowModal(false);
    setNewClothing({ title: "", type: "shirts", isFavorite: false, description: "", imageUrl: null });
  };

  const handleDeleteClothing = (): void => {
    if (editIndex !== null) {
      const updatedClothes = clothes.filter((_, index) => index !== editIndex);
      setClothes(updatedClothes);
    }
    setShowModal(false);
  };

  const filteredClothes = clothes.filter((item) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Favorites") return item.isFavorite;
    return item.type.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="closet-container">
      {/* Navigation Tabs */}
      <nav className="category-nav">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-button ${selectedCategory === category ? "active" : ""}`}
            onClick={() => handleCategoryChange(category as CategoryType)}
          >
            {category}
          </button>
        ))}
      </nav>

      {/* Dynamic Clothing Grid */}
      <div className="clothing-grid">
        {[...filteredClothes, ...Array(GRID_SIZE - filteredClothes.length).fill(null)].map((item, index) => {
          if (item) {
            return (
              <div key={index} className="grid-slot filled" onClick={() => handleEditClothes(clothes.indexOf(item))}>
                <img src={item.imageUrl || ''} alt={item.title} className="clothing-image" />
                <p className="clothing-title">{item.title}</p>
              </div>
            );
          } else if (index === filteredClothes.length) {
            return (
              <div key={index} className="grid-slot empty" onClick={handleAddClothes}>
                <div className="add-button">+ Add Clothes</div>
              </div>
            );
          } else {
            return <div key={index} className="grid-slot empty"></div>;
          }
        })}
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
                <option value="shirts">Shirts</option>
                <option value="pants">Pants</option>
                <option value="jackets">Jackets</option>
                <option value="hats">Hats</option>
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
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>

            {newClothing.imageUrl && 
              <img src={newClothing.imageUrl} alt="Preview" className="preview-image" />
            }

            <button onClick={handleSaveClothing}>Save</button>
            {editIndex !== null && 
              <button onClick={handleDeleteClothing} className="delete-button">Delete</button>
            }
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosetPage;