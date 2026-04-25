import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

// Import auth screens
import LoginPage from './src/screens/auth/LoginPage';
import CustomerSignupPage from './src/screens/auth/CustomerSignupPage';
import CustomerLoginPage from './src/screens/auth/CustomerLoginPage';
import DriverLoginPage from './src/screens/auth/DriverLoginPage';
import OtpVerificationPage from './src/screens/auth/OtpVerificationPage';

// Import app screens
import CustomerDashboard from './src/screens/app/customer/CustomerDashboard';
import DriverDashboard from './src/screens/app/driver/DriverDashboard';

// Import stores
import { AuthProvider, useAuth } from './src/stores/AuthContext';

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  CustomerSignup: undefined;
  CustomerLogin: { phone?: string };
  DriverLogin: undefined;
  OtpVerification: {
    type: 'customer' | 'driver';
    email?: string;
    phone: string;
    isSignup?: boolean;
    signupData?: {
      name: string;
      email: string;
      phone: string;
      password: string;
    };
  };
  // App screens
  CustomerDashboard: undefined;
  DriverDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation component that handles conditional routing
function RootNavigator() {
  const { token, userType, isLoading } = useAuth();
  const navigationRef = React.useRef<any>(null);
  const isReadyRef = React.useRef<boolean>(false);

  // Update navigation when auth state changes
  useEffect(() => {
    console.log('[Navigation] Auth state changed - token:', !!token, 'userType:', userType);

    if (!isReadyRef.current) {
      console.log('[Navigation] ❌ Navigator not ready yet, waiting...');
      return;
    }

    if (!navigationRef.current) {
      console.log('[Navigation] ❌ Navigation ref is null');
      return;
    }

    console.log('[Navigation] ✅ Navigator IS ready, performing navigation NOW');

    // Add a small delay to ensure the navigator state is fully settled
    const navigationTimeout = setTimeout(() => {
      if (!token) {
        console.log('[Navigation] ❌ No token detected - navigate to Login');
        navigationRef.current?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      } else if (token && userType === 'customer') {
        console.log('[Navigation] ✅✅✅ TOKEN + CUSTOMER - NAVIGATING TO CUSTOMERDASHBOARD NOW');
        navigationRef.current?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'CustomerDashboard' }],
          })
        );
      } else if (token && userType === 'driver') {
        console.log('[Navigation] ✅✅✅ TOKEN + DRIVER - NAVIGATING TO DRIVERDASHBOARD NOW');
        navigationRef.current?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'DriverDashboard' }],
          })
        );
      } else {
        console.log('[Navigation] ⚠️ Token exists but no userType:', { token: !!token, userType });
      }
    }, 100); // Small delay to let navigator settle

    return () => clearTimeout(navigationTimeout);
  }, [token, userType]);

  if (isLoading) {
    console.log('[Navigation] Still loading...');
    return null; // Loading state - you can show a splash screen here
  }

  // ALWAYS start with Login on initial render
  // Navigation will handle switching to dashboard based on auth state
  const initialRoute: 'Login' | 'CustomerDashboard' | 'DriverDashboard' = 'Login';
  console.log('[Navigation] Initial render - ALWAYS showing Login screen');

  return (
    <Stack.Navigator
      ref={navigationRef}
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
      onReady={() => {
        isReadyRef.current = true;
        console.log('[Navigation] 🎉 Navigator READY! onReady callback fired');
        console.log('[Navigation] Current auth state - token:', !!token, 'userType:', userType);
        // Note: useEffect will handle navigation changes from here on
      }}
    >
      {/* Auth Screens */}
      <Stack.Screen
        name="Login"
        component={LoginPage}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="CustomerSignup"
        component={CustomerSignupPage}
      />
      <Stack.Screen
        name="CustomerLogin"
        component={CustomerLoginPage}
      />
      <Stack.Screen
        name="DriverLogin"
        component={DriverLoginPage}
      />
      <Stack.Screen
        name="OtpVerification"
        component={OtpVerificationPage}
        options={{
          gestureEnabled: false,
        }}
      />

      {/* App Screens */}
      <Stack.Screen
        name="CustomerDashboard"
        component={CustomerDashboard}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="DriverDashboard"
        component={DriverDashboard}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
