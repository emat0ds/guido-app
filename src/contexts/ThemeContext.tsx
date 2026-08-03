import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as darkColors, type AppColors } from '@/constants/theme';

const THEME_KEY = 'app_theme';

export const lightColors: AppColors = {
  bg: '#f2f2f7',
  surface: '#ffffff',
  surfaceAlt: '#f7f7fb',
  surfaceDone: '#f0f9f0',
  border: '#e0e0ea',
  purple: '#5b3fff',
  purpleLight: '#4428cc',
  purpleDim: '#ede9ff',
  success: '#2e7d32',
  successDim: '#f0fff4',
  successBorder: '#c6f6d5',
  error: '#c62828',
  errorDim: '#fff5f5',
  errorBorder: '#fed7d7',
  textPrimary: '#111111',
  textSecondary: '#222233',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  textDisabled: '#d1d5db',
};

interface ThemeContextValue {
  isDark: boolean;
  colors: AppColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'light') setIsDark(false);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }),
    [isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
