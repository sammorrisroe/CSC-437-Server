import { useState } from "react";

export function ImageEditForm() {
    const [imageId, setImageId] = useState("");
    const [imageName, setImageName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e) {
      e.preventDefault();
      setIsLoading(true);
      
      try {
          const response = await fetch(`/api/images/${imageId}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: imageName }),
          });
          
          if (response.status === 204) {
              alert("Image name updated successfully!");
          } else if (response.status === 404) {
              alert("Error: Image not found");
          } else if (response.status === 400) {
              alert("Error: Missing name property");
          } else {
              const data = await response.json();
              alert(`Error: ${data.message || 'Unknown error occurred'}`);
          }
      } catch (error) {
          console.error("Error updating image name:", error);
          alert("Error: Failed to send request");
      } finally {
          setImageId("");
          setImageName("");
          setIsLoading(false);
      }
    }

    return (
        <div>
            <label style={{ display: "block" }}>
                Image ID
                <input
                        value={imageId}
                        disabled={isLoading}
                        onChange={(e) => setImageId(e.target.value)}
                />
            </label>
            <label style={{ display: "block" }}>
                New image name
                <input
                        value={imageName}
                        disabled={isLoading}
                        onChange={(e) => setImageName(e.target.value)}
                />
            </label>
            <button type="submit" disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? "Updating..." : "Send request"}
          </button>
        </div>
    );
}
