// src/services/api.ts

const API_BASE_URL = 'http://localhost:5001'; // For development. In production, use your server URL

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async sendOTP(phone: string) {
    return this.request('/api/auth/send-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOTP(phone: string, otp: string) {
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }

  async login(phone: string, otp: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }

  // User endpoints
  async getUserProfile(token: string) {
    return this.request('/api/auth/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Driver endpoints
  async getTodayAssignment(token: string) {
    return this.request('/api/driver/today-assignment', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateGPS(token: string, latitude: number, longitude: number, accuracy: number) {
    return this.request('/api/driver/gps-update', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ latitude, longitude, accuracy }),
    });
  }
}

export const apiService = new ApiService();