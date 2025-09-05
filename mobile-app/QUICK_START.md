# FitExplorer Mobile App - Quick Start

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Setup Script
```bash
cd ../mobile-app
npm install
node setup.js
```

### 3. Open in IDE
```bash
# Android
cd ../frontend
npm run mobile:android

# iOS (macOS only)
npm run mobile:ios
```

## 📱 What You Get

- **Native mobile app** that wraps your React web app
- **App Store ready** for iOS and Android
- **Native features** like push notifications, camera access
- **Same backend** - no changes needed to your FastAPI server

## 🔧 How It Works

1. **WebView**: Your React app runs inside a native WebView
2. **API calls**: All your existing API calls work normally
3. **Native features**: Use Capacitor plugins for mobile-specific features
4. **App stores**: Build and deploy like any other native app

## 📁 Project Structure

```
mobile-app/
├── setup.js              # Main setup script
├── generate-icons.js      # Icon generation
├── test-setup.js         # Test setup
├── MOBILE_SETUP.md       # Detailed guide
└── resources/            # App icons and splash screens

frontend/
├── capacitor.config.ts   # Capacitor configuration
├── android/              # Android platform files
├── ios/                  # iOS platform files (macOS only)
└── dist/                 # Built web app
```

## 🎯 Next Steps

1. **Test locally**: Run on device/simulator
2. **Customize**: Add app icons, splash screens
3. **Deploy**: Submit to App Store and Google Play
4. **Monitor**: Track app performance and user feedback

## 🆘 Need Help?

- Check `MOBILE_SETUP.md` for detailed instructions
- Run `node test-setup.js` to verify setup
- See Capacitor docs: https://capacitorjs.com/docs
