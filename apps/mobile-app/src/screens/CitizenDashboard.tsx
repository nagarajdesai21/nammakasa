// src/screens/CitizenDashboard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CitizenDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citizen Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to Nammakasa</Text>
      <Text style={styles.note}>This screen will show your assigned route and live tracking.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  note: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});