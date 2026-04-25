import React, { useState, useEffect } from 'react';
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

type OtpVerificationPageProps = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

const OtpVerificationPage: React.FC<OtpVerificationPageProps> = ({
  navigation,
  route,
}) => {
  const { type, email, phone, isSignup, signupData } = route.params as any;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { setToken, setUserType } = useAuth();

  useEffect(() => {
    let interval: number;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateOtp = () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;

    try {
      setLoading(true);

      if (type === 'customer') {
        // Verify OTP first
        const otpResponse = await apiService.verifyCustomerSignupOtp(
          email || '',
          phone,
          otp
        );
        console.log('OTP Verification Response:', otpResponse.data);

        // If this is a signup flow, register the customer
        if (isSignup && signupData) {
          console.log('Registering customer with data:', signupData);
          const registerResponse = await apiService.registerCustomer(signupData);
          console.log('Registration Response:', registerResponse.data);
          
          // Show success alert and navigate to login
          Alert.alert('Success', 'Account created successfully!\n\nPlease log in with your email and password.', [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]);
        } else {
          // This is a login flow (driver only)
          if (otpResponse.data.token) {
            await setToken(otpResponse.data.token);
            await setUserType('customer');
            navigation.replace('CustomerDashboard');
          }
        }
      } else if (type === 'driver') {
        const response = await apiService.verifyDriverLoginOtp(phone, otp);
        
        if (response.data.token) {
          await setToken(response.data.token);
          await setUserType('driver');
          // Navigate to driver dashboard
          navigation.replace('DriverDashboard');
        }
      }
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Invalid OTP';
      Alert.alert('Error', errorMessage);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setResendLoading(true);
      if (type === 'customer') {
        await apiService.sendCustomerSignupOtp(email || '', phone);
      } else if (type === 'driver') {
        await apiService.sendDriverLoginOtp(phone);
      }

      Alert.alert('Success', 'OTP sent successfully!');
      setResendTimer(60);
      setCanResend(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const displayPhone = phone
    ? `${phone.slice(0, 2)}****${phone.slice(-2)}`
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to {displayPhone}
            {email && ` and ${email.split('@')[0]}****`}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="One-Time Password"
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
            For testing, use OTP: <Text style={styles.boldText}>123456</Text>
          </Text>

          <Button
            title="Verify OTP"
            onPress={handleVerifyOtp}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.resendContainer}>
            {!canResend && (
              <>
                <Text style={styles.resendText}>Didn't receive OTP?</Text>
                <Text style={styles.resendTimer}>
                  Resend in {resendTimer}s
                </Text>
              </>
            )}

            {canResend && (
              <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
                <Text style={styles.resendLink}>
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            {type === 'customer'
              ? '✓ OTP sent to your email and phone\n✓ Valid for 10 minutes\n✓ Do not share OTP with anyone'
              : '✓ OTP sent to your registered phone\n✓ Valid for 10 minutes\n✓ Admin must have added you as a driver'}
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
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  resendTimer: {
    color: '#FF6B00',
    fontWeight: '600',
    fontSize: 12,
  },
  resendLink: {
    color: '#FF6B00',
    fontWeight: '600',
    fontSize: 14,
    paddingVertical: 8,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#00A86B',
    padding: 16,
    borderRadius: 8,
    marginTop: 40,
  },
  infoTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default OtpVerificationPage;
