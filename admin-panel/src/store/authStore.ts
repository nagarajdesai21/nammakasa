import { create } from 'zustand';
import { Admin, AuthContext } from '../types';

interface AuthStore extends AuthContext {
  setAdmin: (admin: Admin | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  admin: localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')!) : null,
  isAuthenticated: !!localStorage.getItem('authToken'),
  
  login: async (email: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      
      set({
        admin: data.admin,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('admin');
    set({
      admin: null,
      isAuthenticated: false,
    });
  },
  
  setAdmin: (admin) => set({ admin }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));

export default useAuthStore;
