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

type DriverLoginPageProps = NativeStackScreenProps<RootStackParamList, 'DriverLogin'>;

const DriverLoginPage: React.FC<DriverLoginPageProps> = ({ navigation }) => {
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

  const handleSendOtp = async () => {
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
          'Your phone number is not registered as a driver. Please contact your administrator to be added to the system.',
          [
            { text: 'Try Again', style: 'default' },
            {
              text: 'Contact Support',
              style: 'default',
              onPress: () => {
                // Could open email or phone dialer here
                Alert.alert('Support', 'Please call: +91-XXXXXXXXXX');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
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
            <Text style={styles.title}>Driver Login</Text>
            <Text style={styles.subtitle}>Enter your registered phone number</Text>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={(value) => {
              setPhone(value.replace(/[^0-9]/g, ''));
              setErrors({});
            }}
            placeholder="Enter your registered phone"
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.phone}
          />

          <Button
            title={loading ? 'Checking...' : 'Send OTP'}
            onPress={handleSendOtp}
            loading={loading}
            style={styles.loginButton}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>🚛 Driver Access</Text>
          <Text style={styles.infoText}>
            Only pre-registered drivers can access this system. If you're a new driver, please contact your administrator for registration.
          </Text>
        </View>

        <View style={styles.support}>
          <Text style={styles.supportText}>Need help?</Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => {
              Alert.alert(
                'Support Contact',
                '📞 Call: +91-XXXXXXXXXX\n📧 Email: support@nammakasa.com',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
  info: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  support: {
    marginTop: 30,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  supportButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  supportButtonText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DriverLoginPage;