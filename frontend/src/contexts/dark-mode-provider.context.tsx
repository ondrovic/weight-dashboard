// frontend/src/contexts/DarkModeProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMetrics } from './metrics.context';

type DarkModeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

// Create context with default values
const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => { },
});

// Create a hook to use the dark mode context
export const useDarkMode = () => useContext(DarkModeContext);

interface DarkModeProviderProps {
  children: ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  // Get the darkMode state and setDarkMode function from MetricsContext
  const { darkMode: contextDarkMode, setDarkMode: setContextDarkMode } = useMetrics();

  // Local state for immediate UI updates
  const [localDarkMode, setLocalDarkMode] = useState<boolean>(() => {
    // Start with the context value if available
    if (contextDarkMode !== undefined) {
      return contextDarkMode;
    }

    // Otherwise check localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }

    // Finally check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync local state with context when context changes
  useEffect(() => {
    if (contextDarkMode !== undefined) {
      setLocalDarkMode(contextDarkMode);
    }
  }, [contextDarkMode]);

  // Toggle dark mode - updates both local state and context
  const toggleDarkMode = () => {
    const newDarkMode = !localDarkMode;
    setLocalDarkMode(newDarkMode);

    // Update context (which will save to database via settingsApi)
    setContextDarkMode(newDarkMode);

    // Also update localStorage for faster loading on next visit
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Update document class when dark mode changes
  useEffect(() => {
    if (localDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [localDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference in localStorage
      if (localStorage.getItem('darkMode') === null) {
        setLocalDarkMode(e.matches);
        setContextDarkMode(e.matches);
      }
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [setContextDarkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode: localDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};