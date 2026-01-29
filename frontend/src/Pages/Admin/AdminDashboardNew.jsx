import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import {
  FaUsers, FaChalkboardTeacher, FaBook, FaClipboardList, FaRupeeSign,
  FaBell, FaCalendarAlt, FaChartBar, FaCog, FaFileAlt, FaBookOpen,
  FaClipboardCheck, FaMoneyBillWave, FaUserPlus, FaCheckCircle, FaClock
} from 'react-icons/fa';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const AdminDashboardNew = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/admin/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Derived data from backend
  const stats = dashboardData || {};

  const summaryCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents?.toString() || '0',
      icon: FaUsers,
      color: 'text-primary',
      bg: 'bg-primary/10',
      change: 'Active'
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers?.toString() || '0',
      icon: FaChalkboardTeacher,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      change: 'Active'
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses?.toString() || '0',
      icon: FaBook,
      color: 'text-primary',
      bg: 'bg-primary/10',
      change: 'Offered'
    },
    {
      title: 'Total Subjects',
      value: stats.totalSubjects?.toString() || '0',
      icon: FaBookOpen,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      change: 'Active'
    },
    {
      title: 'Notices',
      value: stats.totalNotices?.toString() || '0',
      icon: FaBell,
      color: 'text-primary',
      bg: 'bg-primary/10',
      change: 'Posted'
    },
    {
      title: 'Library Books',
      value: stats.totalBooks?.toString() || '0',
      icon: FaBook,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      change: 'In Library'
    }
  ];

  const quickActions = [
    { title: 'Add Student', icon: FaUserPlus, color: 'text-primary', bg: 'bg-primary/10', link: '/admin/create-student' },
    { title: 'Add Teacher', icon: FaChalkboardTeacher, color: 'text-secondary', bg: 'bg-secondary/10', link: '/admin/create-teacher' },
    { title: 'Add Course', icon: FaBook, color: 'text-primary', bg: 'bg-primary/10', link: '/admin/add-course' },
    { title: 'Add Subject', icon: FaBookOpen, color: 'text-secondary', bg: 'bg-secondary/10', link: '/admin/add-subject' },
    { title: 'Manage Fees', icon: FaMoneyBillWave, color: 'text-primary', bg: 'bg-primary/10', link: '/admin/fees' },
    { title: 'Send Notice', icon: FaBell, color: 'text-secondary', bg: 'bg-secondary/10', link: '/admin/notices' },
    { title: 'View Reports', icon: FaChartBar, color: 'text-primary', bg: 'bg-primary/10', link: '/admin/reports' },
    { title: 'Settings', icon: FaCog, color: 'text-secondary', bg: 'bg-secondary/10', link: '/admin/settings' }
  ];

  const managementModules = [
    {
      title: 'Student Management',
      icon: FaUsers,
      color: 'text-primary',
      borderColor: 'border-primary',
      bg: 'bg-primary/10',
      items: ['Add/Edit Students', 'Promote Students', 'ID Card Generation', 'Alumni Management'],
      link: '/admin/students'
    },
    {
      title: 'Teacher Management',
      icon: FaChalkboardTeacher,
      color: 'text-secondary',
      borderColor: 'border-secondary',
      bg: 'bg-secondary/10',
      items: ['Add/Edit Teachers', 'Assign Subjects', 'Leave Approvals', 'Performance Review'],
      link: '/admin/teachers'
    },
    {
      title: 'Course Management',
      icon: FaBook,
      color: 'text-primary',
      borderColor: 'border-primary',
      bg: 'bg-primary/10',
      items: ['Create Courses', 'Add Subjects', 'Syllabus Update', 'Department Setup'],
      link: '/admin/courses'
    },
    {
      title: 'Fee Management',
      icon: FaRupeeSign,
      color: 'text-secondary',
      borderColor: 'border-secondary',
      bg: 'bg-secondary/10',
      items: ['Fee Structure', 'Collection Reports', 'Due Tracking', 'Scholarships'],
      link: '/admin/fees'
    },
    {
      title: 'Attendance Control',
      icon: FaClipboardList,
      color: 'text-primary',
      borderColor: 'border-primary',
      bg: 'bg-primary/10',
      items: ['View Reports', 'Modify Records', 'Analytics', 'Monthly Reports'],
      link: '/admin/attendance'
    },
    {
      title: 'Exam Management',
      icon: FaClipboardCheck,
      color: 'text-secondary',
      borderColor: 'border-secondary',
      bg: 'bg-secondary/10',
      items: ['Schedule Exams', 'Seating Plan', 'Result Publishing', 'Marks Entry'],
      link: '/admin/exams'
    },
    {
      title: 'Library Management',
      icon: FaBookOpen,
      color: 'text-primary',
      borderColor: 'border-primary',
      bg: 'bg-primary/10',
      items: ['Add Books', 'Issue/Return', 'Fine Tracking', 'Reports'],
      link: '/admin/library'
    },
    {
      title: 'Timetable',
      icon: FaCalendarAlt,
      color: 'text-secondary',
      borderColor: 'border-secondary',
      bg: 'bg-secondary/10',
      items: ['Create Timetable', 'Assign Teachers', 'Conflict Detection', 'Lab Schedules'],
      link: '/admin/timetable'
    }
  ];

  const recentActivities = [
    { action: 'New student enrolled', user: 'Rahul Kumar', time: '10 mins ago', type: 'student' },
    { action: 'Fee payment received', user: 'Priya Sharma', time: '25 mins ago', type: 'fee' },
    { action: 'Leave approved', user: 'Dr. Amit Singh', time: '1 hour ago', type: 'leave' },
    { action: 'Assignment created', user: 'Prof. Sneha Patel', time: '2 hours ago', type: 'assignment' },
    { action: 'Exam schedule published', user: 'Admin', time: '3 hours ago', type: 'exam' }
  ];

  const pendingApprovals = [
    { type: 'Leave Request', count: 5, color: 'bg-primary' },
    { type: 'Document Requests', count: 12, color: 'bg-secondary' },
    { type: 'Fee Concessions', count: 3, color: 'bg-primary' },
    { type: 'Student Complaints', count: 7, color: 'bg-secondary' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary font-heading">Admin Dashboard</h1>
          <p className="text-text-secondary">Overview and controls for the entire institution</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`text-lg ${card.color}`} />
                </div>
                <span className="text-xs font-semibold text-primary">{card.change}</span>
              </div>
              <p className="text-xs font-medium text-text-secondary">{card.title}</p>
              <p className="text-xl font-bold text-secondary mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-secondary font-heading">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group"
              >
                <div className={`p-3 rounded-full mb-2 group-hover:scale-110 transition-transform ${action.bg}`}>
                  <action.icon className={`text-xl ${action.color}`} />
                </div>
                <span className="text-xs font-medium text-text-secondary text-center">{action.title}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Management Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Management Modules */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-secondary font-heading">Management Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {managementModules.map((module, index) => (
                  <Link
                    key={index}
                    to={module.link}
                    className={`p-4 border rounded-xl hover:shadow-md transition-all duration-200 border-l-4 ${module.borderColor} bg-white`}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`p-2 rounded-lg mr-3 ${module.bg}`}>
                        <module.icon className={`text-lg ${module.color}`} />
                      </div>
                      <h3 className="font-bold text-secondary">{module.title}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {module.items.map((item, idx) => (
                        <li key={idx} className="text-xs text-text-secondary flex items-center">
                          <span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-secondary font-heading">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full bg-primary`}></div>
                        <div>
                          <p className="text-sm font-medium text-secondary">{activity.description || activity.action}</p>
                          <p className="text-xs text-text-secondary">{new Date(activity.date || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-muted text-center py-4">No recent activities recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-secondary font-heading">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApprovals.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium text-text-secondary">{item.type}</span>
                    <Badge className={`${item.color} text-white border-none`}>
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="primary" className="w-full mt-4">
                View All Approvals
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-secondary font-heading">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Database</span>
                  <span className="flex items-center text-primary text-xs font-bold uppercase tracking-wider">
                    <FaCheckCircle className="mr-1" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Server</span>
                  <span className="flex items-center text-primary text-xs font-bold uppercase tracking-wider">
                    <FaCheckCircle className="mr-1" /> Running
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Backup</span>
                  <span className="flex items-center text-secondary text-xs font-bold uppercase tracking-wider">
                    <FaClock className="mr-1" /> 2 days ago
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Storage</span>
                  <span className="text-sm font-medium text-secondary">65% Used</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                System Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-secondary to-primary text-white border-none shadow-lg">
            <CardContent>
              <h3 className="font-bold text-lg mb-4 font-heading">Today's Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Present Students</span>
                  <span className="font-bold">1,082</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Present Teachers</span>
                  <span className="font-bold">78</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Fee Collected</span>
                  <span className="font-bold">₹2.5L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">New Admissions</span>
                  <span className="font-bold">5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
