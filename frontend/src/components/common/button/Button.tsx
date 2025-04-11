import React from 'react';
import { 
  BaseButtonProps, 
  iconSizes, 
  iconStyles
} from './types/button.types';

export const Button: React.FC<BaseButtonProps> = ({
  size = 'medium',
  variant,
  className = '',
  disabled,
  disableActiveColor = false,
  children,
  ...props
}) => {
  const renderIcon = () => {
    if (!variant) return null;

    const iconStyle = iconStyles[variant];
    
    return (
      <svg
        className={`${iconSizes[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconStyle.path}
        />
      </svg>
    );
  };

  const variantClasses = {
    edit: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300',
    delete: 'text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
  };

  const activeColorClasses = disableActiveColor 
    ? 'active:opacity-100' 
    : variant 
      ? `active:${variantClasses[variant].replace('hover:', 'active:')}` 
      : '';

  const combinedClassName = `
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    rounded-md 
    ${variant ? variantClasses[variant] : ''}
    ${activeColorClasses}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  const sizeClasses = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3'
  };

  return (
    <button 
      className={`${combinedClassName} ${sizeClasses[size]}`}
      disabled={disabled}
      {...props}
    >
      {renderIcon()}
      {children && <span className="sr-only">{children}</span>}
    </button>
  );
};