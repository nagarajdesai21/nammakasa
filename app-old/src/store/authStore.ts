import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStoreState {
  // Auth state
  token: string | null;
  userType: 'customer' | 'driver' | null;
  user: any;
  
  // Actions
  setToken: (token: string) => void;
  setUserType: (type: 'customer' | 'driver') => void;
  setUser: (user: any) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStoreState>((set) => ({
  token: null,
  userType: null,
  user: null,

  setToken: async (token: string) => {
    await AsyncStorage.setItem('jwt_token', token);
    set({ token });
  },

  setUserType: async (type: 'customer' | 'driver') => {
    await AsyncStorage.setItem('user_type', type);
    set({ userType: type });
  },

  setUser: (user: any) => {
    set({ user });
  },

  logout: async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('user_type');
    set({ token: null, userType: null, user: null });
  },
}));

export default useAuthStore;
