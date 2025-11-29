import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `http://localhost:5001`;

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor() {
    // Load tokens from localStorage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      this.tokenExpiresAt = expiresAt ? parseInt(expiresAt) : null;
    }
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number = 3600) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    // Set expiration time (current time + expiresIn seconds, minus 5 minutes buffer)
    this.tokenExpiresAt = Date.now() + (expiresIn - 300) * 1000;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiresAt', this.tokenExpiresAt.toString());
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  isTokenExpiringSoon(): boolean {
    if (!this.tokenExpiresAt) return false;
    // Check if token expires in less than 5 minutes
    return Date.now() >= this.tokenExpiresAt;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.accessToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else if (!endpoint.includes('/auth/')) {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    try {
      console.log("FETCH:", url, options, headers);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // If unauthorized and we have a refresh token, try to refresh
        if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/refresh')) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request
            return this.request(endpoint, options);
          }
        }

        console.error(`API Error (${endpoint}):`, data.error || 'Unknown error');
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      console.error(`Network Error (${endpoint}):`, error);
      return { error: 'Network error. Please check your connection.' };
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update access token and expiration
        const expiresIn = data.expiresIn || 3600;
        this.setTokens(data.accessToken, this.refreshToken!, expiresIn);
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Auth methods
  async register(userData: {
    FirstName: string;
    LastName: string;
    Username: string;
    Password: string;
    Email: string;
    Phone: string;
    Birthday: string;
    passkey?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(Username: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ Username, password }),
    });

    if (response.data) {
      const expiresIn = response.data.expiresIn || 3600;
      this.setTokens(response.data.accessToken, response.data.refreshToken, expiresIn);
    }

    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearTokens();
  }

  // User methods
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(data: { username?: string; avatar?: string }) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getBalance() {
    return this.request('/user/balance');
  }

  async resetBalance() {
    return this.request('/user/balance/reset', { method: 'POST' });
  }

  async getLoginActivity() {
    return this.request('/user/login-activity');
  }

  async updateSettings(data: { timezone?: string; currency?: string; theme?: string }) {
    return this.request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPortfolio() {
    return this.request('/user/portfolio');
  }

  async getTradeHistory() {
    return this.request('/user/trades');
  }

  // Market methods
  async getMarketPrices() {
    return this.request('/market/prices');
  }

  async getCandles(symbol: string, timeframe: string, limit = 100) {
    return this.request(`/market/candles/${symbol}/${timeframe}?limit=${limit}`);
  }

  async getOrderBook(symbol: string) {
    return this.request(`/market/orderbook/${symbol}`);
  }

  async getRecentTrades(symbol: string) {
    return this.request(`/market/trades/${symbol}`);
  }

  async getMarkets() {
    return this.request('/market/list');
  }

  // Trading methods
  async placeOrder(orderData: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    price?: number;
    amount: number;
  }) {
    return this.request('/trading/order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/trading/orders${query}`);
  }

  async cancelOrder(orderId: string) {
    return this.request(`/trading/order/${orderId}`, { method: 'DELETE' });
  }

  // Watchlist methods
  async getWatchlist() {
    return this.request('/user/watchlist');
  }

  async addToWatchlist(symbol: string) {
    return this.request('/user/watchlist', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    });
  }

  async removeFromWatchlist(symbol: string) {
    return this.request(`/user/watchlist/${symbol}`, { method: 'DELETE' });
  }

  // Admin methods
  async getUsers() {
    return this.request('/admin/users');
  }
}

export const api = new ApiClient();
