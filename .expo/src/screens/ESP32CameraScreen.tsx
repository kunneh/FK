import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import ESP32CameraService, { ESP32CameraConfig } from '../services/ESP32CameraService';

interface DetectedObject {
  id: number;
  label: string;
  confidence: number;
}

const ESP32CameraScreen: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [currentObject, setCurrentObject] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [customIP, setCustomIP] = useState<string>('192.168.4.1');
  const [customPort, setCustomPort] = useState<string>('80');

  useEffect(() => {
    // Scan for available devices on component mount
    scanForDevices();
    
    // Update status periodically
    const statusInterval = setInterval(updateStatus, 5000);
    
    return () => {
      clearInterval(statusInterval);
      ESP32CameraService.disconnect();
    };
  }, []);

  const updateStatus = () => {
    const status = ESP32CameraService.getStatus();
    setIsConnected(status.isConnected);
    setIsStreaming(status.isStreaming);
  };

  const scanForDevices = async () => {
    setIsLoading(true);
    try {
      const devices = await ESP32CameraService.scanForDevices();
      setAvailableDevices(devices);
      if (devices.length > 0) {
        setSelectedDevice(devices[0]);
      }
    } catch (error) {
      console.error('Error scanning for devices:', error);
      Alert.alert('Error', 'Failed to scan for ESP32-CAM devices');
    } finally {
      setIsLoading(false);
    }
  };

  const connectToDevice = async (ipAddress?: string, port?: number) => {
    setIsLoading(true);
    try {
      const config: Partial<ESP32CameraConfig> = {
        ipAddress: ipAddress || selectedDevice || customIP,
        port: port || parseInt(customPort) || 80,
      };

      const success = await ESP32CameraService.initialize(config);
      
      if (success) {
        setIsConnected(true);
        Speech.speak('Connected to ESP32-CAM');
        Alert.alert('Success', 'Connected to ESP32-CAM successfully!');
      } else {
        Alert.alert('Connection Failed', 'Could not connect to ESP32-CAM. Please check the IP address and try again.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'Failed to connect to ESP32-CAM');
    } finally {
      setIsLoading(false);
    }
  };

  const startStreaming = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to an ESP32-CAM first');
      return;
    }

    setIsLoading(true);
    try {
      const success = await ESP32CameraService.startStreaming();
      if (success) {
        setIsStreaming(true);
        Speech.speak('ESP32-CAM streaming started');
      } else {
        Alert.alert('Error', 'Failed to start streaming');
      }
    } catch (error) {
      console.error('Streaming error:', error);
      Alert.alert('Error', 'Failed to start streaming');
    } finally {
      setIsLoading(false);
    }
  };

  const stopStreaming = async () => {
    setIsLoading(true);
    try {
      const success = await ESP32CameraService.stopStreaming();
      if (success) {
        setIsStreaming(false);
        Speech.speak('ESP32-CAM streaming stopped');
      }
    } catch (error) {
      console.error('Stop streaming error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to an ESP32-CAM first');
      return;
    }

    setIsLoading(true);
    try {
      const imageUrl = await ESP32CameraService.capturePhotoAsBase64();
      if (imageUrl) {
        setCapturedImage(imageUrl);
        Speech.speak('Photo captured from ESP32-CAM');
        Alert.alert('Success', 'Photo captured successfully!');
      } else {
        Alert.alert('Error', 'Failed to capture photo');
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    Speech.speak('Starting object detection scan with ESP32-CAM');
    
    // Simulate object detection for ESP32-CAM
    setTimeout(() => {
      const mockDetection: DetectedObject = {
        id: 1,
        label: 'person',
        confidence: 0.85,
      };
      handleDetection(mockDetection);
    }, 2000);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setDetectedObjects([]);
    setCurrentObject('');
    Speech.speak('Stopping object detection');
  };

  const handleDetection = (object: DetectedObject) => {
    setDetectedObjects(prev => [...prev, object]);
    
    if (object.confidence > 0.7) {
      const message = `${object.label} detected with ${Math.round(object.confidence * 100)}% confidence`;
      setCurrentObject(message);
      Speech.speak(message);
      Vibration.vibrate(200);
    }
  };

  const handleEmergency = () => {
    Vibration.vibrate(1000);
    Speech.speak('Emergency mode activated');
    Alert.alert('Emergency', 'Emergency mode activated');
  };

  const disconnect = () => {
    ESP32CameraService.disconnect();
    setIsConnected(false);
    setIsStreaming(false);
    setCapturedImage(null);
    Speech.speak('Disconnected from ESP32-CAM');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ESP32-CAM</Text>
        <Text style={styles.subtitle}>Remote Camera Control</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Connection Status</Text>
        <View style={styles.statusItem}>
          <Ionicons 
            name={isConnected ? "wifi" : "wifi-outline"} 
            size={20} 
            color={isConnected ? '#4CAF50' : '#FF9800'} 
          />
          <Text style={styles.statusText}>
            ESP32-CAM: {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons 
            name={isStreaming ? "videocam" : "videocam-outline"} 
            size={20} 
            color={isStreaming ? '#4CAF50' : '#666'} 
          />
          <Text style={styles.statusText}>
            Streaming: {isStreaming ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Device Selection */}
      {!isConnected && (
        <View style={styles.connectionCard}>
          <Text style={styles.sectionTitle}>Connect to ESP32-CAM</Text>
          
          <TouchableOpacity style={styles.scanButton} onPress={scanForDevices}>
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.scanButtonText}>Scan for Devices</Text>
          </TouchableOpacity>

          {availableDevices.length > 0 && (
            <View style={styles.deviceList}>
              <Text style={styles.deviceListTitle}>Available Devices:</Text>
              {availableDevices.map((device, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.deviceItem, selectedDevice === device && styles.selectedDevice]}
                  onPress={() => setSelectedDevice(device)}
                >
                  <Ionicons name="camera" size={16} color="#007AFF" />
                  <Text style={styles.deviceText}>{device}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Custom IP Address:</Text>
            <TextInput
              style={styles.input}
              value={customIP}
              onChangeText={setCustomIP}
              placeholder="192.168.4.1"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Port:</Text>
            <TextInput
              style={styles.input}
              value={customPort}
              onChangeText={setCustomPort}
              placeholder="80"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity 
            style={styles.connectButton} 
            onPress={() => connectToDevice()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="link" size={20} color="white" />
                <Text style={styles.connectButtonText}>Connect</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Camera Controls */}
      {isConnected && (
        <View style={styles.controlsCard}>
          <Text style={styles.sectionTitle}>Camera Controls</Text>
          
          <View style={styles.controlRow}>
            <TouchableOpacity 
              style={[styles.controlButton, isStreaming && styles.activeButton]} 
              onPress={isStreaming ? stopStreaming : startStreaming}
              disabled={isLoading}
            >
              <Ionicons 
                name={isStreaming ? "stop" : "play"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.controlButtonText}>
                {isStreaming ? 'Stop Stream' : 'Start Stream'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={capturePhoto}
              disabled={isLoading}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.controlButtonText}>Capture Photo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.disconnectButton} 
            onPress={disconnect}
          >
            <Ionicons name="close-circle" size={20} color="white" />
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Video Stream Display */}
      {isStreaming && (
        <View style={styles.streamCard}>
          <Text style={styles.sectionTitle}>Live Stream</Text>
          <View style={styles.streamContainer}>
            <Text style={styles.streamPlaceholder}>
              ESP32-CAM Video Stream{'\n'}
              (Stream URL: {ESP32CameraService.getStreamUrl()})
            </Text>
          </View>
        </View>
      )}

      {/* Captured Photo */}
      {capturedImage && (
        <View style={styles.photoCard}>
          <Text style={styles.sectionTitle}>Captured Photo</Text>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        </View>
      )}

      {/* Object Detection Controls */}
      {isConnected && (
        <View style={styles.detectionCard}>
          <Text style={styles.sectionTitle}>Object Detection</Text>
          
          <TouchableOpacity
            style={[styles.detectionButton, isScanning && styles.activeButton]}
            onPress={isScanning ? stopScanning : startScanning}
          >
            <Ionicons name={isScanning ? "stop" : "eye"} size={24} color="white" />
            <Text style={styles.detectionButtonText}>
              {isScanning ? 'Stop Detection' : 'Start Detection'}
            </Text>
          </TouchableOpacity>

          {currentObject && (
            <View style={styles.detectionInfo}>
              <Text style={styles.detectionText}>{currentObject}</Text>
            </View>
          )}

          {detectedObjects.length > 0 && (
            <View style={styles.detectionList}>
              <Text style={styles.detectionListTitle}>Recent Detections:</Text>
              {detectedObjects.slice(-3).map((obj, index) => (
                <Text key={index} style={styles.detectionItem}>
                  {obj.label} ({Math.round(obj.confidence * 100)}%)
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Emergency Button */}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
        <Ionicons name="warning" size={32} color="white" />
        <Text style={styles.emergencyText}>EMERGENCY</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

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
  connectionCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deviceList: {
    marginBottom: 16,
  },
  deviceListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
  },
  selectedDevice: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  deviceText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  controlsCard: {
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
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  activeButton: {
    backgroundColor: '#FF5722',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  disconnectButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  streamCard: {
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
  streamContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamPlaceholder: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  photoCard: {
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
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  detectionCard: {
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
  detectionButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  detectionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detectionInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detectionText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  detectionList: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  detectionListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  detectionItem: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
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
});

export default ESP32CameraScreen;
