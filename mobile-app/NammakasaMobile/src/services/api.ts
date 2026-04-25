import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5001/api';

// Mock data for testing when backend is not available
const MOCK_USERS = [
  { id: '1', name: 'John Citizen', email: 'citizen@test.com', userType: 'citizen', wardNo: 1 },
  { id: '2', name: 'Jane Driver', email: 'driver@test.com', userType: 'driver' }
];

class ApiService {
  private isOfflineMode = true; // Set to true for testing without backend

  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async sendOTP(email: string) {
    if (this.isOfflineMode) {
      // Mock OTP sending
      console.log(`Mock: Sending OTP to ${email}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      return { success: true, message: 'OTP sent successfully (mock)' };
    }

    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    return data;
  }

  async verifyOTP(email: string, otp: string) {
    if (this.isOfflineMode) {
      // Mock OTP verification - accept any 6-digit OTP
      console.log(`Mock: Verifying OTP ${otp} for ${email}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        return { valid: true, message: 'OTP verified successfully (mock)' };
      } else {
        return { valid: false, message: 'Invalid OTP (mock)' };
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid OTP');
    }

    return data;
  }

  async login(email: string, password: string) {
    if (this.isOfflineMode) {
      // Mock login
      console.log(`Mock: Logging in ${email}`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = MOCK_USERS.find(u => u.email === email);
      if (user && password === 'password') {
        const mockToken = 'mock-jwt-token-' + user.id;
        await AsyncStorage.setItem('authToken', mockToken);
        return { user, token: mockToken };
      } else {
        throw new Error('Invalid credentials (mock)');
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token
    if (data.token) {
      await AsyncStorage.setItem('authToken', data.token);
    }

    return data;
  }

  async signup(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    userType: 'citizen' | 'driver';
    wardNo?: number;
  }) {
    if (this.isOfflineMode) {
      // Mock signup
      console.log(`Mock: Signing up ${userData.email}`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newUser = {
        id: Date.now().toString(),
        ...userData
      };

      const mockToken = 'mock-jwt-token-' + newUser.id;
      await AsyncStorage.setItem('authToken', mockToken);

      return { user: newUser, token: mockToken };
    }

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    return data;
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
  }

  async getCurrentUser() {
    if (this.isOfflineMode) {
      // Mock get current user
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const userId = token.split('-').pop();
        const user = MOCK_USERS.find(u => u.id === userId);
        return user || MOCK_USERS[0];
      }
      throw new Error('No user found (mock)');
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user');
    }

    return data;
  }
}

export const apiService = new ApiService();