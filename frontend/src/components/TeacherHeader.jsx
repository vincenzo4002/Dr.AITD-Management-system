import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import Cookies from 'js-cookie';
import useAutoLogout from '../hooks/useAutoLogout';

const TeacherHeader = ({ currentRole = 'teacher' }) => {
  const navigate = useNavigate();
  const logout = useAutoLogout(120000); // 2 minutes
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="shadow-lg px-6 py-4" style={{ background: 'linear-gradient(90deg, #2d545e 0%, #12343b 100%)', borderBottom: '3px solid #e1b382' }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold" style={{ color: '#e1b382' }}>Teacher Portal</h1>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-white rounded-lg transition-all transform hover:scale-105"
          style={{ backgroundColor: '#c89666' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#e1b382'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#c89666'}
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default TeacherHeader;
