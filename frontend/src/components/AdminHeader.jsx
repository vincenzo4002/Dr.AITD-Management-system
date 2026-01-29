import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import Cookies from 'js-cookie';
import useAutoLogout from '../hooks/useAutoLogout';

const AdminHeader = ({ currentRole = 'admin' }) => {
  const navigate = useNavigate();
  const logout = useAutoLogout(120000); // 2 minutes

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-night-blue shadow-lg border-b border-night-blue-shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="text-2xl font-bold text-sand-tan hover:text-white transition-colors font-oswald tracking-wide">
              Dr AITD
            </Link>
            <span className="text-sm text-gray-300 bg-night-blue-shadow px-2 py-1 rounded">Admin Panel</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/admin/dashboard" className="text-gray-300 hover:text-sand-tan font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/admin/students" className="text-gray-300 hover:text-sand-tan font-medium transition-colors">
              Students
            </Link>
            <Link to="/admin/create-teacher" className="text-gray-300 hover:text-sand-tan font-medium transition-colors">
              Teachers
            </Link>
            <Link to="/admin/courses" className="text-gray-300 hover:text-sand-tan font-medium transition-colors">
              Courses
            </Link>
            <Link to="/admin/add-subject" className="text-gray-300 hover:text-sand-tan font-medium transition-colors">
              Subjects
            </Link>
            <Link to="/admin/reports" className="text-gray-300 hover:text-sand-tan font-medium transition-colors">
              Reports
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sand-tan">
              <FaUserShield />
              <span className="text-sm font-medium">Gulshankartikk</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-4 py-2 bg-sand-tan text-night-blue-shadow font-bold rounded-lg hover:bg-sand-tan-shadow transition-colors shadow-md"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
