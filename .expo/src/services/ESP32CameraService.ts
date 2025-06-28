import { Platform } from 'react-native';

export interface ESP32CameraConfig {
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  streamPath: string;
}

export interface ESP32CameraStatus {
  isConnected: boolean;
  isStreaming: boolean;
  signalStrength: number;
  ipAddress: string;
  lastConnected: Date | null;
}

class ESP32CameraService {
  private config: ESP32CameraConfig | null = null;
  private status: ESP32CameraStatus = {
    isConnected: false,
    isStreaming: false,
    signalStrength: 0,
    ipAddress: '',
    lastConnected: null,
  };
  private streamUrl: string | null = null;
  private abortController: AbortController | null = null;

  // Default ESP32-CAM configuration
  private readonly DEFAULT_CONFIG: ESP32CameraConfig = {
    ipAddress: '192.168.4.1', // Default ESP32-CAM AP IP
    port: 80,
    streamPath: '/stream',
  };

  /**
   * Initialize ESP32-CAM connection
   */
  async initialize(config?: Partial<ESP32CameraConfig>): Promise<boolean> {
    try {
      this.config = { ...this.DEFAULT_CONFIG, ...config };
      
      // Test connection to ESP32-CAM
      const isConnected = await this.testConnection();
      
      if (isConnected) {
        this.status.isConnected = true;
        this.status.ipAddress = this.config.ipAddress;
        this.status.lastConnected = new Date();
        this.streamUrl = this.buildStreamUrl();
        
        console.log('ESP32-CAM connected successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to initialize ESP32-CAM connection:', error);
      return false;
    }
  }

  /**
   * Test connection to ESP32-CAM
   */
  private async testConnection(): Promise<boolean> {
    if (!this.config) return false;

    try {
      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => this.abortController?.abort(), 5000);

      const response = await fetch(`http://${this.config.ipAddress}:${this.config.port}/status`, {
        method: 'GET',
        signal: this.abortController.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('ESP32-CAM connection test failed:', error);
      return false;
    }
  }

  /**
   * Build stream URL for video feed
   */
  private buildStreamUrl(): string {
    if (!this.config) return '';
    
    const { ipAddress, port, streamPath } = this.config;
    return `http://${ipAddress}:${port}${streamPath}`;
  }

  /**
   * Get current video stream URL
   */
  getStreamUrl(): string | null {
    return this.streamUrl;
  }

  /**
   * Get connection status
   */
  getStatus(): ESP32CameraStatus {
    return { ...this.status };
  }

  /**
   * Start video streaming
   */
  async startStreaming(): Promise<boolean> {
    try {
      if (!this.status.isConnected || !this.config) {
        console.warn('ESP32-CAM not connected');
        return false;
      }

      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => this.abortController?.abort(), 3000);

      // Send start streaming command to ESP32-CAM
      const response = await fetch(`http://${this.config.ipAddress}:${this.config.port}/start-stream`, {
        method: 'POST',
        signal: this.abortController.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.status.isStreaming = true;
        console.log('ESP32-CAM streaming started');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to start ESP32-CAM streaming:', error);
      return false;
    }
  }

  /**
   * Stop video streaming
   */
  async stopStreaming(): Promise<boolean> {
    try {
      if (!this.status.isConnected || !this.config) return false;

      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => this.abortController?.abort(), 3000);

      // Send stop streaming command to ESP32-CAM
      const response = await fetch(`http://${this.config.ipAddress}:${this.config.port}/stop-stream`, {
        method: 'POST',
        signal: this.abortController.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.status.isStreaming = false;
        console.log('ESP32-CAM streaming stopped');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to stop ESP32-CAM streaming:', error);
      return false;
    }
  }

  /**
   * Capture photo from ESP32-CAM
   */
  async capturePhoto(): Promise<string | null> {
    try {
      if (!this.status.isConnected || !this.config) return null;

      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => this.abortController?.abort(), 10000);

      const response = await fetch(`http://${this.config.ipAddress}:${this.config.port}/capture`, {
        method: 'GET',
        signal: this.abortController.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // For React Native, we return the response URL directly
        // The calling component can handle the image display
        return `http://${this.config.ipAddress}:${this.config.port}/capture`;
      }

      return null;
    } catch (error) {
      console.error('Failed to capture photo from ESP32-CAM:', error);
      return null;
    }
  }

  /**
   * Get photo as base64 for React Native
   */
  async capturePhotoAsBase64(): Promise<string | null> {
    try {
      if (!this.status.isConnected || !this.config) return null;

      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => this.abortController?.abort(), 10000);

      const response = await fetch(`http://${this.config.ipAddress}:${this.config.port}/capture`, {
        method: 'GET',
        signal: this.abortController.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const base64 = this.arrayBufferToBase64(arrayBuffer);
        return `data:image/jpeg;base64,${base64}`;
      }

      return null;
    } catch (error) {
      console.error('Failed to capture photo from ESP32-CAM:', error);
      return null;
    }
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Disconnect from ESP32-CAM
   */
  disconnect(): void {
    // Abort any ongoing requests
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.status.isConnected = false;
    this.status.isStreaming = false;
    this.streamUrl = null;
    console.log('Disconnected from ESP32-CAM');
  }

  /**
   * Scan for available ESP32-CAM devices
   */
  async scanForDevices(): Promise<string[]> {
    // This would scan the local network for ESP32-CAM devices
    // Implementation depends on platform capabilities
    const devices: string[] = [];
    
    try {
      // Scan common ESP32-CAM IP ranges
      const ipRanges = [
        '192.168.4.1', // Default ESP32-CAM AP
        '192.168.1.100',
        '192.168.1.101',
        '192.168.1.102',
      ];

      // Use Promise.allSettled to scan all IPs concurrently
      const scanPromises = ipRanges.map(async (ip) => {
        const isDevice = await this.testDeviceAtIP(ip);
        return isDevice ? ip : null;
      });

      const results = await Promise.allSettled(scanPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          devices.push(result.value);
        }
      });
    } catch (error) {
      console.error('Error scanning for ESP32-CAM devices:', error);
    }

    return devices;
  }

  /**
   * Test if a device at given IP is an ESP32-CAM
   */
  private async testDeviceAtIP(ip: string): Promise<boolean> {
    try {
      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => this.abortController?.abort(), 2000);

      const response = await fetch(`http://${ip}:80/status`, {
        method: 'GET',
        signal: this.abortController.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Update signal strength (mock implementation)
   */
  updateSignalStrength(): void {
    // In a real implementation, this would measure WiFi signal strength
    // For now, we'll simulate it
    this.status.signalStrength = Math.floor(Math.random() * 100);
  }

  /**
   * Get configuration
   */
  getConfig(): ESP32CameraConfig | null {
    return this.config ? { ...this.config } : null;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ESP32CameraConfig>): void {
    if (this.config) {
      this.config = { ...this.config, ...newConfig };
      this.streamUrl = this.buildStreamUrl();
    }
  }
}

export default new ESP32CameraService(); 