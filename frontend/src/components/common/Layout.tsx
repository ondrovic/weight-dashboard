import React, { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useSidebarState } from '../../contexts/SidebarContext'; // Adjusted import path
import { MenuIcon } from './Icons';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isExpanded } = useSidebarState();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      
      {/* Main content wrapper - adjusted padding and width based on sidebar state */}
      <div className={`flex flex-col transition-all duration-300 ${isExpanded ? 'md:pl-64' : 'md:pl-16'}`}>
        {/* Mobile header with menu button */}
        <div className="md:hidden sticky top-0 z-10 flex items-center bg-white dark:bg-gray-800 px-4 py-3 shadow">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-indigo-600 dark:text-indigo-400">Weight Tracker</h1>
        </div>

        {/* Main content - reduced padding and increased max-width */}
        <main className="flex-1">
          <div className="max-w-full mx-auto py-4 px-3 md:px-4 lg:px-6">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};