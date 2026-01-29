import React from 'react';

const Input = React.forwardRef(({ label, error, className = '', icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-text-muted" />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-2 rounded-lg border border-gray-200 bg-white text-secondary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-text-muted transition-all duration-200 ${error ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;