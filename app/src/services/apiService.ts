import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For iOS Simulator: use 127.0.0.1
// For Android Emulator: use your machine's IP address (192.168.1.179)
// For Physical Device: use your machine's IP (192.168.1.179)
const API_BASE_URL = Platform.OS === 'ios' 
  ? 'http://127.0.0.1:5001'
  : 'http://192.168.1.179:5001'; // Use actual IP for Android & physical devices

class ApiService {
  private api: AxiosInstance;

  constructor() {
    console.log('[API Service] Initializing with URL:', API_BASE_URL);
    console.log('[API Service] Platform:', Platform.OS);
    
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('jwt_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('[API Service] Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Add response interceptor for error logging
    this.api.interceptors.response.use(
      (response) => {
        console.log('[API Service] Response:', response.status, response.config.url);
        return response;
      },
      (error: any) => {
        console.error('[API Service] Error:', error.message, 'URL:', error.config?.url);
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async sendCustomerSignupOtp(email: string, phone: string) {
    return this.api.post('/api/auth/customer/signup/send-otp', { email, phone });
  }

  async verifyCustomerSignupOtp(email: string, phone: string, otp: string) {
    return this.api.post('/api/auth/customer/signup/verify-otp', { email, phone, otp });
  }

  async loginCustomer(email: string, password: string) {
    return this.api.post('/api/auth/customer/login', { email, password });
  }

  async registerCustomer(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    return this.api.post('/api/auth/customer/signup', data);
  }

  async sendDriverLoginOtp(phone: string) {
    return this.api.post('/api/auth/driver/login/send-otp', { phone });
  }

  async verifyDriverLoginOtp(phone: string, otp: string) {
    return this.api.post('/api/auth/driver/login/verify-otp', { phone, otp });
  }

  async logout() {
    return this.api.post('/api/auth/logout');
  }
}

export default new ApiService();
