import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import UserTypeSelectionScreen from '../screens/UserTypeSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import SignupScreen from '../screens/SignupScreen';
import CitizenHomeScreen from '../screens/CitizenHomeScreen';
import DriverHomeScreen from '../screens/DriverHomeScreen';

export type RootStackParamList = {
  UserTypeSelection: undefined;
  Login: { userType: 'citizen' | 'driver' };
  OTP: { email: string; userType: 'citizen' | 'driver' };
  Signup: { userType: 'citizen' | 'driver' };
  CitizenHome: undefined;
  DriverHome: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { state } = useAuth();

  if (state.isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {state.user ? (
          // Authenticated screens
          state.user.userType === 'citizen' ? (
            <Stack.Screen
              name="CitizenHome"
              component={CitizenHomeScreen}
              options={{ title: 'Nammakasa - Citizen' }}
            />
          ) : (
            <Stack.Screen
              name="DriverHome"
              component={DriverHomeScreen}
              options={{ title: 'Nammakasa - Driver' }}
            />
          )
        ) : (
          // Authentication flow
          <>
            <Stack.Screen
              name="UserTypeSelection"
              component={UserTypeSelectionScreen}
              options={{ title: 'Welcome to Nammakasa' }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
            <Stack.Screen
              name="OTP"
              component={OTPScreen}
              options={{ title: 'Verify OTP' }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}