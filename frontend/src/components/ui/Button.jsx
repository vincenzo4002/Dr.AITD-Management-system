import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-lg shadow-primary/25 hover:shadow-primary/30 border border-transparent",
    secondary: "bg-white text-secondary border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200 shadow-sm",
    danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger shadow-lg shadow-danger/25 border border-transparent",
    ghost: "text-text-secondary hover:bg-gray-100 hover:text-secondary bg-transparent border border-transparent",
    link: "text-primary hover:underline p-0 h-auto shadow-none bg-transparent border-none ring-0 focus:ring-0"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
      )}
      {children}
    </button>
  );
};

export default Button;