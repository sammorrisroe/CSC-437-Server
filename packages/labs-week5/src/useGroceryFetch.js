import { useState, useEffect } from "react";
import { groceryFetcher } from "./groceryFetcher";

export function useGroceryFetch(source) {
    const [groceryData, setGroceryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isStale = false;
        
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            setGroceryData([]);

            try {
                const data = await groceryFetcher.fetch(source);
                if (!isStale) {
                    setGroceryData(data);
                }
            } catch (err) {
                if (!isStale) {
                    setError("Error fetching grocery data.");
                }
            } finally {
                if (!isStale) {
                    setIsLoading(false);
                }
            }
        }

        if (source) {
            fetchData();
        }
        
        // Cleanup function that marks any in-flight requests as stale
        return () => {
            isStale = true;
        };
    }, [source]);

    return { groceryData, isLoading, error };
}