import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.13:5000'; // Android emulator localhost

class ApiService {
  private api: AxiosInstance;

  constructor() {
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
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );
  }

  // Auth endpoints
  async sendCustomerSignupOtp(email: string, phone: string) {
    return this.api.post('/api/auth/customer/signup/send-otp', { email, phone });
  }

  async verifyCustomerSignupOtp(email: string, phone: string, otp: string) {
    return this.api.post('/api/auth/customer/signup/verify-otp', { email, phone, otp });
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
