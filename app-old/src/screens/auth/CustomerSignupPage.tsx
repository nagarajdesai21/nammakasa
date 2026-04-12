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

type CustomerSignupPageProps = NativeStackScreenProps<any, 'CustomerSignup'>;

const CustomerSignupPage: React.FC<CustomerSignupPageProps> = ({ navigation }) => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateDetails = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateDetails()) return;

    try {
      setLoading(true);
      await apiService.sendCustomerSignupOtp(formData.email, formData.phone);
      setStep('otp');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const validateOtp = () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return false;
    }
    return true;
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;

    try {
      setLoading(true);
      await apiService.verifyCustomerSignupOtp(
        formData.email,
        formData.phone,
        otp
      );

      // OTP verified, now register
      await handleRegister();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await apiService.registerCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      Alert.alert('Success', 'Account created! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => setStep('details')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit OTP sent to {formData.email} and {formData.phone}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="OTP"
              placeholder="000000"
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/\D/g, '').slice(0, 6));
                setErrors({ ...errors, otp: '' });
              }}
              keyboardType="numeric"
              maxLength={6}
              error={errors.otp}
            />

            <Text style={styles.note}>
              For testing: Use OTP = <Text style={styles.boldText}>123456</Text>
            </Text>

            <Button
              title="Verify & Create Account"
              onPress={handleVerifyOtp}
              loading={loading}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up as a customer</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
          />

          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              setErrors({ ...errors, email: '' });
            }}
            keyboardType="email-address"
            error={errors.email}
          />

          <TextInput
            label="Phone Number"
            placeholder="10-digit phone number"
            value={formData.phone}
            onChangeText={(text) => {
              setFormData({ ...formData, phone: text });
              setErrors({ ...errors, phone: '' });
            }}
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.phone}
          />

          <TextInput
            label="Password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChangeText={(text) => {
              setFormData({ ...formData, password: text });
              setErrors({ ...errors, password: '' });
            }}
            secureTextEntry
            error={errors.password}
          />

          <TextInput
            label="Confirm Password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData({ ...formData, confirmPassword: text });
              setErrors({ ...errors, confirmPassword: '' });
            }}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Continue (Send OTP)"
            onPress={handleSendOtp}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#FF6B00',
    fontWeight: '600',
    marginBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  formContainer: {
    marginTop: 20,
  },
  button: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF6B00',
    fontWeight: '600',
    fontSize: 14,
  },
  note: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 12,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CustomerSignupPage;
