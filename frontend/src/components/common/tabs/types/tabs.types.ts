// src/components/common/tabs/types/tabs.types.ts
export type TabIcon = 'table' | 'plus' | 'upload' | 'cog' | string;

export interface Tab {
  id: string;
  label: string;
  icon?: TabIcon;
}

export interface TabsProps {
  /**
   * Array of tab items to display
   */
  tabs: Tab[];
  
  /**
   * ID of the currently active tab
   */
  activeTab: string;
  
  /**
   * Callback when a tab is clicked
   */
  onTabChange: (tabId: string) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}