import { useTheme } from '../context/ThemeProvider';
import { useDarkMode, darkModeClass } from '../hooks/useDarkMode';

export default function DarkModeExample() {
  const { isDark, toggleTheme } = useTheme();
  
  // Example of using the custom hook
  const cardClass = useDarkMode(
    darkModeClass(
      'bg-white text-gray-900 shadow-md',
      'bg-gray-800 text-gray-100 shadow-lg'
    )
  );
  
  return (
    <div className="p-6 max-w-md mx-auto">
      <div className={`rounded-lg p-6 ${cardClass}`}>
        <h2 className="text-2xl font-bold mb-4">Dark Mode Example</h2>
        <p className="mb-4">
          This component demonstrates how to use dark mode in any component.
          The current theme is: <span className="font-bold">{isDark ? 'Dark' : 'Light'}</span>
        </p>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
} 