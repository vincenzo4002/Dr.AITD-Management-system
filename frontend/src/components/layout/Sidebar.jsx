import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  LogOut,
  X,
  CreditCard,
  Library,
  ClipboardCheck
} from 'lucide-react';
import useAutoLogout from '../../hooks/useAutoLogout';

const Sidebar = ({ isOpen, onClose, userRole, userId, realRole }) => {
  const location = useLocation();
  const logout = useAutoLogout();

  const getLinks = () => {
    const common = [
      { icon: LayoutDashboard, label: 'Dashboard', path: `/${userRole}/${userRole === 'admin' ? 'dashboard' : 'id/dashboard'}` },
    ];

    if (userRole === 'admin') {
      return [
        ...common,
        { icon: Users, label: 'Students', path: '/admin/students' },
        { icon: GraduationCap, label: 'Teachers', path: '/admin/teachers' },
        { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
        { icon: Library, label: 'Subjects', path: '/admin/subjects' },
        { icon: CreditCard, label: 'Fees', path: '/admin/fees' },
        { icon: ClipboardCheck, label: 'Attendance', path: '/admin/attendance' },
        { icon: Calendar, label: 'Timetable', path: '/admin/timetable' },
        { icon: FileText, label: 'Notices', path: '/admin/notices' },
        { icon: ClipboardCheck, label: 'Exams', path: '/admin/exams' },
        { icon: BookOpen, label: 'Library', path: '/admin/library' },
        { icon: FileText, label: 'Reports', path: '/admin/reports' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
      ];
    } else if (userRole === 'teacher') {
      let teacherId = userId;
      // If admin is viewing, or if strictly relying on URL is needed (fallback)
      if (realRole === 'admin' || !teacherId) {
        // Try to capture ID from URL: /teacher/:id/...
        const parts = location.pathname.split('/');
        if (parts[1] === 'teacher' && parts[2] && parts[2] !== 'dashboard') {
          teacherId = parts[2];
        }
      }

      // Ensure we have a valid ID before rendering links that require it
      if (!teacherId) return [];

      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: `/teacher/${teacherId}/dashboard` },
        { icon: Users, label: 'My Students', path: `/teacher/${teacherId}/students` },
        { icon: ClipboardCheck, label: 'Attendance', path: `/teacher/${teacherId}/attendance` },
        { icon: BookOpen, label: 'Assignments', path: `/teacher/${teacherId}/assignments` },
        { icon: Library, label: 'Learning Resources', path: `/teacher/${teacherId}/resources` },
        { icon: FileText, label: 'Materials', path: `/teacher/${teacherId}/materials` },
        { icon: GraduationCap, label: 'Marks', path: `/teacher/${teacherId}/marks` },
        { icon: Calendar, label: 'Timetable', path: `/teacher/${teacherId}/timetable` },
        { icon: FileText, label: 'Notices', path: `/teacher/${teacherId}/notices` },
        { icon: Calendar, label: 'Leave', path: `/teacher/${teacherId}/leave` },
      ];
    } else if (userRole === 'student') {
      let studentId = userId;

      if (realRole === 'admin' || !studentId) {
        // Try to capture ID from URL: /student/:id/...
        const parts = location.pathname.split('/');
        if (parts[1] === 'student' && parts[2] && parts[2] !== 'dashboard') {
          studentId = parts[2];
        }
      }

      // Ensure we have a valid ID
      if (!studentId) return [];

      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: `/student/${studentId}/dashboard` },
        { icon: Library, label: 'Subjects', path: `/student/${studentId}/subjects` },
        { icon: ClipboardCheck, label: 'Attendance', path: `/student/${studentId}/attendance` },
        { icon: BookOpen, label: 'Assignments', path: `/student/${studentId}/assignments` },
        { icon: FileText, label: 'Materials', path: `/student/${studentId}/materials` },
        { icon: GraduationCap, label: 'Marks', path: `/student/${studentId}/marks` },
        { icon: CreditCard, label: 'Fees', path: `/student/${studentId}/fees` },
        { icon: Calendar, label: 'Timetable', path: `/student/${studentId}/timetable` },
        { icon: BookOpen, label: 'Library', path: `/student/${studentId}/library` },
        { icon: FileText, label: 'Notices', path: `/student/${studentId}/notices` },
        { icon: Calendar, label: 'Leave', path: `/student/${studentId}/leave` },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[60] w-72 bg-slate-900 border-r border-white/5 transform transition-transform duration-300 lg:transform-none shadow-2xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <GraduationCap className="text-primary w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block leading-none font-heading">Dr AITD</span>
                <span className="text-xs text-gray-400 font-medium">Management System</span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                  }`
                }
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                {({ isActive }) => (
                  <>
                    <link.icon size={20} className={`mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    {link.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-white/10 bg-secondary/50">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
            >
              <LogOut size={20} className="mr-3 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;