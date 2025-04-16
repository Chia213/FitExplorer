# FitExplorer Mobile App

This is the Expo version of FitExplorer, supporting both mobile (iOS/Android) and web platforms from a single codebase.

## Project Structure

```
mobile/
├── assets/                # App icons, splash screens, and other static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── contexts/          # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── api/               # API client and endpoints
│   └── assets/            # Images, fonts, etc.
├── App.js                 # Main app component and navigation setup
└── app.json               # Expo configuration
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Development

#### Run on Web

```bash
npm run web
```

This will start the development server and open the app in your browser.

#### Run on iOS Simulator (macOS only)

```bash
npm run ios
```

#### Run on Android Emulator

```bash
npm run android
```

#### Run on Physical Device

1. Start the development server:
   ```bash
   npm start
   ```
2. Scan the QR code with the Expo Go app on your device.

### Building for Production

#### Web

To build the web version:

```bash
npm run build:web
```

This will generate a production build in the `dist` directory that you can deploy to any static hosting service.

#### Native Apps

To build the native apps, you'll need to use EAS Build:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure EAS:
   ```bash
   eas build:configure
   ```

3. Build for iOS:
   ```bash
   eas build --platform ios
   ```

4. Build for Android:
   ```bash
   eas build --platform android
   ```

## Integration with Existing Web App

This Expo app is designed to work alongside the existing web version of FitExplorer. Key considerations:

1. **Shared API Endpoints**: Both apps use the same backend API.
2. **Authentication**: Auth tokens are compatible across platforms.
3. **Code Migration**: Components are gradually being migrated to support both platforms.
4. **Deployment**: The web version can be deployed to the same domain as the existing web app.

## Platform-Specific Code

Use the platform utilities to handle platform-specific behavior:

```javascript
import { isWeb, isIOS, isAndroid, platformSpecificStyles } from './src/utils/platform';

// Conditional logic
if (isWeb) {
  // Web-only code
} else if (isIOS) {
  // iOS-only code
} else if (isAndroid) {
  // Android-only code
}

// Platform-specific styles
const styles = platformSpecificStyles({
  web: { /* web styles */ },
  ios: { /* iOS styles */ },
  android: { /* Android styles */ },
  default: { /* fallback styles */ }
});
``` 