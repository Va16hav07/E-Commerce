import axios, { AxiosError } from 'axios';
import { Product } from '../types';
import { DataProvider } from '../utils/dataProvider';

const getBaseUrl = () => {
  
  const { protocol, hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1'
    ? `${protocol}//${hostname}:5000`
    : `${protocol}//${hostname}/api`;
};

const API_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  }
});

const handleApiError = (error: AxiosError, defaultMessage: string = 'An error occurred') => {
  let errorMessage = defaultMessage;
  
  if (error.response) {
    const responseData = error.response.data as any;
    console.log('API Error Response:', responseData);
    
    if (responseData && responseData.message) {
      errorMessage = responseData.message;
    } else {
      errorMessage = `Error ${error.response.status}: ${defaultMessage}`;
    }
  } else if (error.request) {
    errorMessage = 'No response from server. Please check your network connection.';
  }
  
  return new Error(errorMessage);
};

export const authService = {
  // Login
  async login(email: string, password: string) {
    try {
      // Try primary endpoint first, then fallback
      try {
        const response = await api.post('/auth/login', { email, password });
        return response.data.data;
      } catch (error) {
        console.error('First login endpoint failed, trying alternate endpoint', error);
        const response = await api.post('/login', { email, password });
        return response.data.data;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw handleApiError(error as AxiosError, 'Login failed');
    }
  },
  
  // Register
  async register(name: string, email: string, password: string, phone?: string) {
    try {
      // First try /auth/register endpoint
      try {
        console.log('Trying primary register endpoint: /auth/register');
        const response = await api.post('/auth/register', { name, email, password, phone });
        console.log('Registration successful with primary endpoint', response.data);
        return response.data.data;
      } catch (primaryError) {
        console.error('Primary register endpoint failed, trying alternate endpoint', primaryError);
        
        // Fallback to /register endpoint
        try {
          console.log('Trying fallback register endpoint: /register');
          const response = await api.post('/register', { name, email, password, phone });
          console.log('Registration successful with fallback endpoint', response.data);
          return response.data.data;
        } catch (fallbackError) {
          console.error('Fallback register endpoint failed too', fallbackError);
          
          // Try using the DataProvider as a last resort
          console.log('Trying with DataProvider');
          const data = await DataProvider.fetchWithFallback(
            '/auth/register',
            '/register',
            {
              method: 'POST',
              body: JSON.stringify({ name, email, password, phone })
            }
          );
          
          console.log('Registration successful with DataProvider', data);
          return data.data;
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw handleApiError(error as AxiosError, 'Registration failed');
    }
  },
  
  // Google OAuth login
  initiateGoogleLogin() {
    return `${API_URL}/auth/google`;
  },
  
  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        return response.data.user;
      }
      throw new Error('User not authenticated');
    } catch (error) {
      throw handleApiError(error as AxiosError, 'Failed to get current user');
    }
  },
  
  // Logout
  async logout() {
    try {
      await api.get('/auth/logout');
      localStorage.removeItem('authToken');
    } catch (error) {
      throw handleApiError(error as AxiosError, 'Logout failed');
    }
  }
};

export const authAPI = {
  
  verifySession: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify-session`, {
        withCredentials: true // Important: This ensures cookies are sent with the request
      });
      return response.data;
    } catch (error) {
      console.error('Session verification error:', error);
      return { success: false, message: 'Session verification failed' };
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
    }
  },
};

// Products API calls
export const productAPI = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    try {
      console.log('Fetching products from API endpoint');
      
      // Try different API endpoint variations
      let response;
      try {
        console.log('Trying with /api/products endpoint');
        response = await api.get('/api/products');
        console.log('Success with /api/products endpoint');
      } catch (apiError: any) {
        console.log('First endpoint failed with error:', apiError.message);
        
        try {
          console.log('Trying alternate endpoint /products');
          response = await api.get('/products');
          console.log('Success with /products endpoint');
        } catch (secondError: any) {
          console.log('All API endpoints failed');
          throw new Error('Failed to fetch products from API');
        }
      }
      
      if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
        console.error('Invalid API response format:', response.data);
        throw new Error('Invalid API response format');
      }
      const products = response.data.data.map((item: any) => ({
        id: item._id || item.id,
        name: item.title || item.name,
        description: item.description || '',
        imageUrl: item.image || item.imageUrl || 'https://via.placeholder.com/300',
        category: item.category || 'Uncategorized',
        rating: item.rating || 0,
        basePrice: item.price || item.basePrice || 0,
        variants: Array.isArray(item.variants) 
          ? item.variants.map((variant: any) => ({
              color: variant.color || 'Default',
              size: variant.size || 'Standard',
              price: variant.price || item.price || 0,
              stock: variant.stock || 0
            }))
          : [{ color: 'Default', size: 'Standard', price: item.price || 0, stock: 10 }]
      }));
      
      console.log(`Successfully transformed ${products.length} products`);
      return products;
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  // Get single product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      console.log(`Fetching product with ID ${id}`);
      let response;
      try {
        response = await api.get(`/api/products/${id}`);
        console.log('Product fetched from /api/products/:id', response.data);
      } catch (apiError) {
        console.log('First endpoint failed, trying alternate endpoint', apiError);
        response = await api.get(`/products/${id}`);
        console.log('Product fetched from /products/:id', response.data);
      }
      
      const item = response.data.data;
      if (!item) {
        console.log('Product not found in API response');
        return null;
      }
      
      console.log('Transforming product data:', item);
      return {
        id: item._id || item.id,
        name: item.title || item.name,
        description: item.description,
        imageUrl: item.image || item.imageUrl,
        category: item.category,
        rating: item.rating || 0,
        basePrice: item.price || item.basePrice || 0,
        variants: Array.isArray(item.variants) ? item.variants.map((variant: any) => ({
          color: variant.color,
          size: variant.size,
          price: variant.price,
          stock: variant.stock
        })) : []
      };
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return null;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      let response;
      try {
        console.log('Trying to fetch featured products from /api/products?featured=true');
        response = await api.get('/api/products?featured=true');
        console.log('Success with /api/products?featured=true endpoint');
      } catch (apiError) {
        console.log('First endpoint failed, trying alternate endpoint', apiError);
        try {
          console.log('Trying to fetch featured products from /products?featured=true');
          response = await api.get('/products?featured=true');
          console.log('Success with /products?featured=true endpoint');
        } catch (secondError) {
          console.log('Featured products endpoints failed, falling back to getProducts');
          throw new Error('Failed to fetch featured products');
        }
      }
      if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
        console.error('Invalid API response format for featured products:', response.data);
        throw new Error('Invalid featured products API response format');
      }
      const products = response.data.data.map((item: any) => ({
        id: item._id || item.id,
        name: item.title || item.name,
        description: item.description || '',
        imageUrl: item.image || item.imageUrl || 'https://via.placeholder.com/300',
        category: item.category || 'Uncategorized',
        rating: item.rating || 0,
        basePrice: item.price || item.basePrice || 0,
        variants: Array.isArray(item.variants) 
          ? item.variants.map((variant: any) => ({
              color: variant.color || 'Default',
              size: variant.size || 'Standard',
              price: variant.price || item.price || 0,
              stock: variant.stock || 0
            }))
          : [{ color: 'Default', size: 'Standard', price: item.price || 0, stock: 10 }]
      }));
      
      // Limit to exactly 3 products
      const limitedProducts = products.slice(0, 3);
      console.log(`Returning ${limitedProducts.length} featured products`);
      return limitedProducts;
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      try {
        const allProducts = await this.getProducts();
        const featured = allProducts
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        
        console.log(`Falling back to ${featured.length} highest-rated products`);
        return featured;
      } catch (fallbackError) {
        console.error('Error in featured products fallback:', fallbackError);
        return []; // Return empty array to avoid map errors
      }
    }
  }
};

// Orders API calls
export const orderAPI = {
  createOrder: async (orderData: {
    items: Array<{
      productId: string;
      productName: string;
      color: string;
      size: string;
      price: number;
      quantity: number;
      imageUrl?: string;
    }>;
    customerAddress: string;
    customerPhone: string;
    paymentMethod: string;
  }) => {
    try {
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
      let response;
      try {
        console.log('Trying endpoint /api/orders');
        response = await api.post('/api/orders', orderData);
      } catch (apiError: any) {
        console.log('First endpoint failed, trying alternate endpoint', apiError.response?.data || apiError.message);
        
        console.log('Trying endpoint /orders');
        response = await api.post('/orders', orderData);
      }
      
      console.log('Order created successfully:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Error response data:', error.response?.data);
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async () => {
    try {
      let response;
      try {
        response = await api.get('/api/orders/me');
      } catch (apiError) {
        response = await api.get('/orders/me');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    try {
      let response;
      try {
        response = await api.get(`/api/orders/${id}`);
      } catch (apiError) {
        response = await api.get(`/orders/${id}`);
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      throw error;
    }
  },

  // Get all orders (admin only)
  async getAllOrders() {
    try {
      // Debug the request
      console.log("Sending request to fetch all orders...");
      
      const response = await api.get('/orders');
      console.log("Orders API response:", response);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw handleApiError(error as AxiosError, 'Failed to fetch orders');
    }
  },
  
  async updateOrderStatus(orderId: string, status: string) {
    try {
      console.log(`Updating order ${orderId} status to ${status}`);
      const user = await authService.getCurrentUser();
      
      let endpoint = `/orders/${orderId}/status`;
      if (user && user.role === 'ADMIN') {
        endpoint = `/orders/${orderId}/admin-update`;
      }
      
      console.log(`Using endpoint: ${endpoint}`);
      
      let response;
      try {
        const apiEndpoint = `/api${endpoint}`;
        console.log(`Trying endpoint: ${apiEndpoint}`);
        response = await api.put(apiEndpoint, { status });
      } catch (apiError) {
        console.log('First endpoint failed, trying alternate endpoint', apiError);
        console.log(`Trying endpoint: ${endpoint}`);
        response = await api.put(endpoint, { status });
      }
      
      console.log('Status update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw handleApiError(error as AxiosError, 'Failed to update order status');
    }
  },

  // Get orders assigned to the current rider
  async getAssignedOrders() {
    try {
      console.log("Fetching assigned orders for rider");
      
      // Try different API endpoint variations
      let response;
      try {
        // Try with the /api prefix first
        response = await api.get('/api/orders/assigned');
        console.log('Successfully fetched from /api/orders/assigned');
      } catch (apiError) {
        console.error('First endpoint failed:', apiError);
        
        // If that fails, try without the /api prefix
        try {
          response = await api.get('/orders/assigned');
          console.log('Successfully fetched from /orders/assigned');
        } catch (secondError) {
          console.error('Second endpoint failed:', secondError);
          
          // Last resort: try with direct URL
          response = await api.get(`${API_URL}/api/orders/assigned`);
          console.log('Successfully fetched from absolute URL');
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned orders:', error);
      throw handleApiError(error as AxiosError, 'Failed to fetch assigned orders');
    }
  },

  assignRandomRider: async (orderId: string) => {
    // In production, this will call your backend API
    try {
      const response = await fetch(`/api/orders/${orderId}/assign-rider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign rider');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error assigning rider:', error);
      throw error;
    }
  }
};

// Set authorization header if token exists in localStorage
const token = localStorage.getItem('authToken');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;
