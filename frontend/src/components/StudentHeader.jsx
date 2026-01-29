import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaGraduationCap } from 'react-icons/fa';
import Cookies from 'js-cookie';
import useAutoLogout from '../hooks/useAutoLogout';

const StudentHeader = ({ studentId, studentName }) => {
  const navigate = useNavigate();
  const logout = useAutoLogout(120000); // 2 minutes

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="shadow-lg" style={{ background: 'linear-gradient(90deg, #2d545e 0%, #12343b 100%)', borderBottom: '3px solid #e1b382' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link to={`/student/${studentId}/dashboard`} className="text-2xl font-bold" style={{ color: '#e1b382' }}>
              College Management System
            </Link>
            <span className="text-sm font-semibold" style={{ color: '#c89666' }}>Student Portal</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to={`/student/${studentId}/dashboard`} className="font-semibold transition-colors" style={{ color: 'white' }} onMouseEnter={(e) => e.target.style.color = '#e1b382'} onMouseLeave={(e) => e.target.style.color = 'white'}>
              Dashboard
            </Link>
            <Link to={`/student/${studentId}/profile`} className="font-semibold transition-colors" style={{ color: 'white' }} onMouseEnter={(e) => e.target.style.color = '#e1b382'} onMouseLeave={(e) => e.target.style.color = 'white'}>
              Profile
            </Link>
            <Link to={`/student/${studentId}/notes`} className="font-semibold transition-colors" style={{ color: 'white' }} onMouseEnter={(e) => e.target.style.color = '#e1b382'} onMouseLeave={(e) => e.target.style.color = 'white'}>
              Notes
            </Link>
            <Link to={`/student/${studentId}/materials`} className="font-semibold transition-colors" style={{ color: 'white' }} onMouseEnter={(e) => e.target.style.color = '#e1b382'} onMouseLeave={(e) => e.target.style.color = 'white'}>
              Materials
            </Link>
            <Link to={`/student/${studentId}/assignments`} className="font-semibold transition-colors" style={{ color: 'white' }} onMouseEnter={(e) => e.target.style.color = '#e1b382'} onMouseLeave={(e) => e.target.style.color = 'white'}>
              Assignments
            </Link>
            <Link to={`/student/${studentId}/attendance`} className="font-semibold transition-colors" style={{ color: 'white' }} onMouseEnter={(e) => e.target.style.color = '#e1b382'} onMouseLeave={(e) => e.target.style.color = 'white'}>
              Attendance
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaGraduationCap style={{ color: '#e1b382' }} />
              <span className="text-sm font-medium" style={{ color: 'white' }}>{studentName || 'Student'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-4 py-2 text-white rounded-lg transition-all transform hover:scale-105"
              style={{ backgroundColor: '#c89666' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e1b382'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#c89666'}
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

export default StudentHeader;
