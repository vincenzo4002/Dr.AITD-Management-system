import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import {
  FaUser, FaEnvelope, FaPhone, FaChalkboardTeacher, FaBook, FaClipboardList,
  FaTasks, FaBell, FaBriefcase, FaCalendarAlt, FaFilePdf, FaUpload, FaGraduationCap,
  FaFlask, FaChartLine, FaEdit, FaSave, FaTimes, FaBuilding, FaIdBadge
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const TeacherProfile = () => {
  const { id: teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    name: '', email: '', phone: '', department: '', designation: '',
    experience: '', joinDate: '', cvUrl: '', gender: '', dob: '',
    qualifications: '', specialization: '', researchInterests: '', employeeId: ''
  });

  useEffect(() => {
    fetchTeacherProfile();
    fetchAssignments();
    fetchMaterials();
    fetchNotices();
  }, [teacherId]);

  const fetchTeacherProfile = async () => {
    try {
      const response = await api.get(`/api/teacher/${teacherId}/dashboard`);
      const tData = response.data.teacher;
      setTeacher(tData);
      setEditData({
        name: tData?.name || '',
        email: tData?.email || '',
        phone: tData?.phone || '',
        department: tData?.department || '',
        designation: tData?.designation || '',
        experience: tData?.experience || '',
        joinDate: tData?.joinDate ? new Date(tData.joinDate).toISOString().split('T')[0] : '',
        cvUrl: tData?.cvUrl || '',
        gender: tData?.gender || '',
        dob: tData?.dob ? new Date(tData.dob).toISOString().split('T')[0] : '',
        qualifications: tData?.qualifications || '',
        specialization: tData?.specialization || '',
        researchInterests: tData?.researchInterests || '',
        employeeId: tData?.employeeId || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && teacher) {
      setEditData({
        name: teacher.name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        department: teacher.department || '',
        designation: teacher.designation || '',
        experience: teacher.experience || '',
        joinDate: teacher.joinDate ? new Date(teacher.joinDate).toISOString().split('T')[0] : '',
        cvUrl: teacher.cvUrl || '',
        gender: teacher.gender || '',
        dob: teacher.dob ? new Date(teacher.dob).toISOString().split('T')[0] : '',
        qualifications: teacher.qualifications || '',
        specialization: teacher.specialization || '',
        researchInterests: teacher.researchInterests || '',
        employeeId: teacher.employeeId || ''
      });
    }
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      await api.put(`/teacher/${teacherId}/profile`, editData);
      setTeacher({ ...teacher, ...editData });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/api/teacher/${teacherId}/assignments`);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await api.get(`/api/teacher/${teacherId}/materials`);
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await api.get(`/api/teacher/${teacherId}/notices`);
      setNotices(response.data.notices || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-end">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl border-4 border-white/20">
              <FaUser />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 font-heading">{teacher?.name}</h1>
              <div className="flex gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1"><FaBuilding /> {teacher?.department || 'Department N/A'}</span>
                <span className="flex items-center gap-1"><FaIdBadge /> {teacher?.designation || 'Designation N/A'}</span>
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
                  <Input label="Employee ID" name="employeeId" value={editData.employeeId} onChange={handleInputChange} />
                  <Input label="Email" name="email" value={editData.email} onChange={handleInputChange} />
                  <Input label="Phone" name="phone" value={editData.phone} onChange={handleInputChange} />
                  <Input label="Gender" name="gender" value={editData.gender} onChange={handleInputChange} placeholder="Male/Female/Other" />
                  <Input label="Date of Birth" name="dob" type="date" value={editData.dob} onChange={handleInputChange} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <InfoRow label="Full Name" value={teacher?.name} />
                  <InfoRow label="Employee ID" value={teacher?.employeeId} />
                  <InfoRow label="Email" value={teacher?.email} />
                  <InfoRow label="Phone" value={teacher?.phone} />
                  <InfoRow label="Gender" value={teacher?.gender} />
                  <InfoRow label="Date of Birth" value={teacher?.dob ? new Date(teacher.dob).toLocaleDateString() : 'N/A'} />
                  <InfoRow label="Joining Date" value={teacher?.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : 'N/A'} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Academic & Professional Details */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 font-heading">
                <FaGraduationCap className="text-primary" /> Academic & Professional Details
              </h2>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Qualifications" name="qualifications" value={editData.qualifications} onChange={handleInputChange} placeholder="e.g. PhD, M.Tech" />
                  <Input label="Specialization" name="specialization" value={editData.specialization} onChange={handleInputChange} />
                  <Input label="Experience (Years)" name="experience" type="number" value={editData.experience} onChange={handleInputChange} />
                  <Input label="Department" name="department" value={editData.department} onChange={handleInputChange} />
                  <Input label="Designation" name="designation" value={editData.designation} onChange={handleInputChange} />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Research Areas / Skills</label>
                    <textarea
                      name="researchInterests"
                      value={editData.researchInterests}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      rows="3"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <InfoRow label="Qualifications" value={teacher?.qualifications} />
                    <InfoRow label="Specialization" value={teacher?.specialization} />
                    <InfoRow label="Experience" value={teacher?.experience ? `${teacher.experience} Years` : 'N/A'} />
                    <InfoRow label="Designation" value={teacher?.designation} />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted font-medium">Research Areas / Skills</p>
                    <p className="text-secondary font-medium mt-1">{teacher?.researchInterests || 'N/A'}</p>
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
                  {teacher?.cvUrl ? (
                    <a href={teacher.cvUrl} target="_blank" rel="noopener noreferrer">
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

          {/* 4. Teaching Responsibilities (Read Only) */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 font-heading">
                <FaChalkboardTeacher className="text-primary" /> Teaching Responsibilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <h3 className="font-bold text-secondary mb-2">Assigned Subjects</h3>
                  {teacher?.assignedSubjects?.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                      {teacher.assignedSubjects.map((sub, idx) => (
                        <li key={idx}>{sub.subjectName} ({sub.subjectCode})</li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-text-muted">No subjects assigned.</p>}
                </div>
                <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/10">
                  <h3 className="font-bold text-secondary mb-2">Assigned Courses</h3>
                  {teacher?.assignedCourse?.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                      {teacher.assignedCourse.map((course, idx) => (
                        <li key={idx}>{course.courseName}</li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-text-muted">No courses assigned.</p>}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Dashboard Widgets */}
        <div className="space-y-6">

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-3xl font-bold text-primary">{assignments.length}</p>
              <p className="text-xs text-text-muted uppercase font-bold mt-1">Assignments</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-3xl font-bold text-secondary">{materials.length}</p>
              <p className="text-xs text-text-muted uppercase font-bold mt-1">Materials</p>
            </div>
          </div>

          {/* Administrative Controls */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-secondary mb-4 flex items-center gap-2 font-heading">
                <FaTasks className="text-primary" /> Admin Controls
              </h3>
              <div className="space-y-2">
                <Link to={`/teacher/${teacherId}/assignments`} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • Upload Assignments
                </Link>
                <Link to={`/teacher/${teacherId}/materials`} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • Upload Study Materials
                </Link>
                <Link to={`/teacher/${teacherId}/marks`} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • Manage Marks
                </Link>
                <Link to={`/teacher/${teacherId}/attendance`} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • Mark Attendance
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Student Interaction */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-secondary mb-4 flex items-center gap-2 font-heading">
                <FaUser className="text-primary" /> Student Interaction
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • View Leave Requests <Badge variant="warning" className="ml-2 text-xs">2 New</Badge>
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-text-secondary transition-colors">
                  • Student Queries
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-secondary mb-4 flex items-center gap-2 font-heading">
                <FaChartLine className="text-primary" /> Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Attendance</span>
                    <span className="font-bold text-secondary">92%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Syllabus Covered</span>
                    <span className="font-bold text-secondary">75%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
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

export default TeacherProfile;
