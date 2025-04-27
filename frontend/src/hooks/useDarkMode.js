import { useTheme } from '../context/ThemeProvider';

/**
 * Custom hook for dark mode styles
 * @param {Object} styles - Object with light and dark class names
 * @returns {string} - The appropriate class name based on current theme
 */
export function useDarkMode(styles) {
  const { isDark } = useTheme();
  
  return isDark ? styles.dark : styles.light;
}

/**
 * Helper function to create dark mode class objects
 * @param {string} lightClass - Class name for light mode
 * @param {string} darkClass - Class name for dark mode
 * @returns {Object} - Object with light and dark properties
 */
export function darkModeClass(lightClass, darkClass) {
  return {
    light: lightClass,
    dark: darkClass
  };
} 