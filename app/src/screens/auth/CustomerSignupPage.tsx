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
import type { RootStackParamList } from '../../../App';

type CustomerSignupPageProps = NativeStackScreenProps<RootStackParamList, 'CustomerSignup'>;

const CustomerSignupPage: React.FC<CustomerSignupPageProps> = ({ navigation }) => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors({});
  };

  const validateDetails = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
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
      // Navigate to OTP verification screen with signup data
      navigation.navigate('OtpVerification', {
        type: 'customer',
        email: formData.email,
        phone: formData.phone,
        isSignup: true,
        signupData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderDetailsStep = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Create Your Account</Text>

      <TextInput
        label="Full Name"
        value={formData.name}
        onChangeText={(value) => updateFormData('name', value)}
        placeholder="Enter your full name"
        error={errors.name}
      />

      <TextInput
        label="Email Address"
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <TextInput
        label="Phone Number"
        value={formData.phone}
        onChangeText={(value) => updateFormData('phone', value.replace(/[^0-9]/g, ''))}
        placeholder="Enter 10-digit phone number"
        keyboardType="phone-pad"
        maxLength={10}
        error={errors.phone}
      />

      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={(value) => updateFormData('password', value)}
        placeholder="Create a password"
        secureTextEntry
        error={errors.password}
      />

      <TextInput
        label="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(value) => updateFormData('confirmPassword', value)}
        placeholder="Confirm your password"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <Button
        title={loading ? 'Sending OTP...' : 'Continue'}
        onPress={handleSendMobileOtp}
        loading={loading}
        style={styles.continueButton}
      />
    </View>
  );

  const renderMobileOtpStep = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Verify Mobile Number</Text>
      <Text style={styles.stepDescription}>
        We've sent a 6-digit OTP to {formData.phone}
      </Text>

      <TextInput
        label="Mobile OTP"
        value={mobileOtp}
        onChangeText={(value) => {
          setMobileOtp(value.replace(/[^0-9]/g, ''));
          setErrors({});
        }}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        error={errors.mobileOtp}
      />

      <Button
        title={loading ? 'Verifying...' : 'Verify Mobile OTP'}
        onPress={handleVerifyMobileOtp}
        loading={loading}
        style={styles.continueButton}
      />

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleSendMobileOtp}
        disabled={loading}
      >
        <Text style={styles.resendText}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmailOtpStep = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Verify Email Address</Text>
      <Text style={styles.stepDescription}>
        We've sent a 6-digit OTP to {formData.email}
      </Text>

      <TextInput
        label="Email OTP"
        value={emailOtp}
        onChangeText={(value) => {
          setEmailOtp(value.replace(/[^0-9]/g, ''));
          setErrors({});
        }}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        error={errors.emailOtp}
      />

      <Button
        title={loading ? 'Creating Account...' : 'Complete Registration'}
        onPress={handleVerifyEmailOtp}
        loading={loading}
        style={styles.continueButton}
      />

      <TouchableOpacity
        style={styles.resendButton}
        onPress={async () => {
          try {
            setLoading(true);
            await apiService.sendCustomerSignupOtp(formData.email, formData.phone);
            Alert.alert('Success', 'OTP sent to your email');
          } catch (error) {
            Alert.alert('Error', 'Failed to resend OTP');
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
      >
        <Text style={styles.resendText}>Resend Email OTP</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === 'details') {
                navigation.goBack();
              } else if (step === 'mobileOtp') {
                setStep('details');
              } else {
                setStep('mobileOtp');
              }
            }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {step === 'otp' && (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Verify OTP</Text>
            <Text style={styles.stepDescription}>
              We've sent a 6-digit OTP to {formData.email} and {formData.phone}
            </Text>
            <Text style={styles.stepDescription}>
              (For testing, use OTP: 123456)
            </Text>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
  },
  backText: {
    fontSize: 16,
    color: '#FF6B00',
    fontWeight: '600',
  },
  step: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  continueButton: {
    marginTop: 20,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  resendText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomerSignupPage;