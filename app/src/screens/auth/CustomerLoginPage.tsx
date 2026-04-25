import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import apiService from '../../services/apiService';
import { useAuth } from '../../stores/AuthContext';
import type { RootStackParamList } from '../../../App';

type CustomerLoginPageProps = NativeStackScreenProps<RootStackParamList, 'CustomerLogin'>;

const CustomerLoginPage: React.FC<CustomerLoginPageProps> = ({ navigation }) => {
  const { setToken, setUserType } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      console.log('🔐 Attempting login with email:', email);
      
      const response = await apiService.loginCustomer(email, password);
      console.log('✅ Login response received:', response.data);
      
      if (response.data.token) {
        console.log('📝 Storing token...');
        await setToken(response.data.token);
        console.log('✅ Token stored');
        
        console.log('📝 Setting user type to customer...');
        await setUserType('customer');
        console.log('✅ User type stored');
        
        console.log('🚀 NAVIGATE NOW using navigation.replace()');
        // Navigate directly without waiting for useEffect
        navigation.replace('CustomerDashboard' as any);
      } else {
        Alert.alert('Error', 'No token received from server');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Login failed';
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Customer Login</Text>
            <Text style={styles.subtitle}>Enter your email and password</Text>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrors({});
            }}
            placeholder="Enter your registered email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrors({});
            }}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
          />

          <Button
            title={loading ? 'Logging in...' : 'Login'}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate('CustomerSignup')}
          >
            <Text style={styles.signupText}>New customer? Sign up here</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            🔐 Use email and password for quick login
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#FF6B00',
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  loginButton: {
    marginTop: 20,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default CustomerLoginPage;