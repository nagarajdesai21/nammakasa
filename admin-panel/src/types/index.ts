// User and Authentication Types
export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  wardNo: number;
  role: 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'pending_approval';
  createdAt: string;
  approvedBy?: string;
}

export interface AuthContext {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Waste Management Types
export interface WasteAuto {
  id: string;
  autoNumber: string;
  registrationNumber: string;
  capacity: number; // in tons
  type: 'compactor' | 'tipper' | 'tractor';
  purchaseDate: string;
  condition: 'good' | 'fair' | 'poor';
  wardNo: number;
  lastMaintenanceDate: string;
  fuelType: 'petrol' |'diesel' | 'cng' | 'electric';
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  age: number;
  phone: string;
  yearsOfService?: number;
  salary?: number;
  licenseNumber?: string;
  licenseExpiry?: string;
  wardNo: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Route {
  id: string;
  routeName: string;
  routeCode: string;
  wardNo: number;
  description: string;
  pinCodes: string[];
  estimatedDuration: number; // in minutes
  frequency: 'daily' | 'alternate' | 'weekly';
  area: string;
  coordinates: { lat: number; lng: number }[];
  createdAt: string;
}

export interface RouteAssignment {
  id: string;
  routeId: string;
  autoId: string;
  driverId: string;
  assignmentDate: string;
  estimatedCompletionTime: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  wardNo: number;
  notes?: string;
  petrolDetails?: {
    litres: number;
    cost: number;
    date: string;
  }[];
  serviceCharges?: {
    description: string;
    cost: number;
    date: string;
  }[];
  createdAt: string;
}

export interface MapLocation {
  lat: number;
  lng: number;
  address: string;
  pinCode: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalAutos: number;
  activeAutos: number;
  totalDrivers: number;
  totalRoutes: number;
  completedCollections: number;
  pendingCollections: number;
  wardStats: WardStat[];
}

export interface WardStat {
  wardNo: number;
  autoCount: number;
  driverCount: number;
  routeCount: number;
  completionRate: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
