import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';
import { FaUserGraduate, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaChalkboardTeacher } from 'react-icons/fa';
import AdminHeader from '../../components/AdminHeader';
import BackButton from '../../components/BackButton';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rollNo: '',
    courseId: '',
    semester: '',
    password: ''
  });
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') || sessionStorage.getItem('role');
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await adminService.getStudents();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const data = await adminService.getCourses();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      rollNo: student.rollNo,
      courseId: student.courseId?._id || '',
      semester: student.semester || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await adminService.deleteStudent(studentId);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if courseId is invalid
    if (!formData.courseId || formData.courseId === 'no-courses') {
      toast.error('Please select a valid course');
      return;
    }

    try {
      if (editingStudent) {
        const dataToSend = { ...formData };
        if (!dataToSend.password) delete dataToSend.password;
        await adminService.updateStudent(editingStudent._id, dataToSend);
        toast.success('Student updated successfully');
      } else {
        await adminService.createStudent(formData);
        toast.success('Student created successfully');
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', phone: '', rollNo: '', courseId: '', semester: '', password: '' });
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(error.response?.data?.msg || 'Failed to save student');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton className="mb-4" />
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-secondary font-heading tracking-wide">Student Management</h1>
              <p className="text-text-secondary mt-2">Manage all student records and enrollments</p>
            </div>
            {isAdmin && (
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/teachers')}
                  className="flex items-center space-x-2"
                >
                  <FaChalkboardTeacher />
                  <span>Manage Teachers</span>
                </Button>
                <Button
                  onClick={() => {
                    setEditingStudent(null);
                    setFormData({ name: '', email: '', phone: '', rollNo: '', courseId: '', semester: '', password: '' });
                    setShowModal(true);
                  }}
                  className="flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Add Student</span>
                </Button>
              </div>
            )}
          </div>



          // ... (inside component) ...

          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Academic Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <FaUserGraduate />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-secondary">{student.name}</div>
                          <div className="text-xs text-text-secondary">Roll: {student.rollNo}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-secondary">{student.courseId?.courseName || 'N/A'}</div>
                      <div className="text-xs text-text-secondary">Semester {student.semester}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-secondary">{student.email}</div>
                      <div className="text-xs text-text-secondary">{student.phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-3">
                        <button className="text-secondary hover:text-secondary/80 transition-colors">
                          <FaEye />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => navigate(`/student/${student._id}/dashboard`)}
                            className="text-primary hover:text-primary/80 transition-colors"
                            title="View Dashboard"
                          >
                            <FaChalkboardTeacher />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="text-danger hover:text-red-700 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-secondary/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative p-8 border border-gray-200 w-full max-w-md shadow-2xl rounded-lg bg-white">
            <h3 className="text-2xl font-bold text-secondary mb-6 font-heading">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Roll No"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Course"
                  name="courseId"
                  value={formData.courseId}
                  onValueChange={(value) => handleChange({ target: { name: 'courseId', value } })}
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
                          {course.courseName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Input
                  label="Semester"
                  type="number"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                />
              </div>
              {!editingStudent && (
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              )}
              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                >
                  {editingStudent ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
