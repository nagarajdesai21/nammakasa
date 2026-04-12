import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from './src/store/authStore';

// Auth Screens
import LoginPage from './src/screens/auth/LoginPage';
import CustomerSignupPage from './src/screens/auth/CustomerSignupPage';
import DriverLoginPage from './src/screens/auth/DriverLoginPage';
import OtpVerificationPage from './src/screens/auth/OtpVerificationPage';

// App Screens
import CustomerDashboard from './src/screens/app/customer/CustomerDashboard';
import DriverDashboard from './src/screens/app/driver/DriverDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  const { token, setToken, userType, setUserType } = useAuthStore();

  // Check for existing token on app start
  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('jwt_token');
        const savedUserType = await AsyncStorage.getItem('user_type');
        
        if (savedToken) {
          setToken(savedToken);
          setUserType(savedUserType || 'customer');
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };

    checkToken();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
          }}
        >
          {!token ? (
            // Auth Stack
            <>
              <Stack.Screen
                name="Login"
                component={LoginPage}
                options={{ animationEnabled: false }}
              />
              <Stack.Screen
                name="CustomerSignup"
                component={CustomerSignupPage}
              />
              <Stack.Screen
                name="DriverLogin"
                component={DriverLoginPage}
              />
              <Stack.Screen
                name="OtpVerification"
                component={OtpVerificationPage}
              />
            </>
          ) : (
            // App Stack
            <>
              {userType === 'customer' ? (
                <Stack.Screen
                  name="CustomerDashboard"
                  component={CustomerDashboard}
                  options={{ animationEnabled: false }}
                />
              ) : (
                <Stack.Screen
                  name="DriverDashboard"
                  component={DriverDashboard}
                  options={{ animationEnabled: false }}
                />
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
