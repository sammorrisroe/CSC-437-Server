import React, { useState, useEffect } from "react";
import "./ClosetPage.css";

const GRID_SIZE = 20;
const categories = ["All", "Favorites", "Shirts", "Pants", "Jackets", "Hats", "Shoes"];

type ClothingType = "shirts" | "pants" | "jackets" | "hats" | "shoes";
type CategoryType = "All" | "Favorites" | "Shirts" | "Pants" | "Jackets" | "Hats" | "Shoes";

interface ClothingItem {
  _id?: string;
  title: string;
  type: ClothingType;
  isFavorite: boolean;
  description: string;
  imageUrl: string | null;
}

interface ClosetPageProps {
  authToken: string | null;
}

const ClosetPage: React.FC<ClosetPageProps> = ({ authToken }) => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [newClothing, setNewClothing] = useState<ClothingItem>({
    title: "",
    type: "shirts",
    isFavorite: false,
    description: "",
    imageUrl: null,
  });

  // Load closet items from the server
  useEffect(() => {
    const fetchClosetItems = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching closet items with auth token:", authToken?.substring(0, 10) + "...");
        
        const response = await fetch('/api/closet', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Closet items received:", data);
        
        // Process the retrieved items to ensure valid image URLs
        const processedData = data.map((item: any) => {
          if (item.imageUrl) {
            // Make sure imageUrl is correctly formatted to point to the uploads directory
            // If imageUrl doesn't start with a protocol or slash, add '/uploads/' prefix
            if (!item.imageUrl.startsWith('http') && !item.imageUrl.startsWith('/')) {
              item.imageUrl = `/uploads/${item.imageUrl}`;
            }
          }
          return item;
        });
        
        console.log("Processed closet items with fixed image URLs:", processedData.map((item: any) => ({
          id: item._id,
          imageUrl: item.imageUrl
        })));
        
        setClothes(processedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your closet items');
        console.error('Error fetching closet items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClosetItems();
  }, [authToken]);

  const handleAddClothes = (): void => {
    setEditIndex(null);
    setShowModal(true);
    setSelectedFile(null);
    setNewClothing({ 
      title: "", 
      type: "shirts", 
      isFavorite: false, 
      description: "", 
      imageUrl: null 
    });
  };

  const handleEditClothes = (index: number): void => {
    setEditIndex(index);
    setNewClothing(clothes[index]);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCategoryChange = (category: CategoryType): void => {
    setSelectedCategory(category);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    setNewClothing({ ...newClothing, [e.target.name]: e.target.value });
  };

  const handleFavoriteToggle = (): void => {
    setNewClothing({ ...newClothing, isFavorite: !newClothing.isFavorite });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setSelectedFile(file);
      console.log("Image selected for preview:", {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Create a preview URL for display
      setNewClothing({ 
        ...newClothing, 
        imageUrl: URL.createObjectURL(file) 
      });
    }
  };

  const handleSaveClothing = async (): Promise<void> => {
    if (!authToken) {
      setError("You must be logged in to save items");
      return;
    }

    if (!newClothing.title) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);
      
      // Create a FormData object to send the file and other data
      const formData = new FormData();
      formData.append("title", newClothing.title);
      formData.append("type", newClothing.type);
      formData.append("isFavorite", String(newClothing.isFavorite));
      formData.append("description", newClothing.description || "");
      
      // Log formData keys for debugging
      console.log("FormData initial keys:", [...formData.keys()]);
      
      let isUpdate = false;
      let itemId: string | undefined;
      
      if (editIndex !== null) {
        // We're updating an existing item
        isUpdate = true;
        itemId = clothes[editIndex]._id;
        console.log(`Updating item: ${itemId}`);
        
        // Only append a file if the user selected a new one
        if (selectedFile) {
          console.log("Uploading new file for existing item:", {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size
          });
          formData.append("image", selectedFile);
        } else {
          console.log("No new file selected for update, keeping existing image");
        }
      } else {
        // This is a new item, file is required
        if (selectedFile) {
          console.log("Uploading file for new item:", {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size
          });
          formData.append("image", selectedFile);
        } else {
          setError("Image is required");
          setLoading(false);
          return;
        }
      }
      
      // Log the final form data
      console.log("Final FormData keys:", [...formData.keys()]);

      // Determine the URL and method based on whether we're updating or creating
      const url = isUpdate ? `/api/closet/${itemId}` : '/api/closet';
      const method = isUpdate ? 'PUT' : 'POST';
      
      console.log(`Sending ${method} request to ${url}`);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${authToken}`
          // Don't set Content-Type with FormData, let the browser set it with the boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Failed to save: ${response.statusText} (${errorText})`);
      }

      const savedItem = await response.json();
      console.log("Saved item response:", savedItem);
      
      // Process the saved item to ensure the imageUrl is correctly formatted
      if (savedItem.imageUrl && !savedItem.imageUrl.startsWith('http') && !savedItem.imageUrl.startsWith('/')) {
        savedItem.imageUrl = `/uploads/${savedItem.imageUrl}`;
      }
      
      if (isUpdate) {
        // Replace the updated item in the array
        setClothes(clothes.map((item, idx) => 
          idx === editIndex ? savedItem : item
        ));
      } else {
        // Add the new item to the array
        setClothes([...clothes, savedItem]);
      }

      setShowModal(false);
      setError(null);
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save clothing item');
      console.error('Error saving clothing item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClothing = async (): Promise<void> => {
    if (editIndex === null || !authToken) return;
    
    const itemId = clothes[editIndex]._id;
    if (!itemId) return;
    
    try {
      setLoading(true);
      console.log(`Deleting item: ${itemId}`);
      
      const response = await fetch(`/api/closet/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`);
      }
      
      // Remove the item from the state
      setClothes(clothes.filter((_, index) => index !== editIndex));
      setShowModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Error deleting item:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClothes = clothes.filter((item) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Favorites") return item.isFavorite;
    return item.type.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Function to get proper image URL for display
  const getImageUrl = (item: ClothingItem): string => {
    if (!item.imageUrl) return 'https://via.placeholder.com/150?text=No+Image';
    
    // If it's already a complete URL or starts with /, return it directly
    if (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/')) {
      return item.imageUrl;
    }
    
    // Otherwise, prepend the uploads path
    return `/uploads/${item.imageUrl}`;
  };

  return (
    <div className="closet-container">
      {/* Error message display */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && <div className="loading-spinner">Loading...</div>}
      
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
              <div 
                key={item._id || index} 
                className="grid-slot filled" 
                onClick={() => handleEditClothes(clothes.indexOf(item))}
              >
                <img 
                  src={getImageUrl(item)}
                  onError={(e) => {
                    console.error(`Error loading image: ${item.imageUrl}`);
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error';
                  }}
                  alt={item.title} 
                  className="clothing-image" 
                />
                <p className="clothing-title">{item.title}</p>
                {item.isFavorite && <span className="favorite-star">★</span>}
              </div>
            );
          } else if (index === filteredClothes.length) {
            return (
              <div key={`empty-${index}`} className="grid-slot empty" onClick={handleAddClothes}>
                <div className="add-button">+ Add Clothes</div>
              </div>
            );
          } else {
            return <div key={`empty-${index}`} className="grid-slot empty"></div>;
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
              <input 
                type="text" 
                name="title" 
                value={newClothing.title} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select 
                name="type" 
                value={newClothing.type} 
                onChange={handleInputChange}
              >
                <option value="shirts">Shirts</option>
                <option value="pants">Pants</option>
                <option value="jackets">Jackets</option>
                <option value="hats">Hats</option>
                <option value="shoes">Shoes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={newClothing.description || ""}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={newClothing.isFavorite} 
                  onChange={handleFavoriteToggle} 
                />
                Favorite
              </label>
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                name="image"
              />
            </div>

            {newClothing.imageUrl && (
              <div className="preview-container">
                <img 
                  src={newClothing.imageUrl} 
                  alt="Preview" 
                  className="preview-image" 
                  onError={(e) => {
                    console.error(`Error loading preview image`);
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Preview+Error';
                  }}
                />
              </div>
            )}

            <div className="modal-buttons">
              <button 
                onClick={handleSaveClothing} 
                disabled={loading}
                className="save-button"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              
              {editIndex !== null && (
                <button 
                  onClick={handleDeleteClothing} 
                  disabled={loading}
                  className="delete-button"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              )}
              
              <button 
                onClick={() => setShowModal(false)} 
                disabled={loading}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosetPage;