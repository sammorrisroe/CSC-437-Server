import { useEffect, useState } from "react";

export function useImageFetching(imageId, delay=0) {
    const [isLoading, setIsLoading] = useState(true);
    const [fetchedImages, setFetchedImages] = useState([]);
    
    useEffect(() => {
        setIsLoading(true);
        
        // Always fetch all images from the API
        fetch("/api/images")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (imageId === "") {
                    // If no specific image ID requested, return all images
                    setFetchedImages(data);
                } else {
                    // If a specific image ID is requested, filter the results
                    const filteredImages = data.filter(image => image._id === imageId);
                    setFetchedImages(filteredImages);
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching images:", error);
                setIsLoading(false);
            });
    }, [imageId]);

    return { isLoading, fetchedImages };
}