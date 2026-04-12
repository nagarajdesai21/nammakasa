import axios from 'axios';
import { WasteAuto, Driver, Route, RouteAssignment, DashboardStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ Authentication APIs ============
export const authAPI = {
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    wardNo: number;
  }) => api.post('/auth/signup', data),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }),
  
  requestApproval: (adminId: string) =>
    api.post('/auth/request-approval', { adminId }),
  
  getApprovalStatus: () => api.get('/auth/approval-status'),
};

// ============ Waste Auto APIs ============
export const autoAPI = {
  getAll: (wardNo?: number) =>
    api.get<{ data: WasteAuto[] }>('/autos', { params: { wardNo } }),
  
  getById: (id: string) =>
    api.get<{ data: WasteAuto }>(`/autos/${id}`),
  
  create: (data: Omit<WasteAuto, 'id' | 'createdAt'>) =>
    api.post<{ data: WasteAuto }>('/autos', data),
  
  update: (id: string, data: Partial<WasteAuto>) =>
    api.put<{ data: WasteAuto }>(`/autos/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/autos/${id}`),
  
  search: (autoNumber: string) =>
    api.get<{ data: WasteAuto[] }>('/autos/search', { params: { autoNumber } }),
};

// ============ Driver APIs ============
export const driverAPI = {
  getAll: (wardNo?: number) =>
    api.get<{ data: Driver[] }>('/drivers', { params: { wardNo } }),
  
  getById: (id: string) =>
    api.get<{ data: Driver }>(`/drivers/${id}`),
  
  create: (data: Omit<Driver, 'id' | 'createdAt'>) =>
    api.post<{ data: Driver }>('/drivers', data),
  
  update: (id: string, data: Partial<Driver>) =>
    api.put<{ data: Driver }>(`/drivers/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/drivers/${id}`),
};

// ============ Route APIs ============
export const routeAPI = {
  getAll: (wardNo?: number) =>
    api.get<{ data: Route[] }>('/routes', { params: { wardNo } }),
  
  getById: (id: string) =>
    api.get<{ data: Route }>(`/routes/${id}`),
  
  create: (data: Omit<Route, 'id' | 'createdAt'>) =>
    api.post<{ data: Route }>('/routes', data),
  
  update: (id: string, data: Partial<Route>) =>
    api.put<{ data: Route }>(`/routes/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/routes/${id}`),
  
  searchByPincode: (pinCode: string) =>
    api.get<{ data: Route[] }>('/routes/search', { params: { pinCode } }),
};

// ============ Route Assignment APIs ============
export const assignmentAPI = {
  getAll: (wardNo?: number, status?: string) =>
    api.get<{ data: RouteAssignment[] }>('/assignments', {
      params: { wardNo, status },
    }),
  
  getById: (id: string) =>
    api.get<{ data: RouteAssignment }>(`/assignments/${id}`),
  
  create: (data: Omit<RouteAssignment, 'id' | 'createdAt'>) =>
    api.post<{ data: RouteAssignment }>('/assignments', data),
  
  update: (id: string, data: Partial<RouteAssignment>) =>
    api.put<{ data: RouteAssignment }>(`/assignments/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/assignments/${id}`),
  
  getMapping: (wardNo?: number) =>
    api.get('/assignments/mapping', { params: { wardNo } }),
};

// ============ Dashboard APIs ============
export const dashboardAPI = {
  getStats: (wardNo?: number) =>
    api.get<{ data: DashboardStats }>('/dashboard/stats', { params: { wardNo } }),
  
  getCollectionTrends: (wardNo?: number, days = 30) =>
    api.get('/dashboard/trends', { params: { wardNo, days } }),
  
  getWardOverview: () =>
    api.get('/dashboard/ward-overview'),
};

// ============ Map Services ============
export const mapAPI = {
  getLocationByPincode: (pinCode: string) =>
    api.get('/map/location', { params: { pinCode } }),
  
  getRouteCoordinates: (routeId: string) =>
    api.get(`/map/route/${routeId}`),
  
  searchLocations: (query: string) =>
    api.get('/map/search', { params: { q: query } }),
};

export default api;
