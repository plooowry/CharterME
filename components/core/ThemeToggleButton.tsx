
import React from 'react';
import { useTheme } from './ThemeContext';
import Icon from './Icon';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      onClick={toggleTheme}
      className={`relative inline-flex items-center flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary
                  ${isDark ? 'bg-dark-theme-secondary' : 'bg-gray-300 dark:bg-gray-700'}`}
    >
      <span className="sr-only">Toggle theme setting</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-flex items-center justify-center h-5 w-5 rounded-full bg-white dark:bg-dark-theme-bg-surface shadow-lg transform ring-0 transition-transform ease-in-out duration-200
                    ${isDark ? 'translate-x-5' : 'translate-x-0'}`}
      >
        {isDark ? (
          <Icon name="moon" className="w-3 h-3 text-dark-theme-primary" />
        ) : (
          <span role="img" aria-label="sun emoji" className="text-sm leading-none">☀️</span>
        )}
      </span>
    </button>
  );
};

export default ThemeToggleButton;
