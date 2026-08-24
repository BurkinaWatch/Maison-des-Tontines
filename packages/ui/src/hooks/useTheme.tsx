import { useColorScheme } from "react-native";
import { glassColors } from "../theme/colors";

export interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof glassColors;
}

export const useTheme = (): ThemeContextValue => {
  const scheme = useColorScheme();
  return {
    isDark: scheme !== "light",
    toggleTheme: () => undefined,
    colors: glassColors,
  };
};