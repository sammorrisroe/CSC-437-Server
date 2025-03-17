export async function sendPostRequest<T>(endpoint: string, data: any): Promise<T> {
  try {
    console.log(`Sending request to ${endpoint} with data:`, data);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Get the raw text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}: ${responseText}`);
    }
    
    // Try to parse as JSON only if we have content
    if (responseText.trim() === '') {
      console.warn('Empty response received');
      return {} as T;
    }
    
    try {
      const jsonData = JSON.parse(responseText);
      return jsonData;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error('Error in sendPostRequest:', error);
    throw error;
  }
}