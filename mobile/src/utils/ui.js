import { Platform, Vibration, Animated, Easing } from 'react-native';
import { isIOS, isAndroid, isWeb } from './platform';
import { COLORS } from './theme';

// Haptic feedback utilities
export const haptics = {
  // Light impact haptic feedback
  light: () => {
    if (isWeb) {
      // Web API for vibration (if supported)
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } else if (isIOS || isAndroid) {
      // Use React Native's Vibration API
      Vibration.vibrate(10);
    }
  },
  
  // Medium impact haptic feedback
  medium: () => {
    if (isWeb) {
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    } else if (isIOS || isAndroid) {
      Vibration.vibrate(20);
    }
  },
  
  // Heavy impact haptic feedback
  heavy: () => {
    if (isWeb) {
      if (navigator.vibrate) {
        navigator.vibrate([30, 10, 30]);
      }
    } else if (isIOS || isAndroid) {
      Vibration.vibrate([0, 30, 10, 30]);
    }
  },
  
  // Success pattern
  success: () => {
    if (isWeb) {
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 30]);
      }
    } else if (isIOS || isAndroid) {
      Vibration.vibrate([0, 10, 50, 30]);
    }
  },
  
  // Error pattern
  error: () => {
    if (isWeb) {
      if (navigator.vibrate) {
        navigator.vibrate([30, 20, 40, 20, 30]);
      }
    } else if (isIOS || isAndroid) {
      Vibration.vibrate([0, 30, 20, 40, 20, 30]);
    }
  },
  
  // Selection change
  selection: () => {
    if (isWeb) {
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }
    } else if (isIOS || isAndroid) {
      Vibration.vibrate(5);
    }
  }
};

// Animation presets
export const animations = {
  // Fade in animation
  fadeIn: (value, duration = 300) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      easing: Easing.ease,
      useNativeDriver: true
    });
  },
  
  // Fade out animation
  fadeOut: (value, duration = 300) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.ease,
      useNativeDriver: true
    });
  },
  
  // Slide up animation
  slideUp: (value, fromValue = 100, toValue = 0, duration = 300) => {
    value.setValue(fromValue);
    return Animated.timing(value, {
      toValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    });
  },
  
  // Slide down animation
  slideDown: (value, fromValue = 0, toValue = 100, duration = 300) => {
    value.setValue(fromValue);
    return Animated.timing(value, {
      toValue,
      duration,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true
    });
  },
  
  // Scale animation (for buttons, etc.)
  scale: (value, fromValue = 1, toValue = 0.95, duration = 100) => {
    value.setValue(fromValue);
    return Animated.timing(value, {
      toValue,
      duration,
      easing: Easing.ease,
      useNativeDriver: true
    });
  },
  
  // Bounce animation
  bounce: (value, fromValue = 0, duration = 800) => {
    value.setValue(fromValue);
    return Animated.spring(value, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true
    });
  },
  
  // Pulse animation
  pulse: (value) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]);
  }
};

// Toast notification helper
export const toast = {
  // Configuration for toast messages
  config: {
    duration: 3000, // Default duration in ms
    position: 'bottom', // 'top', 'bottom', 'center'
    backgroundColor: COLORS.black,
    textColor: COLORS.white,
    successColor: COLORS.success,
    errorColor: COLORS.error,
    warningColor: COLORS.warning,
    infoColor: COLORS.info,
    opacity: 0.9,
    borderRadius: 8,
    fontSize: 16,
    padding: 16,
    margin: 16,
    // Function to be implemented by the app to show toast
    showToast: null
  },
  
  // Initialize toast function (to be called by app)
  init: (showToastFn) => {
    toast.config.showToast = showToastFn;
  },
  
  // Show a success toast
  success: (message, options = {}) => {
    if (!toast.config.showToast) return;
    toast.config.showToast({
      message,
      type: 'success',
      backgroundColor: toast.config.successColor,
      ...toast.config,
      ...options
    });
    // Trigger success haptic feedback
    haptics.success();
  },
  
  // Show an error toast
  error: (message, options = {}) => {
    if (!toast.config.showToast) return;
    toast.config.showToast({
      message,
      type: 'error',
      backgroundColor: toast.config.errorColor,
      ...toast.config,
      ...options
    });
    // Trigger error haptic feedback
    haptics.error();
  },
  
  // Show an info toast
  info: (message, options = {}) => {
    if (!toast.config.showToast) return;
    toast.config.showToast({
      message,
      type: 'info',
      backgroundColor: toast.config.infoColor,
      ...toast.config,
      ...options
    });
    // Trigger light haptic feedback
    haptics.light();
  },
  
  // Show a warning toast
  warning: (message, options = {}) => {
    if (!toast.config.showToast) return;
    toast.config.showToast({
      message,
      type: 'warning',
      backgroundColor: toast.config.warningColor,
      ...toast.config,
      ...options
    });
    // Trigger medium haptic feedback
    haptics.medium();
  }
};

export default {
  haptics,
  animations,
  toast
}; 