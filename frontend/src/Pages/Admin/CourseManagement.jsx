import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import AdminHeader from '../../components/AdminHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import adminService from '../../services/adminService';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await adminService.getCourses();
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton className="mb-4" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary font-heading">Course Management</h1>
              <p className="text-text-secondary">Manage all courses and academic programs</p>
            </div>
            <Link to="/admin/add-course">
              <Button className="flex items-center space-x-2">
                <FaPlus />
                <span>Add Course</span>
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <div className="flex items-center">
                        <FaBook className="text-primary mr-3" />
                        <span className="font-medium text-secondary">{course.courseName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{course.courseCode}</TableCell>
                    <TableCell>{course.courseDuration}</TableCell>
                    <TableCell>{course.students || 0}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button className="text-primary hover:text-primary/80"><FaEye /></button>
                        <button className="text-primary hover:text-primary/80"><FaEdit /></button>
                        <button className="text-danger hover:text-red-700"><FaTrash /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center py-4" colSpan={5}>No courses found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;