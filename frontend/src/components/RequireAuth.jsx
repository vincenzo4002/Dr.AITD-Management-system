import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

const RequireAuth = ({ allowedRoles }) => {
    const location = useLocation();
    const token = Cookies.get('token') || localStorage.getItem('token');

    let userRole = null;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            userRole = decoded.role;
        } catch (e) {
            console.error("Error decoding token:", e);
        }
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
