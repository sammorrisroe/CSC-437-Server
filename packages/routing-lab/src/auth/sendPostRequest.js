export async function sendPostRequest(url, payload) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include' // Include cookies for authentication
      });
  
      // Check if the response is not OK (status outside the range 200-299)
      if (!response.ok) {
        // Try to parse error message from response if possible
        let errorData;
        try {
          const text = await response.text();
          // Only try to parse as JSON if there's actual content
          errorData = text ? JSON.parse(text) : { message: response.statusText };
        } catch (e) {
          // If parsing JSON fails, use status text as fallback
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        
        // Throw a more detailed error with status and message
        throw new Error(
          errorData.message || 
          `Request failed with status ${response.status}: ${response.statusText}`
        );
      }
  
      // Check if there's content in the response before trying to parse it
      const text = await response.text();
      if (!text) {
        // If the response is empty (like in a 204 No Content), return an empty object
        return {};
      }
  
      // Parse and return successful response as JSON
      try {
        return JSON.parse(text);
      } catch (e) {
        // If we can't parse it as JSON, return the raw text
        return { message: text };
      }
    } catch (error) {
      // Re-throw any errors that occurred during the fetch
      throw error;
    }
  }