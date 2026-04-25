import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import apiService from '../../services/apiService';
import type { RootStackParamList } from '../../../App';

type LoginPageProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginPage: React.FC<LoginPageProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'driver'>('customer');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validatePhone = () => {
    if (!phone || phone.length !== 10) {
      setErrors({ phone: 'Phone number must be 10 digits' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleCustomerLogin = () => {
    // Navigate to customer login page (email + password)
    navigation.navigate('CustomerLogin');
  };

  const handleDriverLogin = async () => {
    if (!validatePhone()) return;

    try {
      setLoading(true);
      const response = await apiService.sendDriverLoginOtp(phone);

      if (response.data.driverExists) {
        navigation.navigate('OtpVerification', {
          type: 'driver',
          phone,
        });
      } else {
        Alert.alert(
          'Driver Not Found',
          'Please contact your administrator to be registered as a driver.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    if (activeTab === 'customer') {
      navigation.navigate('CustomerSignup');
    } else {
      Alert.alert(
        'Driver Registration',
        'Drivers must be registered by administrators. Please contact support.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Nammakasa</Text>
          <Text style={styles.subtitle}>Smart Waste Collection</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'customer' && styles.activeTab]}
            onPress={() => setActiveTab('customer')}
          >
            <Text style={[styles.tabText, activeTab === 'customer' && styles.activeTabText]}>
              Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'driver' && styles.activeTab]}
            onPress={() => setActiveTab('driver')}
          >
            <Text style={[styles.tabText, activeTab === 'driver' && styles.activeTabText]}>
              Driver
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'customer' ? 'Customer Login' : 'Driver Login'}
          </Text>

          {activeTab === 'driver' ? (
            <>
              <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, ''));
                  setErrors({});
                }}
                placeholder="Enter 10-digit phone number"
                keyboardType="phone-pad"
                maxLength={10}
                error={errors.phone}
              />

              <Button
                title={loading ? 'Sending OTP...' : 'Send OTP'}
                onPress={handleDriverLogin}
                loading={loading}
                style={styles.continueButton}
              />
            </>
          ) : (
            <>
              <Text style={styles.infoText}>
                👤 Login using your email and password
              </Text>
              
              <Button
                title="Continue to Login"
                onPress={handleCustomerLogin}
                style={styles.continueButton}
              />
            </>
          )}

          {activeTab === 'customer' && (
            <TouchableOpacity style={styles.signupLink} onPress={handleSignup}>
              <Text style={styles.signupText}>New user? Sign up here</Text>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
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
  activeTab: {
    backgroundColor: '#FF6B00',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  form: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  continueButton: {
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
});

export default LoginPage;