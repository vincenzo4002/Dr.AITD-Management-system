import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = ({ className = '', targetRoute }) => {
  const navigate = useNavigate();


  return (
    <div className={`fixed top-4 left-4 z-30 ${className}`}>
      <button
        onClick={() => targetRoute ? navigate(targetRoute) : navigate(-1)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg"
        style={{ backgroundColor: '#2d545e', color: 'white' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#e1b382'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#2d545e'}
      >
        <FaArrowLeft />
        <span className="font-semibold">Back</span>
      </button>
    </div>
  );
};

export default BackButton;
