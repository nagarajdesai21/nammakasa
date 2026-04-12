import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DriverLoginPage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Driver Login - Handled in LoginPage tab</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DriverLoginPage;
