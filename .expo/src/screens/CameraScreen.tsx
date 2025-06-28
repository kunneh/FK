import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import * as ExpoCamera from 'expo-camera';
import * as Speech from 'expo-speech';

interface DetectedObject {
  id: number;
  label: string;
  confidence: number;
}

const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [currentObject, setCurrentObject] = useState<string>('');
  const cameraRef = useRef<ExpoCamera.Camera>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await ExpoCamera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.log('Camera permission request failed:', error);
        setHasPermission(false);
      }
    })();
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    Speech.speak('Starting object detection scan');
    
    // Simulate object detection for Expo Go
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

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        Speech.speak('Photo captured');
        Alert.alert('Success', 'Photo captured successfully');
      } catch (error) {
        console.error('Error capturing photo:', error);
        Alert.alert('Error', 'Failed to capture photo');
      }
    }
  };

  const handleEmergency = () => {
    Vibration.vibrate(1000);
    Speech.speak('Emergency mode activated');
    Alert.alert('Emergency', 'Emergency mode activated');
  };

  const simulateDetection = () => {
    const mockObjects = [
      { label: 'person', confidence: 0.85 },
      { label: 'car', confidence: 0.72 },
      { label: 'chair', confidence: 0.68 },
    ];

    mockObjects.forEach((obj, index) => {
      setTimeout(() => {
        handleDetection({
          id: index + 1,
          label: obj.label,
          confidence: obj.confidence,
        });
      }, index * 1000);
    });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => ExpoCamera.requestCameraPermissionsAsync()}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCamera.Camera
        style={styles.camera}
        type="back"
        ref={cameraRef}
      >
        {/* Overlay UI */}
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={[styles.controlButton, isScanning && styles.activeButton]}
              onPress={isScanning ? stopScanning : startScanning}
            >
              <Text style={styles.buttonText}>
                {isScanning ? '⏹️' : '▶️'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handleEmergency}>
              <Text style={styles.buttonText}>🚨</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={simulateDetection}>
              <Text style={styles.buttonText}>👁️</Text>
            </TouchableOpacity>
          </View>

          {/* Detection Info */}
          {currentObject && (
            <View style={styles.detectionInfo}>
              <Text style={styles.detectionText}>{currentObject}</Text>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>

          {/* Detection List */}
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

          {/* Expo Go Notice */}
          <View style={styles.expoNotice}>
            <Text style={styles.expoNoticeText}>
              📱 Expo Go Mode - Using simulated detection
            </Text>
          </View>
        </View>
      </ExpoCamera.Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(255, 87, 34, 0.8)',
  },
  buttonText: {
    fontSize: 20,
  },
  detectionInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  detectionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  detectionList: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    maxWidth: 150,
  },
  detectionListTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detectionItem: {
    color: 'white',
    fontSize: 10,
    marginBottom: 2,
  },
  expoNotice: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  expoNoticeText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraScreen; 