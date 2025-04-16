import { Dimensions, StyleSheet } from 'react-native';
import { isTablet, isLandscape, isPWA, isWeb } from './platform';
import { SPACING, COLORS } from './theme';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default container padding
export const DEFAULT_PADDING = SPACING.medium;

// Safe area inset values (can be updated from a component if using a library like react-native-safe-area-context)
export const SAFE_AREA = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  
  // Method to update safe area values
  update: (insets) => {
    SAFE_AREA.top = insets.top;
    SAFE_AREA.right = insets.right;
    SAFE_AREA.bottom = insets.bottom;
    SAFE_AREA.left = insets.left;
  }
};

// Layout configurations for different form factors
export const LAYOUT_CONFIG = {
  mobile: {
    maxWidth: 480,
    sideMargin: SPACING.medium,
    columnCount: 1
  },
  tablet: {
    maxWidth: 768,
    sideMargin: SPACING.large,
    columnCount: 2
  },
  desktop: {
    maxWidth: 1200,
    sideMargin: SPACING.xl,
    columnCount: 3
  },
};

// Get current layout config based on screen size
export const getLayoutConfig = () => {
  if (isTablet()) {
    if (SCREEN_WIDTH > 1000) {
      return LAYOUT_CONFIG.desktop;
    }
    return LAYOUT_CONFIG.tablet;
  }
  return LAYOUT_CONFIG.mobile;
};

// Calculate column width based on container width and column count
export const calculateColumnWidth = (containerWidth, columnCount = 1, gap = SPACING.medium) => {
  const totalGapWidth = gap * (columnCount - 1);
  return (containerWidth - totalGapWidth) / columnCount;
};

// Get padding for a container based on device type
export const getContainerPadding = () => {
  const config = getLayoutConfig();
  return {
    paddingHorizontal: config.sideMargin,
    paddingTop: SAFE_AREA.top || SPACING.medium,
    paddingBottom: SAFE_AREA.bottom || SPACING.medium
  };
};

// Create responsive container styles for screens
export const containerStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: SAFE_AREA.top,
    paddingBottom: SAFE_AREA.bottom,
  },
  scroll: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: DEFAULT_PADDING,
  },
  maxWidth: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: getLayoutConfig().maxWidth,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keyboardAvoidingView: {
    flex: 1,
  }
});

// Create media query-like function for responsive styles
export const createResponsiveStyles = (options) => {
  const { mobile, tablet, desktop } = options;
  
  if (isWeb) {
    // For web, could use actual media queries via a library like react-native-web-hooks
    if (SCREEN_WIDTH > 1024) {
      return desktop || tablet || mobile;
    } else if (SCREEN_WIDTH > 768) {
      return tablet || mobile;
    }
  } else if (isTablet()) {
    return tablet || desktop || mobile;
  }
  
  // Default to mobile
  return mobile;
};

// Get status bar height (approximate for cross-platform)
export const getStatusBarHeight = () => {
  if (isWeb) return 0;
  return SAFE_AREA.top || (isPWA() ? 0 : 20);
};

// Helper for bottom tab bar height (with safe area considerations)
export const getBottomTabBarHeight = () => {
  const hasHomeIndicator = SAFE_AREA.bottom > 20;
  return 56 + (hasHomeIndicator ? SAFE_AREA.bottom : 0);
};

// Helper to create grid layout
export const createGridLayout = (itemCount, columnCount = 2, itemHeight = 180) => {
  const rowCount = Math.ceil(itemCount / columnCount);
  return {
    columnCount,
    rowCount,
    layout: Array.from({ length: itemCount }).map((_, index) => {
      const row = Math.floor(index / columnCount);
      const col = index % columnCount;
      return {
        width: `${100 / columnCount}%`,
        height: itemHeight,
        x: col * (100 / columnCount),
        y: row * itemHeight
      };
    })
  };
};

export default {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  DEFAULT_PADDING,
  SAFE_AREA,
  LAYOUT_CONFIG,
  getLayoutConfig,
  calculateColumnWidth,
  getContainerPadding,
  containerStyles,
  createResponsiveStyles,
  getStatusBarHeight,
  getBottomTabBarHeight,
  createGridLayout,
  isLandscape: isLandscape
}; 