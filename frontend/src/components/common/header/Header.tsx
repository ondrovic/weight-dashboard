// src/components/common/header/Header.tsx
import React from 'react';
import { HeaderProps } from './types/header.types';
import { AppLogo } from './components/AppLogo';

export const Header: React.FC<HeaderProps> = ({
  title = 'Body Stats Dashboard',
  logoUrl,
  leftContent,
  rightContent,
  className = '',
}) => {
  return (
    <header className={`bg-white dark:bg-gray-800 shadow ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Left side content */}
            {leftContent}
            
            {/* App logo/title */}
            <div className="flex-shrink-0 flex items-center ml-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${title} logo`} 
                  className="h-8 w-auto" 
                />
              ) : (
                <AppLogo title={title} />
              )}
            </div>
          </div>
          
          {/* Right side content */}
          {rightContent && (
            <div className="flex items-center">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};