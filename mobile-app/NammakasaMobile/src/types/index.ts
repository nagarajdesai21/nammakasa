export type UserType = 'citizen' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  wardNo?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}