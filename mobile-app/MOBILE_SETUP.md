# FitExplorer Mobile App Setup Guide

This guide will help you convert your FitExplorer web app into a mobile app using Capacitor.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- For iOS development: macOS with Xcode
- For Android development: Android Studio

## Quick Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Initialize Capacitor

```bash
# Initialize Capacitor (if not already done)
npx cap init "FitExplorer" "com.fitexplorer.app"

# Add platforms
npx cap add ios      # macOS only
npx cap add android  # All platforms
```

### 3. Build and Sync

```bash
# Build your React app
npm run build

# Sync with native platforms
npx cap sync
```

### 4. Generate App Icons

```bash
cd ../mobile-app
node generate-icons.js
```

### 5. Run on Device/Simulator

```bash
# iOS (macOS only)
npm run mobile:ios

# Android
npm run mobile:android
```

## Manual Setup (Alternative)

If the automated setup doesn't work, follow these steps:

### 1. Install Capacitor CLI globally

```bash
npm install -g @capacitor/cli
```

### 2. Add Capacitor to your project

```bash
cd frontend
npm install @capacitor/core @capacitor/cli
```

### 3. Initialize Capacitor

```bash
npx cap init
```

### 4. Add platforms

```bash
npx cap add ios
npx cap add android
```

### 5. Configure your app

Edit `capacitor.config.ts` to match your app settings.

## App Store Deployment

### iOS App Store

1. Open `ios/App/App.xcworkspace` in Xcode
2. Configure signing and certificates
3. Archive and upload to App Store Connect
4. Submit for review

### Google Play Store

1. Open `android` folder in Android Studio
2. Build signed APK or AAB
3. Upload to Google Play Console
4. Submit for review

## Configuration

### App Icons

Place your app icons in the appropriate platform directories:
- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Android: `android/app/src/main/res/`

### Splash Screens

Configure splash screens in `capacitor.config.ts` or platform-specific files.

### Permissions

Add required permissions to platform-specific configuration files.

## Troubleshooting

### Common Issues

1. **Build errors**: Make sure all dependencies are installed
2. **Sync issues**: Run `npx cap sync` after making changes
3. **Icon issues**: Ensure icons are the correct size and format
4. **Permission issues**: Check platform-specific permission configurations

### Useful Commands

```bash
# Clean and rebuild
npm run build && npx cap sync

# Open native project
npx cap open ios
npx cap open android

# Check Capacitor version
npx cap --version
```

## Next Steps

1. Test your app on real devices
2. Configure push notifications (if needed)
3. Add native features using Capacitor plugins
4. Submit to app stores
5. Monitor app performance and user feedback

## Support

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic Documentation](https://ionicframework.com/docs)
- [React Native Web](https://necolas.github.io/react-native-web/)
