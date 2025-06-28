// App.tsx – Entry point for the SightMate Expo app

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

// Simple web interface
const WebInterface = () => (
  <SafeAreaView style={styles.webContainer}>
    <View style={styles.webContent}>
      <Text style={styles.webTitle}>SightMate</Text>
      <Text style={styles.webSubtitle}>Vision Assistance App</Text>
      
      <View style={styles.webCard}>
        <Text style={styles.webCardTitle}>📱 Mobile App Features</Text>
        <Text style={styles.webCardText}>
          This app is designed for mobile devices to help users with visual impairments navigate their environment safely.
        </Text>
      </View>

      <View style={styles.webCard}>
        <Text style={styles.webCardTitle}>🔍 Key Features</Text>
        <Text style={styles.webFeature}>• Real-time object detection</Text>
        <Text style={styles.webFeature}>• Emergency SOS functionality</Text>
        <Text style={styles.webFeature}>• Voice feedback and assistance</Text>
        <Text style={styles.webFeature}>• Location-based emergency services</Text>
        <Text style={styles.webFeature}>• Camera integration</Text>
        <Text style={styles.webFeature}>• Haptic feedback</Text>
      </View>

      <View style={styles.webCard}>
        <Text style={styles.webCardTitle}>📲 How to Use</Text>
        <Text style={styles.webCardText}>
          1. Download Expo Go from the App Store{'\n'}
          2. Scan the QR code from your terminal{'\n'}
          3. Grant necessary permissions{'\n'}
          4. Start using SightMate!
        </Text>
      </View>
    </View>
  </SafeAreaView>
);

export default function App() {
  // Show web interface for web platform
  if (Platform.OS === 'web') {
    return <WebInterface />;
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  webContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  webSubtitle: {
    fontSize: 24,
    color: 'white',
    opacity: 0.9,
    marginBottom: 40,
    textAlign: 'center',
  },
  webCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    maxWidth: 600,
  },
  webCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  webCardText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
  },
  webFeature: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    paddingLeft: 10,
  },
});
