import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';

const CreateStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  const [coursesLoading, setCoursesLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rollNo: '',
    password: '',
    courseId: '',
    semester: 1
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await api.get('/api/courses');
      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/admin/students', formData);

      if (response.data.success) {
        toast.success('Student created successfully!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton className="mb-4" />
          <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
            <h1 className="text-3xl font-bold mb-8 text-secondary font-heading">Create Student Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Gulshan Kartik"
                />

                <Input
                  label="Email Address *"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="kartik@student.edu"
                />

                <Input
                  label="Phone Number *"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+91-9876543220"
                />

                <Input
                  label="Roll Number *"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  required
                  placeholder="CSE2021001"
                />

                <Input
                  label="Password *"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter password"
                />

                <Select
                  label="Course *"
                  name="courseId"
                  value={formData.courseId}
                  onValueChange={(value) => handleInputChange({ target: { name: 'courseId', value } })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select Course</SelectItem>
                    {coursesLoading ? (
                      <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                    ) : courses.length === 0 ? (
                      <SelectItem value="no-courses" disabled>No courses available</SelectItem>
                    ) : (
                      courses.map(course => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.courseName} ({course.courseCode})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Select
                  label="Semester *"
                  name="semester"
                  value={formData.semester}
                  onValueChange={(value) => handleInputChange({ target: { name: 'semester', value } })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Student'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudent;
