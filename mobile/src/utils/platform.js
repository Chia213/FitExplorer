import { Platform, Dimensions } from 'react-native';

/**
 * Utility functions for platform detection
 */

// Get the current window dimensions
const { width, height } = Dimensions.get('window');

// Platform detection helpers
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// Detect if device is a tablet based on screen size
export const isTablet = () => {
  // Use width/height ratio and minimal width as criteria
  const aspectRatio = height / width;
  return (
    // Standard tablets typically have width > 600 and aspect ratio less than 1.6
    width >= 600 && aspectRatio < 1.6
  );
};

// Detect if device is a phone
export const isPhone = () => !isTablet();

// Check if the device is in landscape mode
export const isLandscape = () => width > height;

// Check if the device is in portrait mode
export const isPortrait = () => height >= width;

// Check if the platform version is at least a given version (iOS/Android)
export const isPlatformVersionAtLeast = (version) => {
  const currentVersion = parseInt(Platform.Version, 10);
  return currentVersion >= version;
};

// Check if the device has notch (simplified approximation)
export const hasNotch = () => {
  if (isIOS) {
    // iOS devices with notch typically have higher aspect ratios (X, XS, 11, etc.)
    const aspectRatio = height / width;
    return isPhone() && aspectRatio > 2;
  }
  return false; // More complex for Android, would need device-specific detection
};

/**
 * Returns styles based on the current platform
 * @param {Object} styles - Object containing platform-specific styles
 * @returns {Object} - The styles for the current platform
 */
export const platformSpecificStyles = (styles) => {
  if (isWeb && styles.web) {
    return styles.web;
  } else if (isIOS && styles.ios) {
    return styles.ios;
  } else if (isAndroid && styles.android) {
    return styles.android;
  } else if (styles.native && (isIOS || isAndroid)) {
    return styles.native;
  }
  return styles.default || {};
};

/**
 * Detect if the app is running in a PWA context
 */
export const isPWA = () => {
  if (!isWeb) return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

export default {
  isIOS,
  isAndroid,
  isWeb,
  isTablet,
  isPhone,
  isLandscape,
  isPortrait,
  isPlatformVersionAtLeast,
  hasNotch,
  platformSpecificStyles,
  isPWA
}; 