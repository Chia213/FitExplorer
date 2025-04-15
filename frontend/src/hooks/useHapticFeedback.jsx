import { useCallback } from 'react';

/**
 * Haptic feedback patterns for different interaction types
 */
const HAPTIC_PATTERNS = {
  light: 10, // 10ms vibration
  medium: 20, // 20ms vibration
  heavy: 30, // 30ms vibration
  success: [10, 60, 20], // Pattern for success
  warning: [10, 30, 10, 30, 10], // Pattern for warning
  error: [40, 30, 40, 30, 40], // Pattern for error
  selection: 8, // Light feedback for selection
};

/**
 * Custom hook for haptic feedback
 * @returns {Object} Object containing haptic feedback functions
 */
const useHapticFeedback = () => {
  /**
   * Check if haptic feedback is supported on the device
   * @returns {boolean} Whether haptic feedback is supported
   */
  const isHapticSupported = useCallback(() => {
    return !!navigator.vibrate;
  }, []);

  /**
   * Trigger haptic feedback
   * @param {string|number|number[]} patternOrDuration - Haptic pattern or duration
   * @returns {boolean} Whether the haptic feedback was triggered
   */
  const triggerHaptic = useCallback((patternOrDuration = 'light') => {
    if (!isHapticSupported()) return false;

    const pattern = typeof patternOrDuration === 'string' 
      ? HAPTIC_PATTERNS[patternOrDuration] || HAPTIC_PATTERNS.light
      : patternOrDuration;

    return navigator.vibrate(pattern);
  }, [isHapticSupported]);

  /**
   * Haptic feedback for button press
   */
  const buttonPress = useCallback(() => {
    return triggerHaptic('light');
  }, [triggerHaptic]);

  /**
   * Haptic feedback for success events
   */
  const success = useCallback(() => {
    return triggerHaptic('success');
  }, [triggerHaptic]);

  /**
   * Haptic feedback for error events
   */
  const error = useCallback(() => {
    return triggerHaptic('error');
  }, [triggerHaptic]);

  /**
   * Haptic feedback for warning events
   */
  const warning = useCallback(() => {
    return triggerHaptic('warning');
  }, [triggerHaptic]);

  /**
   * Haptic feedback for selection
   */
  const selection = useCallback(() => {
    return triggerHaptic('selection');
  }, [triggerHaptic]);

  /**
   * Haptic feedback for custom durations
   * @param {number|number[]} pattern - Vibration pattern or duration in ms
   */
  const custom = useCallback((pattern) => {
    return triggerHaptic(pattern);
  }, [triggerHaptic]);

  /**
   * Prepares a button with haptic feedback
   * @param {function} onClick - Original onClick function
   * @param {string} feedbackType - Type of feedback (light, medium, heavy, success, warning, error)
   * @returns {function} Enhanced onClick handler with haptic feedback
   */
  const withHaptics = useCallback((onClick, feedbackType = 'light') => {
    return (...args) => {
      triggerHaptic(feedbackType);
      if (onClick) {
        return onClick(...args);
      }
    };
  }, [triggerHaptic]);

  return {
    isHapticSupported,
    triggerHaptic,
    buttonPress,
    success,
    error,
    warning,
    selection,
    custom,
    withHaptics,
  };
};

export default useHapticFeedback; 