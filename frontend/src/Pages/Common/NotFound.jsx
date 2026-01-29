import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <FaExclamationTriangle className="mx-auto text-6xl text-warning mb-4" />
          <h1 className="text-4xl font-bold text-secondary mb-2 font-heading">404</h1>
          <h2 className="text-2xl font-semibold text-text-secondary mb-4 font-heading">Page Not Found</h2>
          <p className="text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/login">
            <Button
              className="inline-flex items-center space-x-2"
            >
              <FaHome />
              <span>Go to Login</span>
            </Button>
          </Link>

          <div className="text-sm text-text-secondary">
            <p>Or try one of these:</p>
            <div className="mt-2 space-x-4">
              <Link to="/login" className="text-primary hover:underline">
                Login Page
              </Link>
              <span>•</span>
              <button
                onClick={() => window.history.back()}
                className="text-primary hover:underline"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
