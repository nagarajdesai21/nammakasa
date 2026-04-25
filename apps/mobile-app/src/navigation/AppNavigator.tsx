// src/navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import CitizenDashboard from '../screens/CitizenDashboard';
import DriverDashboard from '../screens/DriverDashboard';

export type RootStackParamList = {
  Login: undefined;
  CitizenDashboard: undefined;
  DriverDashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#10B981',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CitizenDashboard"
          component={CitizenDashboard}
          options={{ title: 'My Dashboard' }}
        />
        <Stack.Screen
          name="DriverDashboard"
          component={DriverDashboard}
          options={{ title: 'Driver Dashboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}