import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'customer' | 'driver';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userType: 'customer' | 'driver' | null;
  isLoading: boolean;
  setToken: (token: string) => Promise<void>;
  setUserType: (type: 'customer' | 'driver') => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [userType, setUserTypeState] = useState<'customer' | 'driver' | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Changed from true to false - don't auto-load

  useEffect(() => {
    // Note: If you want "Remember Me" functionality (auto-login on app restart),
    // uncomment the loadStoredAuth() call below.
    // For now, user must login each time the app starts.
    
    // loadStoredAuth();
    
    // Instead, just mark as done loading
    setIsLoading(false);
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('jwt_token');
      const storedUserType = await AsyncStorage.getItem('user_type');

      if (storedToken) {
        setTokenState(storedToken);
      }

      if (storedUserType) {
        setUserTypeState(storedUserType as 'customer' | 'driver');
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setToken = async (newToken: string) => {
    await AsyncStorage.setItem('jwt_token', newToken);
    setTokenState(newToken);
  };

  const setUserType = async (type: 'customer' | 'driver') => {
    await AsyncStorage.setItem('user_type', type);
    setUserTypeState(type);
  };

  const logout = async () => {
    console.log('🚪 Logout called - clearing auth state');
    await AsyncStorage.removeItem('jwt_token');
    console.log('✅ Removed jwt_token from AsyncStorage');
    await AsyncStorage.removeItem('user_type');
    console.log('✅ Removed user_type from AsyncStorage');
    setTokenState(null);
    console.log('✅ Set token to null');
    setUserTypeState(null);
    console.log('✅ Set userType to null');
    setUser(null);
    console.log('✅ Cleared user - Navigation should now trigger to Login...');
  };

  const value: AuthContextType = {
    user,
    token,
    userType,
    isLoading,
    setToken,
    setUserType,
    setUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}