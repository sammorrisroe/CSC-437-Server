// useImageFetching.js - modified to include auth token
import { useState, useEffect } from "react";

export function useImageFetching(imageId, delay = 0) {
    const [isLoading, setIsLoading] = useState(true);
    const [fetchedImages, setFetchedImages] = useState([]);
    const [error, setError] = useState(null);
    // Store token in state
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

    // Fetch token if not available
    useEffect(() => {
        const getToken = async () => {
            if (!authToken) {
                try {
                    const response = await fetch('/dev-token');
                    const data = await response.json();
                    localStorage.setItem('authToken', data.token);
                    setAuthToken(data.token);
                } catch (err) {
                    console.error("Error fetching token:", err);
                }
            }
        };
        
        getToken();
    }, [authToken]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Add a small delay if needed
                if (delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                // Check if we have a token
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error("No authentication token available");
                }

                const response = await fetch('/api/images', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setFetchedImages(data);
            } catch (err) {
                console.error("Error in useImageFetching:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [imageId, delay, authToken]);

    return { isLoading, fetchedImages, error };
}