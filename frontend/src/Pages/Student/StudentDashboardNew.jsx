import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import {
  User, FileText, Bell, CheckCircle, Clock, CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const StudentDashboardNew = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data States
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel data fetching
        const [
          profileRes,
          attendanceRes,
          assignmentsRes,
          noticesRes,
          subjectsRes,
          marksRes,
          materialsRes,
          feesRes
        ] = await Promise.all([
          api.get(`/api/student/${studentId}/profile`),
          api.get(`/api/student/${studentId}/attendance`),
          api.get(`/api/student/${studentId}/assignments`),
          api.get(`/api/student/${studentId}/notices`),
          api.get(`/api/student/${studentId}/subjects`),
          api.get(`/api/student/${studentId}/marks`),
          api.get(`/api/student/${studentId}/materials`),
          api.get(`/api/student/${studentId}/fees`)
        ]);

        setStudent(profileRes.data.student);
        setAttendance(attendanceRes.data.attendance || []);
        setAssignments(assignmentsRes.data.assignments || []);
        setNotices(noticesRes.data.notices || []);
        setSubjects(subjectsRes.data.subjects || []);
        setMarks(marksRes.data.marks || []);
        setMaterials(materialsRes.data.materials || []);
        setFees(feesRes.data.fees || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate generic fee status
  const pendingFees = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue');
  const hasPendingFees = pendingFees.length > 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-secondary to-primary rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <User size={150} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 font-heading">Welcome back, {student?.name}!</h1>
          <p className="text-white/60 text-lg mb-6">
            Roll No: <span className="font-mono font-semibold bg-white/20 px-2 py-1 rounded text-white">{student?.rollNo}</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <p className="text-white/80 text-sm">Course</p>
              <p className="font-semibold text-lg">{student?.courseId?.courseName || 'N/A'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <p className="text-white/80 text-sm">Email</p>
              <p className="font-semibold text-lg truncate">{student?.email}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <p className="text-white/80 text-sm">Phone</p>
              <p className="font-semibold text-lg">{student?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6 border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-secondary text-sm font-medium">Pending Assignments</p>
              <h3 className="text-3xl font-bold text-secondary mt-2">
                {assignments.filter(a => !a.submitted).length}
              </h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <FileText size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-success">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-secondary text-sm font-medium">Attendance</p>
              <h3 className="text-3xl font-bold text-secondary mt-2">
                {attendance.length > 0
                  ? `${Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)}%`
                  : 'N/A'}
              </h3>
            </div>
            <div className="p-3 bg-success/10 rounded-lg text-success">
              <CheckCircle size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-secondary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-secondary text-sm font-medium">New Notices</p>
              <h3 className="text-3xl font-bold text-secondary mt-2">{notices.length}</h3>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
              <Bell size={24} />
            </div>
          </div>
        </Card>

        {/* Fee Status Card */}
        <Card className={`p-6 border-l-4 ${hasPendingFees ? 'border-danger' : 'border-success'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-secondary text-sm font-medium">Fee Status</p>
              <h3 className={`text-xl font-bold mt-2 ${hasPendingFees ? 'text-danger' : 'text-success'}`}>
                {hasPendingFees ? 'Dues Pending' : 'All Paid'}
              </h3>
              {hasPendingFees && <p className="text-xs text-danger mt-1">{pendingFees.length} invoice(s)</p>}
            </div>
            <div className={`p-3 rounded-lg ${hasPendingFees ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
              <CreditCard size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-warning cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/achievers')}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-secondary text-sm font-medium">Hall of Fame</p>
              <h3 className="text-lg font-bold text-secondary mt-2">Student Achievers</h3>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg text-warning">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity / Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-secondary mb-4 flex items-center font-heading">
            <Bell className="mr-2 text-primary" size={20} /> Recent Announcements
          </h3>
          <div className="space-y-4">
            {notices.slice(0, 3).map((notice) => (
              <div key={notice._id} className="p-4 bg-background rounded-lg border border-gray-200 hover:bg-primary/5 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-secondary">{notice.title}</h4>
                  <span className="text-xs text-text-secondary">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2">{notice.description}</p>
              </div>
            ))}
            {notices.length === 0 && <p className="text-text-secondary text-center py-4">No new announcements.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-secondary mb-4 flex items-center font-heading">
            <Clock className="mr-2 text-primary" size={20} /> Upcoming Deadlines
          </h3>
          <div className="space-y-4">
            {assignments.filter(a => !a.submitted).slice(0, 3).map((assignment) => (
              <div key={assignment._id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-gray-200">
                <div>
                  <h4 className="font-semibold text-secondary">{assignment.title}</h4>
                  <p className="text-xs text-danger font-medium mt-1">
                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            ))}
            {assignments.filter(a => !a.submitted).length === 0 && (
              <p className="text-text-secondary text-center py-4">No pending assignments!</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200" onClick={() => navigate(`/student/${studentId}/timetable`)}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-secondary">Timetable</h4>
              <p className="text-xs text-text-muted">View Schedule</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200" onClick={() => navigate(`/student/${studentId}/attendance`)}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-success/10 text-success">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-secondary">Attendance</h4>
              <p className="text-xs text-text-muted">Check Status</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200" onClick={() => navigate(`/student/${studentId}/subjects`)}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-secondary">My Subjects</h4>
              <p className="text-xs text-text-muted">View Courses</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200" onClick={() => navigate(`/student/${studentId}/materials`)}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-warning/10 text-warning">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-secondary">Resources</h4>
              <p className="text-xs text-text-muted">Study Materials</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboardNew;
