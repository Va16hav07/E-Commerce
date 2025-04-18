
/**
 * DataProvider - A utility class for handling data operations with fallback mechanisms
 */
export class DataProvider {
  
  
  
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
