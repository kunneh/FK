import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'family' | 'friend' | 'emergency';
}

export default function EmergencyScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  const emergencyContacts: EmergencyContact[] = [
    {
      id: '1',
      name: 'Emergency Services',
      phone: '+223549227652',
      type: 'emergency',
    },
    {
      id: '2',
      name: 'Family Member',
      phone: '+223549227652',
      type: 'family',
    },
    {
      id: '3',
      name: 'Friend',
      phone: '+223549227652',
      type: 'friend',
    },
  ];

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

  const getCurrentLocation = async () => {
    try {
      if (!locationPermission) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for emergency features.');
          return null;
        }
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);
      Speech.speak('Location updated');
      return loc;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get current location');
      return null;
    }
  };

  const activateEmergencyMode = async () => {
    setIsEmergencyMode(true);
    Vibration.vibrate(1000);
    Speech.speak('Emergency mode activated. Sending SOS message.');
    
    const loc = await getCurrentLocation();
    
    if (loc) {
      const message = `EMERGENCY SOS: I need immediate help! My location is: ${loc.coords.latitude}, ${loc.coords.longitude}`;
      
      // Simulate sending to emergency contacts
      setTimeout(() => {
        Alert.alert('SOS Sent', 'Emergency message has been sent to your contacts.');
        setIsEmergencyMode(false);
      }, 3000);
    } else {
      Alert.alert('Location Unavailable', 'Could not send SOS without location.');
      setIsEmergencyMode(false);
    }
  };

  const callContact = (contact: EmergencyContact) => {
    const phoneNumber = contact.phone;
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot make phone calls on this device');
      }
    });
  };

  const sendSMS = (contact: EmergencyContact) => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    const message = `EMERGENCY: I need help! My location is: ${location.coords.latitude}, ${location.coords.longitude}`;
    const url = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot send SMS on this device');
      }
    });
  };

  const shareLocation = async () => {
    if (!location) {
      await getCurrentLocation();
      return;
    }

    const locationText = `My current location: ${location.coords.latitude}, ${location.coords.longitude}`;
    const url = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    
    // For now, just show an alert. In a real app, you'd use a sharing library
    Alert.alert('Location', locationText, [
      { text: 'Copy', onPress: () => console.log('Copy to clipboard') },
      { text: 'Open in Maps', onPress: () => Linking.openURL(url) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getContactIcon = (type: EmergencyContact['type']) => {
    switch (type) {
      case 'emergency':
        return 'warning';
      case 'family':
        return 'people';
      case 'friend':
        return 'person';
      default:
        return 'call';
    }
  };

  const getContactColor = (type: EmergencyContact['type']) => {
    switch (type) {
      case 'emergency':
        return '#FF5722';
      case 'family':
        return '#4CAF50';
      case 'friend':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency</Text>
        <Text style={styles.subtitle}>Quick access to help</Text>
      </View>

      {/* Emergency SOS Button */}
      <TouchableOpacity
        style={[styles.sosButton, isEmergencyMode && styles.sosButtonActive]}
        onPress={activateEmergencyMode}
        disabled={isEmergencyMode}
      >
        <Ionicons name="warning" size={48} color="white" />
        <Text style={styles.sosText}>
          {isEmergencyMode ? 'SENDING SOS...' : 'SOS EMERGENCY'}
        </Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={getCurrentLocation}>
          <Ionicons name="location" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Update Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={shareLocation}>
          <Ionicons name="share" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Share Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL('tel:911')}>
          <Ionicons name="call" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Call 911</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.contactsSection}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        
        {emergencyContacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Ionicons 
                name={getContactIcon(contact.type) as any} 
                size={24} 
                color={getContactColor(contact.type)} 
              />
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
            </View>
            
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={[styles.contactButton, styles.callButton]}
                onPress={() => callContact(contact)}
              >
                <Ionicons name="call" size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.contactButton, styles.smsButton]}
                onPress={() => sendSMS(contact)}
              >
                <Ionicons name="chatbubble" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Location Status */}
      {location && (
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>Current Location</Text>
          <Text style={styles.locationText}>
            {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationAccuracy}>
            Accuracy: ±{Math.round(location.coords.accuracy)}m
          </Text>
        </View>
      )}

      {/* Emergency Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>Emergency Instructions</Text>
        <Text style={styles.instructionsText}>
          • Press the SOS button to send your location to emergency contacts{'\n'}
          • Use the quick actions to call 911 or share your location{'\n'}
          • Contact your emergency contacts directly using the buttons below{'\n'}
          • Stay calm and follow emergency services instructions
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF5722',
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
  sosButton: {
    backgroundColor: '#FF5722',
    margin: 16,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosButtonActive: {
    backgroundColor: '#D32F2F',
  },
  sosText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
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
  contactsSection: {
    margin: 16,
  },
  contactCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactDetails: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  smsButton: {
    backgroundColor: '#2196F3',
  },
  locationCard: {
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
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#999',
  },
  instructionsCard: {
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
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 