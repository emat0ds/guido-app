import { Platform } from 'react-native';

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const colors = {
  bg: '#0f0f13',
  surface: '#13111f',
  surfaceAlt: '#141417',
  surfaceDone: '#141a14',
  border: '#1e1e28',

  purple: '#5b3fff',
  purpleLight: '#a89fff',
  purpleDim: '#1e1a3a',

  success: '#4caf50',
  successDim: '#141a14',
  successBorder: '#1e2e1e',
  error: '#e74c3c',
  errorDim: '#1a1414',
  errorBorder: '#2e1e1e',

  textPrimary: '#edeae4',
  textSecondary: '#ddd8d0',
  textMuted: '#888888',
  textDim: '#555555',
  textDisabled: '#333333',
};

export const typography = {
  h1: {
    fontSize: 26,
    fontWeight: '500' as const,
    color: colors.textPrimary,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textMuted,
  },
  label: {
    fontSize: 10,
    fontWeight: '500' as const,
    letterSpacing: 0.8,
    color: colors.textDim,
  },
  question: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textPrimary,
    lineHeight: 24,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  full: 999,
};

export const Colors = {
  light: {
    text: colors.textPrimary,
    background: '#ffffff',
    backgroundElement: colors.surface,
    backgroundSelected: colors.surfaceAlt,
    textSecondary: colors.textMuted,
  },
  dark: {
    text: colors.textPrimary,
    background: colors.bg,
    backgroundElement: colors.surface,
    backgroundSelected: colors.surfaceAlt,
    textSecondary: colors.textMuted,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
