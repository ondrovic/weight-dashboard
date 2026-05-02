import { useMetrics } from './Metrics';

type DarkModeHook = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export const useDarkMode = (): DarkModeHook => {
  const { darkMode, toggleDarkMode } = useMetrics();
  return { darkMode, toggleDarkMode };
};
