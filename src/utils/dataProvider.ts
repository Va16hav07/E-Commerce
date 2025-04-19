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
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    
    try {
      console.log(`Trying primary endpoint: ${primaryEndpoint}`);
      const response = await fetch(`${baseUrl}${primaryEndpoint}`, {
        ...fetchOptions,
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Primary endpoint failed with status: ${response.status}`, errorText);
        throw new Error(`Primary endpoint failed with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (primaryError) {
      console.log(`Primary endpoint failed: ${primaryError}`);
      console.log(`Trying fallback endpoint: ${fallbackEndpoint}`);
      
      try {
        const secondResponse = await fetch(`${baseUrl}${fallbackEndpoint}`, {
          ...fetchOptions,
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers
          }
        });
        
        if (!secondResponse.ok) {
          const errorText = await secondResponse.text();
          console.error(`Fallback endpoint failed with status: ${secondResponse.status}`, errorText);
          throw new Error(`Fallback endpoint failed with status: ${secondResponse.status}`);
        }
        
        return await secondResponse.json();
      } catch (fallbackError) {
        console.log(`Fallback endpoint failed: ${fallbackError}`);
        
        // Try one more fallback to /user endpoint
        try {
          const thirdEndpoint = '/user' + fallbackEndpoint;
          console.log(`Trying third fallback endpoint: ${thirdEndpoint}`);
          
          const thirdResponse = await fetch(`${baseUrl}${thirdEndpoint}`, {
            ...fetchOptions,
            mode: 'cors',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...fetchOptions.headers
            }
          });
          
          if (!thirdResponse.ok) {
            const errorText = await thirdResponse.text();
            console.error(`Third endpoint failed with status: ${thirdResponse.status}`, errorText);
            throw new Error(`Third endpoint failed with status: ${thirdResponse.status}`);
          }
          
          return await thirdResponse.json();
        } catch (thirdError) {
          console.error(`All endpoints failed. Last error:`, thirdError);
          throw new Error(`All endpoints failed: ${primaryError}. Fallback: ${fallbackError}. Third: ${thirdError}`);
        }
      }
    }
  }
  
  /**
   * Check if backend is available
   */
  static async checkBackendAvailability(): Promise<boolean> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const response = await fetch(`${baseUrl}/health-check`, { 
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.ok;
    } catch (error) {
      console.error("Backend availability check failed:", error);
      return false;
    }
  }
}
