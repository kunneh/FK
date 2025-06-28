import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.log('Location permission check failed:', error);
      setLocationPermission(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for emergency features.');
      }
    } catch (error) {
      console.log('Location permission request failed:', error);
      setLocationPermission(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (!locationPermission) {
        await requestPermissions();
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);
      return loc;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get current location');
      return null;
    }
  };

  const handleQuickScan = () => {
    Speech.speak('Starting quick scan for objects around you');
    // Navigate to camera screen with quick scan mode
  };

  const handleEmergencyCall = async () => {
    Vibration.vibrate(1000);
    const loc = await getCurrentLocation();
    
    if (loc) {
      const message = `Emergency! I need help. My location is: ${loc.coords.latitude}, ${loc.coords.longitude}`;
      Speech.speak(message);
      Alert.alert(
        'Emergency Alert',
        'Emergency message prepared. Would you like to send it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send', onPress: () => sendEmergencyMessage(loc) },
        ]
      );
    } else {
      Alert.alert('Location Unavailable', 'Please enable location services for emergency features.');
    }
  };

  const sendEmergencyMessage = (loc: Location.LocationObject) => {
    // Implementation for sending SMS or making emergency call
    Speech.speak('Emergency message sent');
    Alert.alert('Sent', 'Emergency message has been sent');
  };

  const handleVoiceCommand = () => {
    setIsListening(true);
    Speech.speak('Listening for voice commands');
    // Implement voice recognition here
    setTimeout(() => setIsListening(false), 5000);
  };

  const handleESP32Camera = () => {
    Speech.speak('Opening ESP32-CAM remote camera control');
    // This will be handled by navigation
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SightMate</Text>
        <Text style={styles.subtitle}>Your Vision Assistant</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>System Status</Text>
        <View style={styles.statusItem}>
          <Ionicons name="location" size={20} color={locationPermission ? '#4CAF50' : '#FF9800'} />
          <Text style={styles.statusText}>
            Location: {locationPermission ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="camera" size={20} color="#4CAF50" />
          <Text style={styles.statusText}>Camera: Ready</Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="mic" size={20} color={isListening ? '#FF5722' : '#4CAF50'} />
          <Text style={styles.statusText}>
            Voice: {isListening ? 'Listening' : 'Ready'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="wifi" size={20} color="#007AFF" />
          <Text style={styles.statusText}>ESP32-CAM: Available</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleQuickScan}>
          <Ionicons name="scan" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Quick Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleVoiceCommand}>
          <Ionicons name="mic" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Voice Command</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={getCurrentLocation}>
          <Ionicons name="location" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Get Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleESP32Camera}>
          <Ionicons name="wifi" size={24} color="#007AFF" />
          <Text style={styles.actionText}>ESP32-CAM Control</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <Ionicons name="warning" size={32} color="white" />
        <Text style={styles.emergencyText}>EMERGENCY</Text>
      </TouchableOpacity>

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>Current Location:</Text>
          <Text style={styles.locationText}>
            {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  quickActions: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  emergencyButton: {
    backgroundColor: '#FF5722',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emergencyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationInfo: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
}); 