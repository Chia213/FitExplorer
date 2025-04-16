import { Dimensions } from 'react-native';
import { isWeb, isTablet } from './platform';

// Get the current window dimensions
const { width, height } = Dimensions.get('window');

// Base width used for scaling calculations (standardized for designing)
export const baseWidth = 375; // Standard iPhone width
export const baseHeight = 812; // Standard iPhone height

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

// Scale dimensions based on device size compared to base size
export const scale = size => (width / guidelineBaseWidth) * size;
export const verticalScale = size => (height / guidelineBaseHeight) * size;
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Width percentage helper functions
export const wp = percentage => {
  const value = (percentage * width) / 100;
  return Math.round(value);
};

// Height percentage helper functions
export const hp = percentage => {
  const value = (percentage * height) / 100;
  return Math.round(value);
};

// Responsive width
export const responsiveWidth = (mobileSize, tabletSize) => {
  return isTablet() ? tabletSize || mobileSize * 1.5 : mobileSize;
};

// Responsive height
export const responsiveHeight = (mobileSize, tabletSize) => {
  return isTablet() ? tabletSize || mobileSize * 1.1 : mobileSize;
};

// Responsive font size
export const responsiveFontSize = (mobileSize, tabletSize) => {
  return isTablet() ? tabletSize || mobileSize * 1.2 : mobileSize;
};

// Responsive styles based on platform
export const getResponsiveStyles = (mobileStyles, tabletStyles = {}, webStyles = {}) => {
  if (isWeb && webStyles) {
    return { ...mobileStyles, ...webStyles };
  }
  
  if (isTablet()) {
    return { ...mobileStyles, ...tabletStyles };
  }
  
  return mobileStyles;
};

// Listen to dimension changes
export const addDimensionListener = (callback) => {
  return Dimensions.addEventListener('change', callback);
};

// Helper to remove dimension listeners
export const removeDimensionListener = (subscription) => {
  if (subscription?.remove) {
    subscription.remove();
  }
};

export default {
  width,
  height,
  scale,
  verticalScale,
  moderateScale,
  wp,
  hp,
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
  getResponsiveStyles,
  addDimensionListener,
  removeDimensionListener
}; 