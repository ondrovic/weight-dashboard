// frontend/src/components/common/Sidebar.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebarState } from '../../contexts/SidebarContext'


interface SidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileMenuOpen, 
  toggleMobileMenu 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isExpanded, toggleSidebar } = useSidebarState();

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, shortName: 'DB' },
    { name: 'Data Entry', href: '/data', icon: DataIcon, shortName: 'DE' },
    { name: 'Settings', href: '/settings', icon: SettingsIcon, shortName: 'SE' }
  ];

  // Auto-collapse sidebar after navigation on mobile or after clicking a link
  const handleNavigation = (href: string) => {
    if (window.innerWidth < 768 && isMobileMenuOpen) {
      toggleMobileMenu();
    }
    
    if (isExpanded) {
      // Use a slight delay to ensure navigation happens first
      setTimeout(() => toggleSidebar(), 100);
    }
    
    // Only navigate if we're not already on that page
    if (location.pathname !== href) {
      navigate(href);
    }
  };

  return (
    <>
      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-40 flex">
          {/* Mobile overlay */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />

          {/* Mobile sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Close sidebar</span>
                <XIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">Weight Tracker</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`group flex items-center w-full px-2 py-2 text-base font-medium rounded-md ${
                      location.pathname === item.href
                        ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 ${
                        location.pathname === item.href
                          ? 'text-indigo-600 dark:text-indigo-300'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </div>

      {/* Desktop sidebar - now collapsible */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 ${isExpanded ? 'md:w-64' : 'md:w-16'} transition-all duration-300`}>
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 justify-between">
              {isExpanded && (
                <h1 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 truncate">Weight Tracker</h1>
              )}
              <button 
                onClick={toggleSidebar}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {isExpanded ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
              </button>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white dark:bg-gray-800 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  } ${isExpanded ? 'justify-start' : 'justify-center'}`}
                  title={item.name}
                >
                  <item.icon
                    className={`flex-shrink-0 h-6 w-6 ${
                      location.pathname === item.href
                        ? 'text-indigo-600 dark:text-indigo-300'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                  {isExpanded ? (
                    <span className="ml-3">{item.name}</span>
                  ) : (
                    <span className="sr-only">{item.name}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

// Icons for the navigation items
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
      />
    </svg>
  );
}

function DataIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
      />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
      />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  );
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}