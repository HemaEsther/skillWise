import { useTheme } from '../../context/ThemeProvider';

export default function BaseLayout({ children }) {
  const { isDark } = useTheme();

  return (
    <div 
      className={`min-h-screen transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-900 text-gray-100' 
          : 'bg-white text-gray-900'
      }`}
      data-theme={isDark ? 'dark' : 'light'}
    >
      {children}
    </div>
  );
} 