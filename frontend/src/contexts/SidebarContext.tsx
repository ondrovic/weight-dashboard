// frontend/src/components/contexts/SidebarContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SidebarContextType = {
  isExpanded: boolean;
  toggleSidebar: () => void;
};

// Create context with default values
const SidebarContext = createContext<SidebarContextType>({
  isExpanded: false,
  toggleSidebar: () => {},
});

// Create a hook to use the sidebar context
export const useSidebarState = () => useContext(SidebarContext);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  // Initialize state - default to collapsed (false)
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    // Check localStorage for saved preference
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      return savedState === 'true';
    }
    
    // Default to collapsed
    return false;
  });

  // Toggle sidebar expanded state
  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', isExpanded.toString());
  }, [isExpanded]);

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};