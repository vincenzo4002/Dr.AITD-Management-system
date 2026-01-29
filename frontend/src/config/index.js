// Application Configuration
export const APP_CONFIG = {
  name: 'College ERP Management System',
  version: '1.0.0',
  description: 'Comprehensive ERP system for educational institutions',
  author: 'College ERP Team'
};

// Environment Configuration
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000'
};

// Theme Configuration
export const THEME_CONFIG = {
  colors: {
    primary: '#2d545e',
    secondary: '#e1b382',
    accent: '#c89666',
    dark: '#12343b',
    light: '#ffffff',
    gray: '#f5f5f5'
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  }
};

// Route Configuration
export const ROUTES = {
  LOGIN: '/login',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    TEACHERS: '/admin/teachers',
    STUDENTS: '/admin/students',
    COURSES: '/admin/courses',
    FEES: '/admin/fees',
    ATTENDANCE: '/admin/attendance',
    EXAMS: '/admin/exams',
    LIBRARY: '/admin/library',
    TIMETABLE: '/admin/timetable',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
    NOTICES: '/admin/notices'
  },
  TEACHER: {
    DASHBOARD: '/teacher/:id/dashboard',
    PROFILE: '/teacher/:id/profile',
    STUDENTS: '/teacher/:id/students',
    SUMMARY: '/teacher/:id/summary'
  },
  STUDENT: {
    DASHBOARD: '/student/:id/dashboard',
    PROFILE: '/student/:id/profile',
    NOTES: '/student/:id/notes',
    MATERIALS: '/student/:id/materials',
    ASSIGNMENTS: '/student/:id/assignments',
    ATTENDANCE: '/student/:id/attendance'
  }
};