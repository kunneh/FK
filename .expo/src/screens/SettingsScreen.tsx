import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import ESP32CameraService from '../services/ESP32CameraService';

interface SettingItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'toggle' | 'button' | 'link';
  icon: keyof typeof Ionicons.glyphMap;
  value?: boolean;
  onPress?: () => void;
}

interface SavedESP32Device {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  isDefault: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    voiceFeedback: true,
    hapticFeedback: true,
    autoLocation: true,
    emergencyNotifications: true,
    objectDetection: true,
    darkMode: false,
    autoConnectESP32: false,
  });

  const [savedDevices, setSavedDevices] = useState<SavedESP32Device[]>([
    {
      id: '1',
      name: 'My ESP32-CAM',
      ipAddress: '192.168.4.1',
      port: 80,
      isDefault: true,
    },
  ]);

  const [showESP32Modal, setShowESP32Modal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceIP, setNewDeviceIP] = useState('');
  const [newDevicePort, setNewDevicePort] = useState('80');

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'voiceFeedback' && value) {
      Speech.speak('Voice feedback enabled');
    }
  };

  const handleEmergencyContacts = () => {
    Alert.alert(
      'Emergency Contacts',
      'Manage your emergency contacts here. This feature will be implemented in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handlePermissions = () => {
    Alert.alert(
      'Permissions',
      'Camera, Location, and SMS permissions are required for full functionality.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About SightMate',
      'SightMate v1.0.0\n\nA vision assistance app designed to help users with visual impairments navigate their environment safely and independently.\n\nFeatures:\n• Object detection\n• Emergency assistance\n• Voice feedback\n• Location sharing\n• ESP32-CAM remote control',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. We do not collect or store personal data. All processing is done locally on your device.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'For support and feedback, please contact us at support@sightmate.app',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@sightmate.app') },
      ]
    );
  };

  const handleESP32Devices = () => {
    setShowESP32Modal(true);
  };

  const addESP32Device = () => {
    if (!newDeviceName.trim() || !newDeviceIP.trim()) {
      Alert.alert('Error', 'Please enter both name and IP address');
      return;
    }

    const port = parseInt(newDevicePort) || 80;
    const newDevice: SavedESP32Device = {
      id: Date.now().toString(),
      name: newDeviceName.trim(),
      ipAddress: newDeviceIP.trim(),
      port,
      isDefault: savedDevices.length === 0,
    };

    setSavedDevices(prev => [...prev, newDevice]);
    setNewDeviceName('');
    setNewDeviceIP('');
    setNewDevicePort('80');
    setShowESP32Modal(false);
    
    Speech.speak('ESP32-CAM device added');
    Alert.alert('Success', 'ESP32-CAM device added successfully!');
  };

  const removeESP32Device = (deviceId: string) => {
    Alert.alert(
      'Remove Device',
      'Are you sure you want to remove this ESP32-CAM device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSavedDevices(prev => prev.filter(device => device.id !== deviceId));
            Speech.speak('ESP32-CAM device removed');
          },
        },
      ]
    );
  };

  const setDefaultESP32Device = (deviceId: string) => {
    setSavedDevices(prev =>
      prev.map(device => ({
        ...device,
        isDefault: device.id === deviceId,
      }))
    );
    Speech.speak('Default ESP32-CAM device updated');
  };

  const testESP32Connection = async (device: SavedESP32Device) => {
    try {
      const success = await ESP32CameraService.initialize({
        ipAddress: device.ipAddress,
        port: device.port,
      });
      
      if (success) {
        Alert.alert('Connection Test', `Successfully connected to ${device.name} at ${device.ipAddress}`);
        Speech.speak('ESP32-CAM connection test successful');
      } else {
        Alert.alert('Connection Test', `Failed to connect to ${device.name} at ${device.ipAddress}`);
        Speech.speak('ESP32-CAM connection test failed');
      }
    } catch (error) {
      Alert.alert('Connection Test', 'Error testing connection');
    }
  };

  const settingItems: SettingItem[] = [
    {
      id: 'voiceFeedback',
      title: 'Voice Feedback',
      subtitle: 'Enable voice announcements for detected objects',
      type: 'toggle',
      icon: 'volume-high',
      value: settings.voiceFeedback,
      onPress: () => updateSetting('voiceFeedback', !settings.voiceFeedback),
    },
    {
      id: 'hapticFeedback',
      title: 'Haptic Feedback',
      subtitle: 'Enable vibration for notifications',
      type: 'toggle',
      icon: 'phone-portrait',
      value: settings.hapticFeedback,
      onPress: () => updateSetting('hapticFeedback', !settings.hapticFeedback),
    },
    {
      id: 'autoLocation',
      title: 'Auto Location',
      subtitle: 'Automatically update location for emergency features',
      type: 'toggle',
      icon: 'location',
      value: settings.autoLocation,
      onPress: () => updateSetting('autoLocation', !settings.autoLocation),
    },
    {
      id: 'emergencyNotifications',
      title: 'Emergency Notifications',
      subtitle: 'Receive notifications for emergency situations',
      type: 'toggle',
      icon: 'notifications',
      value: settings.emergencyNotifications,
      onPress: () => updateSetting('emergencyNotifications', !settings.emergencyNotifications),
    },
    {
      id: 'objectDetection',
      title: 'Object Detection',
      subtitle: 'Enable real-time object detection',
      type: 'toggle',
      icon: 'eye',
      value: settings.objectDetection,
      onPress: () => updateSetting('objectDetection', !settings.objectDetection),
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      subtitle: 'Use dark theme for better visibility',
      type: 'toggle',
      icon: 'moon',
      value: settings.darkMode,
      onPress: () => updateSetting('darkMode', !settings.darkMode),
    },
    {
      id: 'autoConnectESP32',
      title: 'Auto-Connect ESP32-CAM',
      subtitle: 'Automatically connect to default ESP32-CAM device',
      type: 'toggle',
      icon: 'wifi',
      value: settings.autoConnectESP32,
      onPress: () => updateSetting('autoConnectESP32', !settings.autoConnectESP32),
    },
    {
      id: 'esp32Devices',
      title: 'ESP32-CAM Devices',
      subtitle: `Manage ${savedDevices.length} saved device${savedDevices.length !== 1 ? 's' : ''}`,
      type: 'button',
      icon: 'camera',
      onPress: handleESP32Devices,
    },
    {
      id: 'emergencyContacts',
      title: 'Emergency Contacts',
      subtitle: 'Manage your emergency contact list',
      type: 'button',
      icon: 'people',
      onPress: handleEmergencyContacts,
    },
    {
      id: 'permissions',
      title: 'Permissions',
      subtitle: 'Manage app permissions',
      type: 'button',
      icon: 'shield-checkmark',
      onPress: handlePermissions,
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App information and version',
      type: 'button',
      icon: 'information-circle',
      onPress: handleAbout,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      type: 'button',
      icon: 'lock-closed',
      onPress: handlePrivacy,
    },
    {
      id: 'support',
      title: 'Support',
      subtitle: 'Get help and contact support',
      type: 'button',
      icon: 'help-circle',
      onPress: handleSupport,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <View key={item.id} style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name={item.icon} size={24} color="#007AFF" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      {item.type === 'toggle' && (
        <Switch
          value={item.value}
          onValueChange={item.onPress}
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
        />
      )}
      
      {item.type === 'button' && (
        <TouchableOpacity onPress={item.onPress}>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Features</Text>
        {settingItems.slice(0, 7).map(renderSettingItem)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        {settingItems.slice(7).map(renderSettingItem)}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SightMate v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for accessibility</Text>
      </View>

      {/* ESP32-CAM Devices Modal */}
      <Modal
        visible={showESP32Modal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ESP32-CAM Devices</Text>
            <TouchableOpacity onPress={() => setShowESP32Modal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {savedDevices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceInfo}>
                  <Ionicons name="camera" size={24} color="#007AFF" />
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceAddress}>{device.ipAddress}:{device.port}</Text>
                    {device.isDefault && (
                      <Text style={styles.defaultBadge}>Default</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.deviceActions}>
                  <TouchableOpacity
                    style={styles.deviceActionButton}
                    onPress={() => testESP32Connection(device)}
                  >
                    <Ionicons name="wifi" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                  
                  {!device.isDefault && (
                    <TouchableOpacity
                      style={styles.deviceActionButton}
                      onPress={() => setDefaultESP32Device(device.id)}
                    >
                      <Ionicons name="star" size={16} color="#FF9800" />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.deviceActionButton}
                    onPress={() => removeESP32Device(device.id)}
                  >
                    <Ionicons name="trash" size={16} color="#FF5722" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.addDeviceSection}>
              <Text style={styles.addDeviceTitle}>Add New Device</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Device Name (e.g., Living Room Camera)"
                value={newDeviceName}
                onChangeText={setNewDeviceName}
              />
              
              <TextInput
                style={styles.input}
                placeholder="IP Address (e.g., 192.168.4.1)"
                value={newDeviceIP}
                onChangeText={setNewDeviceIP}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Port (default: 80)"
                value={newDevicePort}
                onChangeText={setNewDevicePort}
                keyboardType="numeric"
              />
              
              <TouchableOpacity style={styles.addButton} onPress={addESP32Device}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Add Device</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#333',
  },
  settingItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  deviceCard: {
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
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  defaultBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  deviceActions: {
    flexDirection: 'row',
  },
  deviceActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#f8f9fa',
  },
  addDeviceSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addDeviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 