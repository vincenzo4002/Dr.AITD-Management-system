import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import BackButton from '../../components/BackButton';
import AdminHeader from '../../components/AdminHeader';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaBook, FaChalkboardTeacher, FaSave, FaTimes } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const CreateTeacher = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    department: '',
    designation: '',
    assignedCourse: [],
    assignedSubjects: []
  });

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/admin/dashboard');
      if (response.data.success) {
        setCourses(response.data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      }
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/admin/dashboard');
      if (response.data.success) {
        setSubjects(response.data.data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (e, field) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/admin/teachers', formData);

      if (response.data.success) {
        toast.success('Teacher created successfully!');
        navigate('/admin/teachers');
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <BackButton className="mb-6" />

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Header Section */}
            <div className="bg-secondary px-8 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-lg text-white shadow-lg">
                  <FaChalkboardTeacher className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-heading tracking-wide">Create Teacher Profile</h1>
                  <p className="text-white/80 text-sm mt-1">Add a new faculty member to the system</p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-secondary border-b border-gray-200 pb-2 mb-4">
                    Personal Information
                  </h3>

                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Gulshan kartik"
                    icon={FaUser}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="kartik@gmail.com"
                    icon={FaEnvelope}
                    required
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    icon={FaPhone}
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Set initial password"
                    icon={FaLock}
                    required
                  />
                </div>

                {/* Academic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-secondary border-b border-gray-200 pb-2 mb-4">
                    Academic Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Computer Science"
                    />

                    <Input
                      label="Designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="Assistant Professor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      <FaBook className="inline mr-2 text-primary" />
                      Assigned Courses
                    </label>
                    <select
                      multiple
                      onChange={(e) => handleMultiSelect(e, 'assignedCourse')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary h-32 transition-all text-sm"
                    >
                      {courses.map(course => (
                        <option key={course._id} value={course._id} className="p-2 hover:bg-primary/10">
                          {course.courseName} ({course.courseCode})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-muted mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      <FaBook className="inline mr-2 text-primary" />
                      Assigned Subjects
                    </label>
                    <select
                      multiple
                      onChange={(e) => handleMultiSelect(e, 'assignedSubjects')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary h-32 transition-all text-sm"
                    >
                      {subjects.map(subject => (
                        <option key={subject._id} value={subject._id} className="p-2 hover:bg-primary/10">
                          {subject.subjectName} ({subject.subjectCode})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-muted mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/admin/teachers')}
                  className="flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-8"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  {loading ? 'Creating...' : 'Create Teacher'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeacher;
