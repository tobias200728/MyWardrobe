/**
 * MyWardrobe App Theme
 * Pink/Magenta color palette for the wardrobe outfit manager.
 */

export const Colors = {
  // Primary brand colors
  primary: '#FF0066',        // Hot pink - main accent
  primaryDark: '#CC0052',    // Darker pink for pressed states
  primaryLight: '#FF3385',   // Lighter pink
  
  // Gradient colors (header, FAB, buttons)
  gradientStart: '#FF0066',  // Hot pink
  gradientEnd: '#FF6699',    // Soft pink
  
  // Background
  backgroundGradientStart: '#FFE6F0', // Very light pink top
  backgroundGradientEnd: '#FFF0F5',   // Lavender blush bottom
  backgroundCard: '#FFFFFF',          // White cards
  backgroundModal: '#FFFFFF',         // White modal body
  
  // Modal header gradient  
  modalHeaderStart: '#FF0066',
  modalHeaderEnd: '#FF6699',
  
  // Text
  textPrimary: '#1A1A2E',     // Dark navy/black for titles
  textSecondary: '#666666',   // Gray for descriptions
  textOnPrimary: '#FFFFFF',   // White text on pink backgrounds
  textAccent: '#FF0066',      // Pink text for labels
  
  // Filter chips
  chipBackground: '#FFFFFF',
  chipBorder: '#FFB3D1',      // Light pink border
  chipText: '#FF0066',
  chipSelectedBackground: '#FF0066',
  chipSelectedText: '#FFFFFF',
  
  // Input fields
  inputBackground: '#FFF5F9',
  inputBorder: '#FFD6E8',
  inputPlaceholder: '#CC99AA',
  
  // Empty state
  emptyIconBackground: '#FFD6E8',
  emptyIconColor: '#FF0066',
  
  // Buttons
  buttonPrimaryBackground: '#FF0066',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBackground: '#FFFFFF',
  buttonSecondaryText: '#FF0066',
  buttonSecondaryBorder: '#FF0066',
  
  // FAB
  fabBackground: '#FF0066',
  fabIcon: '#FFFFFF',
  
  // Heart icon
  heartColor: '#FF0066',
  
  // Overlay
  overlayBackground: 'rgba(0, 0, 0, 0.5)',
  
  // Shadows
  shadowColor: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 28,
  title: 32,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
