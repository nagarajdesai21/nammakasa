import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type UserTypeSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'UserTypeSelection'
>;

interface Props {
  navigation: UserTypeSelectionScreenNavigationProp;
}

export default function UserTypeSelectionScreen({ navigation }: Props) {
  const handleUserTypeSelect = (userType: 'citizen' | 'driver') => {
    navigation.navigate('Login', { userType });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Nammakasa</Text>
          <Text style={styles.subtitle}>Smart Waste Collection</Text>
          <Text style={styles.mockIndicator}>🔧 Mock Mode Active</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, styles.citizenButton]}
            onPress={() => handleUserTypeSelect('citizen')}
          >
            <Text style={styles.optionIcon}>🏠</Text>
            <Text style={styles.optionTitle}>I'm a Citizen</Text>
            <Text style={styles.optionDescription}>
              Track waste collection, get ETAs, receive notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.driverButton]}
            onPress={() => handleUserTypeSelect('driver')}
          >
            <Text style={styles.optionIcon}>🚛</Text>
            <Text style={styles.optionTitle}>I'm a Driver</Text>
            <Text style={styles.optionDescription}>
              Manage routes, update locations, mark completions
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
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
    color: '#4CAF50',
    marginBottom: 8,
  },
  mockIndicator: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
    fontStyle: 'italic',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  citizenButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  driverButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});