import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Unauthorized = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const token = Cookies.get('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUser(decoded);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return `/teacher/${user.id}/dashboard`;
      case 'student':
        return `/student/${user.id}/dashboard`;
      default:
        return '/login';
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden">
        <div className="bg-danger/10 p-8 flex justify-center">
          <div className="bg-white p-4 rounded-full shadow-sm">
            <ShieldAlert className="w-16 h-16 text-danger" />
          </div>
        </div>

        <div className="p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold text-secondary font-heading">
            Access Denied
          </h1>
          <p className="text-text-secondary text-lg">
            Oops! You don't have permission to view this page.
          </p>
          <p className="text-sm text-text-muted">
            It looks like you stumbled upon a restricted area. Let's get you back to safety.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => navigate(getDashboardLink())}
              className="w-full flex items-center justify-center gap-2 py-6 text-lg"
              variant="primary"
            >
              <Home size={20} />
              Return to Dashboard
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate(-1)}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <ArrowLeft size={18} />
                Go Back
              </Button>
              <Button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-danger border-danger hover:bg-danger/5"
                variant="outline"
              >
                <LogOut size={18} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;
