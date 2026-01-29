import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({
  title,
  subtitle,
  user,
  onLogout,
  actions = [],
  className = '',
  bgColor = 'bg-white'
}) => {
  return (
    <header className={`${bgColor} shadow-md border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary">{title}</h1>
              {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Actions */}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${action.variant === 'primary'
                  ? 'bg-primary text-white hover:bg-primary/80'
                  : 'bg-background text-secondary hover:bg-gray-100'
                  }`}
              >
                {action.icon && <action.icon />}
                <span>{action.label}</span>
              </button>
            ))}

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary">{user.name}</p>
                  <p className="text-xs text-text-secondary">{user.role}</p>
                </div>
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
              </div>
            )}

            {/* Logout */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;