import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import {
  FaUser, FaIdCard, FaGraduationCap, FaChartLine,
  FaFilePdf, FaBus, FaBook, FaMoneyBillWave,
  FaEdit, FaSave, FaTimes, FaBell
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentProfile = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    name: '', email: '', phone: '', cvUrl: '',
    gender: '', dob: '', hostelInfo: '', transportInfo: ''
  });

  useEffect(() => {
    fetchStudentProfile();
    fetchAttendance();
    fetchMarks();
    fetchAssignments();
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/profile`);
      const sData = response.data.student;
      setStudent(sData);
      setEditData({
        name: sData?.name || '',
        email: sData?.email || '',
        phone: sData?.phone || '',
        cvUrl: sData?.cvUrl || '',
        gender: sData?.gender || '',
        dob: sData?.dob ? new Date(sData.dob).toISOString().split('T')[0] : '',
        hostelInfo: sData?.hostelInfo || '',
        transportInfo: sData?.transportInfo || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && student) {
      setEditData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        cvUrl: student.cvUrl || '',
        gender: student.gender || '',
        dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
        hostelInfo: student.hostelInfo || '',
        transportInfo: student.transportInfo || ''
      });
    }
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      await api.put(`/student/${studentId}/profile`, editData);
      setStudent({ ...student, ...editData });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/attendance`);
      setAttendance(response.data.attendanceBySubject || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchMarks = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/marks`);
      setMarks(response.data.marks || []);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/assignments`);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  const overallAttendance = attendance.length > 0
    ? (attendance.reduce((sum, s) => sum + parseFloat(s.percentage || 0), 0) / attendance.length).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Section */}
      <div className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-end">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl border-4 border-white/20">
              <FaUser />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 font-heading">{student?.name}</h1>
              <div className="flex gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1"><FaIdCard /> {student?.rollNo || 'Roll No N/A'}</span>
                <span className="flex items-center gap-1"><FaGraduationCap /> {student?.courseId?.courseName || 'Course N/A'}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleEditToggle}
            variant={isEditing ? "danger" : "primary"}
            className="mt-4 md:mt-0 flex items-center gap-2"
          >
            {isEditing ? <><FaTimes /> Cancel Editing</> : <><FaEdit /> Edit Profile</>}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-8">

          {/* 1. Basic Information */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 font-heading">
                <FaUser className="text-primary" /> Basic Information
              </h2>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" name="name" value={editData.name} onChange={handleInputChange} />
                  <Input label="Email" name="email" value={editData.email} onChange={handleInputChange} />
                  <Input label="Phone" name="phone" value={editData.phone} onChange={handleInputChange} />
                  <Input label="Gender" name="gender" value={editData.gender} onChange={handleInputChange} placeholder="Male/Female/Other" />
                  <Input label="Date of Birth" name="dob" type="date" value={editData.dob} onChange={handleInputChange} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <InfoRow label="Full Name" value={student?.name} />
                  <InfoRow label="Roll Number" value={student?.rollNo} />
                  <InfoRow label="Email" value={student?.email} />
                  <InfoRow label="Phone" value={student?.phone} />
                  <InfoRow label="Gender" value={student?.gender} />
                  <InfoRow label="Date of Birth" value={student?.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'} />
                  <InfoRow label="Course" value={student?.courseId?.courseName} />
                  <InfoRow label="Joined" value={new Date(student?.createdAt).toLocaleDateString()} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Additional Details (Hostel, Transport) */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 font-heading">
                <FaBus className="text-primary" /> Additional Details
              </h2>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Hostel Info" name="hostelInfo" value={editData.hostelInfo} onChange={handleInputChange} placeholder="Block/Room No" />
                  <Input label="Transport Info" name="transportInfo" value={editData.transportInfo} onChange={handleInputChange} placeholder="Bus Route/Stop" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <InfoRow label="Hostel Info" value={student?.hostelInfo} />
                    <InfoRow label="Transport Info" value={student?.transportInfo} />
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full md:w-auto flex items-center justify-center gap-2" onClick={() => toast.info("ID Card download started...")}>
                      <FaIdCard /> Download ID Card
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. CV / Resume Section */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 font-heading">
                <FaFilePdf className="text-primary" /> CV / Resume
              </h2>
              {isEditing ? (
                <div>
                  <Input label="CV URL (Public Link)" name="cvUrl" value={editData.cvUrl} onChange={handleInputChange} placeholder="https://drive.google.com/..." />
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded text-red-600"><FaFilePdf size={24} /></div>
                    <div>
                      <p className="font-bold text-secondary">Curriculum Vitae</p>
                      <p className="text-xs text-text-muted">PDF Document</p>
                    </div>
                  </div>
                  {student?.cvUrl ? (
                    <a href={student.cvUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">View CV</Button>
                    </a>
                  ) : (
                    <span className="text-sm text-text-muted italic">No CV Uploaded</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} className="flex items-center gap-2 text-lg px-8">
                <FaSave /> Save All Changes
              </Button>
            </div>
          )}

          {/* 4. Academic Performance (Marks) */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 font-heading">
                <FaBook className="text-primary" /> Academic Performance
              </h2>
              {marks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Exam</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">%</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marks.map((mark, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-secondary">{mark.subjectId?.subjectName}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{mark.examType}</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary">{mark.marks} / {mark.totalMarks}</td>
                          <td className="px-4 py-3 text-sm font-bold text-secondary">{((mark.marks / mark.totalMarks) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-text-secondary text-center py-4">No marks recorded yet.</p>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Dashboard Widgets */}
        <div className="space-y-6">

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-3xl font-bold text-primary">{overallAttendance}%</p>
              <p className="text-xs text-text-muted uppercase font-bold mt-1">Attendance</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-3xl font-bold text-secondary">{assignments.length}</p>
              <p className="text-xs text-text-muted uppercase font-bold mt-1">Assignments</p>
            </div>
          </div>

          {/* Fee & Financial (Mock) */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-secondary mb-4 flex items-center gap-2 font-heading">
                <FaMoneyBillWave className="text-primary" /> Fee Status
              </h3>
              <div className="bg-green-50 border border-green-100 p-4 rounded-lg mb-3">
                <p className="text-sm text-green-800 font-bold">No Dues Pending</p>
                <p className="text-xs text-green-600">Last payment: 15th Nov 2024</p>
              </div>
              <Link to={`/student/${studentId}/fees`} className="block w-full text-center py-2 border border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors text-sm font-bold">
                View Receipts
              </Link>
            </CardContent>
          </Card>

          {/* Learning Materials */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-secondary mb-4 flex items-center gap-2 font-heading">
                <FaBook className="text-primary" /> Learning Materials
              </h3>
              <div className="space-y-2">
                <Link to={`/student/${studentId}/notes`} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • Download Notes
                </Link>
                <Link to={`/student/${studentId}/assignments`} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • View Assignments
                </Link>
                <Link to={`/student/${studentId}/materials`} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • Previous Year Papers
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Support & Communication */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-secondary mb-4 flex items-center gap-2 font-heading">
                <FaBell className="text-primary" /> Support
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • Complaint Box
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • Teacher Chat
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Breakdown */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-secondary mb-4 flex items-center gap-2 font-heading">
                <FaChartLine className="text-primary" /> Attendance
              </h3>
              <div className="space-y-3">
                {attendance.slice(0, 3).map((record, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary font-medium">{record.subjectName}</span>
                      <span className={`font-bold ${parseFloat(record.percentage) < 75 ? 'text-danger' : 'text-success'}`}>
                        {record.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${parseFloat(record.percentage) < 75 ? 'bg-danger' : 'bg-success'}`}
                        style={{ width: `${record.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoRow = ({ label, value }) => (
  <div className="border-b border-gray-50 pb-2 last:border-0">
    <p className="text-xs text-text-muted uppercase font-bold tracking-wider">{label}</p>
    <p className="text-secondary font-medium text-base mt-0.5">{value || 'N/A'}</p>
  </div>
);

export default StudentProfile;
