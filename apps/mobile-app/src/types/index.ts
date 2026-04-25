// src/types/index.ts

export type UserType = 'CITIZEN' | 'DRIVER';

export interface User {
  id: string;
  phone: string;
  userType: UserType;
  name?: string;
  email?: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface Route {
  id: string;
  name: string;
  wardName: string;
  estimatedDuration: number;
}

export interface RouteAssignment {
  id: string;
  routeId: string;
  driverId: string;
  assignedDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}