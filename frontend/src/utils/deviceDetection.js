/**
 * Utility functions for device detection and PWA status
 */

/**
 * Checks if the app is running in standalone PWA mode
 * @returns {boolean} True if running as PWA
 */
export const isPwaMode = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator.standalone === true);
};

/**
 * Checks if the current device is a mobile device
 * @returns {boolean} True if on a mobile device
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth < 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Gets bottom spacing needed for mobile PWA mode
 * @returns {string} CSS value for margin/padding bottom
 */
export const getBottomNavSpacing = () => {
  return isPwaMode() ? '5rem' : '0';
}; 