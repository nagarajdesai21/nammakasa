import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import apiService from '../../services/apiService';
import useAuthStore from '../../store/authStore';

type LoginPageProps = NativeStackScreenProps<any, 'Login'>;

const LoginPage: React.FC<LoginPageProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'driver'>('customer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { setToken, setUserType } = useAuthStore();

  const validateCustomerLogin = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDriverLogin = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerLogin = async () => {
    if (!validateCustomerLogin()) return;

    try {
      setLoading(true);
      await apiService.sendCustomerSignupOtp(email, phone);
      
      // Navigate to OTP verification
      navigation.navigate('OtpVerification', {
        type: 'customer_login',
        email,
        phone,
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverLogin = async () => {
    if (!validateDriverLogin()) return;

    try {
      setLoading(true);
      const response = await apiService.sendDriverLoginOtp(phone);
      
      if (response.data.driverExists === false) {
        Alert.alert(
          'Driver Not Found',
          'This phone number is not registered as a driver. Please contact admin to get registered.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Navigate to OTP verification
      navigation.navigate('OtpVerification', {
        type: 'driver_login',
        phone,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send OTP';
      if (message.includes('not found') || message.includes('not registered')) {
        Alert.alert(
          'Driver Not Found',
          'This phone number is not registered as a driver. Please contact admin to get registered.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>NammaKasa</Text>
          <Text style={styles.subtitle}>Waste Management System</Text>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'customer' && styles.tabActive]}
            onPress={() => {
              setActiveTab('customer');
              setErrors({});
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'customer' && styles.tabTextActive,
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'driver' && styles.tabActive]}
            onPress={() => {
              setActiveTab('driver');
              setErrors({});
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'driver' && styles.tabTextActive,
              ]}
            >
              Driver
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'customer' ? (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Customer Login</Text>
            
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              error={errors.email}
            />

            <TextInput
              label="Phone Number"
              placeholder="10-digit phone number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setErrors({ ...errors, phone: '' });
              }}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
            />

            <Button
              title="Continue"
              onPress={handleCustomerLogin}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('CustomerSignup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Driver Login</Text>
            
            <TextInput
              label="Phone Number"
              placeholder="10-digit phone number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setErrors({ ...errors, phone: '' });
              }}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
            />

            <Text style={styles.driverNote}>
              We'll send an OTP to verify your phone number. Admin must have registered you as a driver.
            </Text>

            <Button
              title="Send OTP"
              onPress={handleDriverLogin}
              loading={loading}
              style={styles.button}
              variant="secondary"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#FF6B00',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  formContainer: {
    marginTop: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#FF6B00',
    fontWeight: '600',
    fontSize: 14,
  },
  driverNote: {
    backgroundColor: '#f5f5f5',
    color: '#666',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 12,
  },
});

export default LoginPage;
