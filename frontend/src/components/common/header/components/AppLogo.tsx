// src/components/common/header/components/AppLogo.tsx
import React from 'react';

interface AppLogoProps {
    title: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ title }) => {
    return (
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
        </h1>
    );
};