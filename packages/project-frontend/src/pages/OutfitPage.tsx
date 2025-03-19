import React, { useState, useEffect } from "react";
import "./OutfitPage.css";
import Spinner from "./Spinner";

const GRID_SIZE = 20;

// Use the same ClothingItem type as in ClosetPage
interface ClothingItem {
  _id?: string;
  title: string;
  type: "shirts" | "pants" | "jackets" | "hats" | "shoes";
  isFavorite: boolean;
  description: string;
  imageUrl: string | null;
}

interface Outfit {
  _id?: string;
  title: string;
  hat: ClothingItem | null;
  shirt: ClothingItem | null;
  jacket: ClothingItem | null;
  pants: ClothingItem | null;
  shoes: ClothingItem | null;
  isFavorite: boolean;
}

interface OutfitPageProps {
  authToken: string | null;
}

type CategoryType = "All" | "Favorites";

const OutfitPage: React.FC<OutfitPageProps> = ({ authToken }) => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [closetLoading, setClosetLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
  const [error, setError] = useState<string | null>(null);

  const [newOutfit, setNewOutfit] = useState<Outfit>({
    title: "",
    hat: null,
    shirt: null,
    jacket: null,
    pants: null,
    shoes: null,
    isFavorite: false
  });

  // Fetch closet items from the server
  useEffect(() => {
    const fetchClosetItems = async () => {
      if (!authToken) {
        setClosetLoading(false);
        return;
      }
      
      try {
        setClosetLoading(true);
        
        const response = await fetch('/api/closet', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch closet items: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Closet items loaded:', data.length);
        if (data.length > 0) {
          console.log('Sample closet item:', {
            _id: data[0]._id,
            title: data[0].title,
            type: data[0].type,
            imageUrl: data[0].imageUrl
          });
          
          // Log all types for debugging
          const types = data.map((item: ClothingItem) => item.type);
          const uniqueTypes = [...new Set(types)];
          console.log('Unique types in closet:', uniqueTypes);
          
          // Count items by type
          uniqueTypes.forEach(type => {
            const count = data.filter((item: ClothingItem) => item.type === type).length;
            console.log(`  Type "${type}": ${count} items`);
          });
        }
        setClosetItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your closet items');
        console.error('Error fetching closet items:', err);
      } finally {
        setClosetLoading(false);
      }
    };

    fetchClosetItems();
  }, [authToken]);

  // Fetch outfits when component mounts or auth token changes
  useEffect(() => {
    const fetchOutfits = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching outfits from server...');
        
        const response = await fetch('/api/outfits', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch outfits: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Loaded ${data.length} outfits from server`);
        
        if (data.length > 0) {
          console.log('First outfit example:', {
            id: data[0]._id,
            title: data[0].title,
            items: {
              hat: data[0].hat?.title || 'none',
              shirt: data[0].shirt?.title || 'none',
              jacket: data[0].jacket?.title || 'none',
              pants: data[0].pants?.title || 'none',
              shoes: data[0].shoes?.title || 'none'
            }
          });
        }
        
        setOutfits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your outfits');
        console.error('Error fetching outfits:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, [authToken]);

  const handleAddOutfit = (): void => {
    setEditIndex(null);
    setShowModal(true);
    setNewOutfit({ 
      title: "", 
      hat: null, 
      shirt: null, 
      jacket: null, 
      pants: null, 
      shoes: null,
      isFavorite: false
    });
  };

  const handleEditOutfit = (index: number): void => {
    setEditIndex(index);
    setNewOutfit(outfits[index]);
    setShowModal(true);
  };

  const handleCategoryChange = (category: CategoryType): void => {
    setSelectedCategory(category);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    if (name === "title") {
      setNewOutfit({ ...newOutfit, title: value });
      return;
    }
    
    if (name === "isFavorite") {
      setNewOutfit({ ...newOutfit, isFavorite: (e.target as HTMLInputElement).checked });
      return;
    }
    
    if (!value) {
      // If empty value, set the corresponding item to null
      setNewOutfit({ ...newOutfit, [name]: null });
      return;
    }

    // Find the selected item from closet items
    const itemType = name as "hat" | "shirt" | "jacket" | "pants" | "shoes";
    const selectedItem = closetItems.find(item => item._id === value) || null;
    
    setNewOutfit({ ...newOutfit, [itemType]: selectedItem });
  };

  const handleSaveOutfit = async (): Promise<void> => {
    if (!authToken) {
      setError("You must be logged in to save outfits");
      return;
    }

    if (!newOutfit.title) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);
      
      // Create a safe copy of the outfit data for API submission
      // This prevents any circular references and makes sure we only send what's needed
      const outfitData = {
        title: newOutfit.title,
        isFavorite: newOutfit.isFavorite,
        hat: newOutfit.hat ? {
          _id: newOutfit.hat._id,
          title: newOutfit.hat.title,
          type: newOutfit.hat.type,
          imageUrl: newOutfit.hat.imageUrl
        } : null,
        shirt: newOutfit.shirt ? {
          _id: newOutfit.shirt._id,
          title: newOutfit.shirt.title,
          type: newOutfit.shirt.type,
          imageUrl: newOutfit.shirt.imageUrl
        } : null,
        jacket: newOutfit.jacket ? {
          _id: newOutfit.jacket._id,
          title: newOutfit.jacket.title,
          type: newOutfit.jacket.type,
          imageUrl: newOutfit.jacket.imageUrl
        } : null,
        pants: newOutfit.pants ? {
          _id: newOutfit.pants._id,
          title: newOutfit.pants.title,
          type: newOutfit.pants.type,
          imageUrl: newOutfit.pants.imageUrl
        } : null,
        shoes: newOutfit.shoes ? {
          _id: newOutfit.shoes._id,
          title: newOutfit.shoes.title,
          type: newOutfit.shoes.type,
          imageUrl: newOutfit.shoes.imageUrl
        } : null
      };
      
      console.log('Saving outfit data:', JSON.stringify(outfitData, null, 2));
      
      // Now perform the actual API request
      let response;
      
      if (editIndex !== null && outfits[editIndex]._id) {
        // Update existing outfit via API
        const outfitId = outfits[editIndex]._id;
        console.log(`Updating outfit with ID: ${outfitId}`);
        response = await fetch(`/api/outfits/${outfitId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(outfitData)
        });
      } else {
        // Create new outfit via API
        console.log('Creating new outfit');
        response = await fetch('/api/outfits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(outfitData)
        });
      }
      
      if (!response.ok) {
        console.error(`API call failed with status: ${response.status}`);
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData?.error || `Failed with status: ${response.status}`;
        } catch (e) {
          errorText = `Failed with status: ${response.status}`;
        }
        throw new Error(errorText);
      }
      
      const savedOutfit = await response.json();
      console.log('Outfit saved successfully:', savedOutfit);
      
      // Update the local state with the saved outfit
      if (editIndex !== null) {
        // Update existing outfit
        const updatedOutfits = [...outfits];
        updatedOutfits[editIndex] = savedOutfit;
        setOutfits(updatedOutfits);
      } else {
        // Add new outfit
        setOutfits([...outfits, savedOutfit]);
      }

      setShowModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save outfit');
      console.error('Error saving outfit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutfit = async (): Promise<void> => {
    if (editIndex === null || !authToken) return;
    
    const outfitId = outfits[editIndex]._id;
    if (!outfitId) {
      setError("Cannot delete outfit: missing ID");
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete from the server via API
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed with status: ${response.status}`);
      }
      
      console.log('Outfit deleted successfully');
      
      // Update local state
      const updatedOutfits = outfits.filter((_, index) => index !== editIndex);
      setOutfits(updatedOutfits);
      setShowModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete outfit');
      console.error('Error deleting outfit:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter outfits based on selected category
  const filteredOutfits = outfits.filter((outfit) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Favorites") return outfit.isFavorite;
    return false;
  });

  // This function is important for debugging - let's preserve actual parameters
  const _getItemsByType = (type: string) => {
    console.log(`Getting items of type "${type}"`);
    const result = closetItems.filter((item: ClothingItem) => item.type === type);
    console.log(`Found ${result.length} items of type "${type}"`);
    
    if (result.length === 0) {
      console.log(`No items found with EXACT type "${type}"`);
      // Additional debug info to find potential type mismatches
      const allTypes = closetItems.map((item: ClothingItem) => `"${item.type}"`);
      console.log(`All types in closet: ${allTypes.join(', ')}`);
    } else {
      console.log(`Items found: ${result.map((item: ClothingItem) => item.title).join(', ')}`);
    }
    
    return result;
  };

  // Get clothing items by type using improved filter logic
  const getItemsByType = (type: string) => {
    // Try exact match first (this should work based on our logs)
    const exactMatches = _getItemsByType(type);
    if (exactMatches.length > 0) {
      return exactMatches;
    }
    
    // Fallback: try case-insensitive match if exact match fails
    console.log(`Falling back to case-insensitive for type "${type}"`);
    const fallbackMatches = closetItems.filter((item: ClothingItem) => {
      return item.type.toLowerCase() === type.toLowerCase();
    });
    
    console.log(`Found ${fallbackMatches.length} items with case-insensitive match for "${type}"`);
    return fallbackMatches;
  };

  return (
    <div className="outfit-container">
      {/* Error message display */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
      {/* Loading indicator */}
      {(loading || closetLoading) && <div className="loading-spinner">Loading...</div>}
      
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

      <div className="outfit-grid">
        {(loading || closetLoading) ? (
          <div className="grid-slot loading-slot">
            <Spinner className="text-blue-500 size-12" />
            <p>Loading...</p>
          </div>
        ) : (
          [...filteredOutfits, ...Array(GRID_SIZE - filteredOutfits.length).fill(null)].map((outfit, index) => {
            if (outfit) {
              return (
                <div 
                  key={outfit._id || index} 
                  className="grid-slot filled" 
                  onClick={() => handleEditOutfit(outfits.indexOf(outfit))}
                >
                  <div className="outfit-4x1-grid">
                    <div className="outfit-row hat">
                      {outfit.hat && (
                        <img 
                          src={outfit.hat.imageUrl || ''} 
                          alt={outfit.hat.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      )}
                    </div>
                    <div className="outfit-row shirt-jacket">
                      {outfit.shirt && (
                        <img 
                          src={outfit.shirt.imageUrl || ''} 
                          alt={outfit.shirt.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      )}
                      {outfit.jacket && (
                        <img 
                          src={outfit.jacket.imageUrl || ''} 
                          alt={outfit.jacket.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      )}
                    </div>
                    <div className="outfit-row pants">
                      {outfit.pants && (
                        <img 
                          src={outfit.pants.imageUrl || ''} 
                          alt={outfit.pants.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      )}
                    </div>
                    <div className="outfit-row shoes">
                      {outfit.shoes && (
                        <img 
                          src={outfit.shoes.imageUrl || ''} 
                          alt={outfit.shoes.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <p className="outfit-title">{outfit.title}</p>
                  {outfit.isFavorite && <span className="favorite-star">★</span>}
                </div>
              );
            } else if (index === filteredOutfits.length) {
              return (
                <div key={`empty-${index}`} className="grid-slot empty" onClick={handleAddOutfit}>
                  <div className="add-button">+ Add Outfit</div>
                </div>
              );
            } else {
              return <div key={`empty-${index}`} className="grid-slot empty"></div>;
            }
          })
        )}
      </div>

      {/* Modal for Adding/Editing Outfits */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editIndex !== null ? "Edit Outfit" : "Add New Outfit"}</h2>

            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                name="title" 
                value={newOutfit.title} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            {/* Favorite checkbox */}
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="isFavorite"
                  checked={newOutfit.isFavorite} 
                  onChange={handleInputChange} 
                />
                Favorite
              </label>
            </div>

            {/* Clothing selectors for each category */}
            {[
              { name: "hat", type: "hats", label: "Hat" },
              { name: "shirt", type: "shirts", label: "Shirt" },
              { name: "jacket", type: "jackets", label: "Jacket" },
              { name: "pants", type: "pants", label: "Pants" },
              { name: "shoes", type: "shoes", label: "Shoes" }
            ].map(({ name, type, label }) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <select 
                  name={name} 
                  value={(newOutfit[name as keyof Outfit] as ClothingItem | null)?._id || ""} 
                  onChange={handleInputChange}
                >
                  <option value="">Select {label}</option>
                  {getItemsByType(type).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                <div className="type-info">
                  {getItemsByType(type).length === 0 && (
                    <p className="no-items-message">No {type} found in your closet. Add some in the Closet page!</p>
                  )}
                </div>
                {/* Debug information */}
                <div className="debug-info" style={{fontSize: '10px', color: '#999', marginTop: '2px'}}>
                  Looking for type: "{type}"
                </div>
              </div>
            ))}

            <div className="modal-buttons">
              <button 
                onClick={handleSaveOutfit} 
                disabled={loading}
                className="save-button"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              
              {editIndex !== null && (
                <button 
                  onClick={handleDeleteOutfit} 
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

      {/* Preview section */}
      {showModal && (
        <div className="preview-section">
          <h3>Outfit Preview</h3>
          <div className="outfit-preview">
            <div className="preview-item">
              <p>Hat</p>
              {newOutfit.hat ? (
                <img 
                  src={newOutfit.hat.imageUrl || ''} 
                  alt={newOutfit.hat.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              ) : (
                <div className="empty-preview">No hat selected</div>
              )}
            </div>
            
            <div className="preview-item">
              <p>Shirt</p>
              {newOutfit.shirt ? (
                <img 
                  src={newOutfit.shirt.imageUrl || ''} 
                  alt={newOutfit.shirt.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              ) : (
                <div className="empty-preview">No shirt selected</div>
              )}
            </div>
            
            <div className="preview-item">
              <p>Jacket</p>
              {newOutfit.jacket ? (
                <img 
                  src={newOutfit.jacket.imageUrl || ''} 
                  alt={newOutfit.jacket.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              ) : (
                <div className="empty-preview">No jacket selected</div>
              )}
            </div>
            
            <div className="preview-item">
              <p>Pants</p>
              {newOutfit.pants ? (
                <img 
                  src={newOutfit.pants.imageUrl || ''} 
                  alt={newOutfit.pants.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              ) : (
                <div className="empty-preview">No pants selected</div>
              )}
            </div>
            
            <div className="preview-item">
              <p>Shoes</p>
              {newOutfit.shoes ? (
                <img 
                  src={newOutfit.shoes.imageUrl || ''} 
                  alt={newOutfit.shoes.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              ) : (
                <div className="empty-preview">No shoes selected</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitPage;