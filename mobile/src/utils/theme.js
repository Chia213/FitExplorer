// Application theme constants
export const COLORS = {
  // Primary brand colors
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#C8E6C9',
  
  // Secondary colors
  accent: '#FF5722',
  
  // UI colors
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  
  // Text colors
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#9E9E9E',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Common colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Fitness specific colors
  nutrition: {
    protein: '#4CAF50',  // Green
    carbs: '#2196F3',    // Blue
    fat: '#FFC107',      // Yellow/Amber
    calories: '#FF5722', // Orange
  }
};

export const TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    small: 12,
    medium: 14,
    large: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900',
  },
  fontFamily: {
    // Add your custom fonts here
    regular: 'System',
    medium: 'System',
    bold: 'System',
  }
};

export const SPACING = {
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 16,
  round: 1000, // For circular shapes
};

// Common style mixins
export const commonStyles = {
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  flex1: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.medium,
    ...SHADOWS.small,
  },
  textInput: {
    height: 50,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.small,
    paddingHorizontal: SPACING.medium,
    fontSize: TYPOGRAPHY.fontSize.medium,
  }
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
  commonStyles
}; 