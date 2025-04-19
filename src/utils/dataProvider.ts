/**
 * DataProvider - A utility class for handling data operations with fallback mechanisms
 */
export class DataProvider {
  
  /**
   * Makes an API request with automatic endpoint fallback capabilities
   * @param primaryEndpoint The primary endpoint to try first
   * @param fallbackEndpoint The fallback endpoint to try if primary fails
   * @param fetchOptions The fetch options (method, headers, body)
   * @returns The response data
   */
  static async fetchWithFallback(
    primaryEndpoint: string, 
    fallbackEndpoint: string,
    fetchOptions: RequestInit = {}
  ): Promise<any> {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      console.log(`Trying primary endpoint: ${primaryEndpoint}`);
      const response = await fetch(`${baseUrl}${primaryEndpoint}`, {
        ...fetchOptions,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`Primary endpoint failed with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (primaryError) {
      console.log(`Primary endpoint failed: ${primaryError}`);
      console.log(`Trying fallback endpoint: ${fallbackEndpoint}`);
      
      try {
        const response = await fetch(`${baseUrl}${fallbackEndpoint}`, {
          ...fetchOptions,
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers
          }
        });
        
        if (!response.ok) {
          throw new Error(`Fallback endpoint failed with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (fallbackError) {
        console.log(`Fallback endpoint failed: ${fallbackError}`);
        throw new Error(`All endpoints failed: ${primaryError}. Fallback: ${fallbackError}`);
      }
    }
  }
  
  /**
   * Check if backend is available
   */
  static async checkBackendAvailability(): Promise<boolean> {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/`, { 
        method: 'GET',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
}
