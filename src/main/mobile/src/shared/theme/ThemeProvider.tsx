import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import {
  ThemeColors,
  ThemeMode,
  lightThemeColors,
  darkThemeColors,
  typography,
} from "./AppTheme";

const THEME_STORAGE_KEY = "@whatschat_theme_mode";

interface ThemeContextType {
  colors: ThemeColors;
  typography: typeof typography;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (
        saved &&
        (saved === "light" || saved === "dark" || saved === "system")
      ) {
        setThemeModeState(saved as ThemeMode);
      }
    });
  }, []);

  useEffect(() => {
    if (themeMode === "system") setIsDark(systemColorScheme === "dark");
    else setIsDark(themeMode === "dark");
  }, [themeMode, systemColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    setThemeModeState(mode);
  };

  const colors = isDark ? darkThemeColors : lightThemeColors;
  const value: ThemeContextType = {
    colors,
    typography,
    themeMode,
    isDark,
    setThemeMode,
  };
  const emotionTheme = { colors, typography, isDark };

  return (
    <ThemeContext.Provider value={value}>
      <EmotionThemeProvider theme={emotionTheme}>
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
};

const defaultThemeValue: ThemeContextType = {
  colors: lightThemeColors,
  typography,
  themeMode: "system",
  isDark: false,
  setThemeMode: async () => {},
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  return context ?? defaultThemeValue;
};
