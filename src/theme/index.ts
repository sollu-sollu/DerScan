import { useSettingsStore } from '../store/settingsStore';

export const lightColors = {
  primary: '#1F4E5A',
  primaryLight: '#2A6B7A',
  primaryDark: '#163A44',
  secondary: '#4ECDC4',
  accent: '#FF6B6B',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  background: '#F8FAFB',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  cardBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors: typeof lightColors = {
  primary: '#4ECDC4',
  primaryLight: '#6EFDEE',
  primaryDark: '#1F4E5A',
  secondary: '#1F4E5A',
  accent: '#FF6B6B',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  background: '#121212',
  surface: '#1E1E1E',
  white: '#FFFFFF',
  black: '#000000',
  text: '#F8FAFB',
  textSecondary: '#9CA3AF',
  textLight: '#6B7280',
  border: '#333333',
  cardBackground: '#1E1E1E',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const useTheme = () => {
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const colors = isDarkMode ? darkColors : lightColors;

  return {
    ...theme,
    colors,
    isDarkMode,
  };
};

export type ThemeColors = typeof lightColors;
export type Theme = typeof theme & { colors: ThemeColors; isDarkMode: boolean };
