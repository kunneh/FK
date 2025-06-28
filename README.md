<<<<<<< HEAD
- 👋 Hi, I’m @kunneh
- 👀 I’m interested in programming,networking,cyber security,system administrator,internet of things
- 🌱 I’m currently learning HND in computer science 
- 💞️ I’m looking to collaborate on anyone 
- 📫 How to reach me kunnehfelix@gmail.com
- 😄 Pronouns: ...
- ⚡ Fun fact: Adventure 

<!---
kunneh/kunneh is a ✨ special ✨ repository because its `README.md` (this file) appears on your GitHub profile.
You can click the Preview link to take a look at your changes.
--->
=======
# SightMate Mobile App

A React Native vision assistance app designed to help users with visual impairments navigate their environment safely and independently.

## Features

### 🏠 Home Screen
- System status overview (location, camera, voice)
- Quick actions for common tasks
- Emergency SOS button
- Real-time location display

### 📷 Camera & Object Detection
- Real-time object detection using TensorFlow Lite
- COCO SSD MobileNet model for accurate detection
- Voice feedback for detected objects
- Photo capture functionality
- Emergency mode activation

### 🚨 Emergency Features
- One-tap SOS emergency button
- Automatic location sharing
- Emergency contact management
- Direct calling and SMS capabilities
- Quick access to 911

### ⚙️ Settings & Customization
- Voice feedback controls
- Haptic feedback settings
- Location services configuration
- Emergency notification preferences
- App permissions management

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **AI/ML**: TensorFlow Lite for object detection
- **Camera**: React Native Vision Camera
- **Location**: Expo Location
- **Speech**: Expo Speech for voice feedback
- **UI**: Custom components with React Native

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SightMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally** (if not already installed)
   ```bash
   npm install -g @expo/cli
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web (for testing)
```bash
npm run web
```

## Project Structure

```
SightMate/
├── .expo/
│   └── src/
│       ├── components/          # Reusable UI components
│       ├── screens/             # App screens
│       │   ├── HomeScreen.tsx
│       │   ├── CameraScreen.tsx
│       │   ├── EmergencyScreen.tsx
│       │   └── SettingsScreen.tsx
│       ├── navigation/          # Navigation configuration
│       │   └── AppNavigator.tsx
│       ├── services/            # Business logic services
│       │   └── TensorFlowService.ts
│       ├── utils/               # Utility functions
│       ├── constants/           # App constants
│       └── App.tsx              # Main app component
├── android/                     # Android-specific files
├── assets/                      # Static assets
│   └── models/                  # TensorFlow models
├── package.json
└── README.md
```

## Permissions Required

The app requires the following permissions:

### Android
- `CAMERA` - For object detection
- `ACCESS_FINE_LOCATION` - For location services
- `ACCESS_COARSE_LOCATION` - For location services
- `SEND_SMS` - For emergency messaging
- `RECEIVE_SMS` - For SMS functionality
- `VIBRATE` - For haptic feedback
- `RECORD_AUDIO` - For voice features

### iOS
- Camera usage description
- Location usage description
- Speech recognition usage description
- Microphone usage description

## TensorFlow Lite Integration

The app uses TensorFlow Lite for real-time object detection:

1. **Model**: COCO SSD MobileNet v1 (quantized)
2. **Location**: `assets/models/coco_ssd_mobilenet_v1_1.0_quant.tflite`
3. **Service**: `TensorFlowService.ts` handles model loading and inference
4. **Integration**: Used in `CameraScreen.tsx` for real-time detection

## Emergency Features

### SOS Button
- Triggers emergency mode with vibration feedback
- Automatically sends location to emergency contacts
- Provides voice confirmation

### Emergency Contacts
- Pre-configured emergency contacts
- Direct calling and SMS capabilities
- Location sharing with emergency messages

### Quick Actions
- Direct 911 calling
- Location sharing
- Emergency contact management

## Voice Feedback

The app provides comprehensive voice feedback:
- Object detection announcements
- Emergency mode confirmations
- System status updates
- User interaction confirmations

## Development Notes

### Adding New Features
1. Create new screen in `screens/` directory
2. Add navigation route in `AppNavigator.tsx`
3. Update permissions in `app.json` if needed
4. Test on both Android and iOS

### TensorFlow Model Updates
1. Replace model file in `assets/models/`
2. Update labels in `TensorFlowService.ts`
3. Test detection accuracy
4. Update model loading parameters if needed

### Styling
- Uses React Native StyleSheet
- Consistent color scheme throughout
- Responsive design for different screen sizes
- Accessibility considerations

## Testing

### Manual Testing
- Test all navigation flows
- Verify camera permissions and functionality
- Test emergency features
- Check voice feedback
- Verify location services

### Automated Testing
```bash
# Run tests (when implemented)
npm test
```

## Building for Production

### Android APK
```bash
eas build --platform android
```

### iOS IPA
```bash
eas build --platform ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@sightmate.app
- Issues: Create an issue in the repository

## Acknowledgments

- TensorFlow Lite for object detection
- Expo team for the excellent development platform
- React Navigation for navigation solutions
- COCO dataset for object detection training

---

**Note**: This app is designed for accessibility and should be tested with users who have visual impairments to ensure it meets their needs effectively. 
>>>>>>> 5c76d1b (Initial commit)
