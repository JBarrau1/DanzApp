// Theme Configuration
// Central theme export with colors, typography, spacing, and shadows

import { lightColors, darkColors } from './colors';

// Typography
export const typography = {
  fontSizeSmall: 12,
  fontSizeRegular: 14,
  fontSizeMedium: 16,
  fontSizeLarge: 18,
  fontSizeXLarge: 24,
  fontSizeXXLarge: 32,
  
  fontWeightLight: '300',
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightBold: '700',
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

// Shadows (iOS style)
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Get theme based on color scheme
export const getTheme = (isDark) => ({
  colors: isDark ? darkColors : lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  isDark,
});

// Export colors for direct access
export { lightColors, darkColors };
