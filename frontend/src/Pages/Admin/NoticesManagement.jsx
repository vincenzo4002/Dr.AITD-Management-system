import React, { useState, useEffect } from 'react';
import { FaBell, FaPlus, FaRemoveFormat, FaTrash, FaEye, FaTimes } from 'react-icons/fa';
import AdminHeader from '../../components/AdminHeader';
import BackButton from '../../components/BackButton';
import { toast } from 'react-toastify';
import api from '../../api/axiosInstance';
import Button from '../../components/ui/Button';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const NoticesManagement = () => {
  const [notices, setNotices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: '',
    description: '' // Backend expects description, frontend used content
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [noticesRes, coursesRes] = await Promise.all([
        api.get('/admin/notices'),
        api.get('/admin/courses')
      ]);

      setNotices(noticesRes.data.notices || []);
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.description || !formData.courseId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // Using the teacher/admin route which maps to teacherController.addNotice
      await api.post('/teacher/admin/notices', {
        ...formData,
        teacherId: 'admin'
      });

      toast.success('Notice created successfully');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', courseId: '', content: '' });
      fetchInitialData();
    } catch (error) {
      console.error('Error creating notice:', error);
      toast.error(error.response?.data?.msg || 'Failed to create notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      await api.delete(`/admin/notices/${id}`);
      toast.success('Notice deleted successfully');
      fetchInitialData();
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice');
    }
  };

  const openViewModal = (notice) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton className="mb-4" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary font-heading">Notices Management</h1>
              <p className="text-text-secondary">Create and manage institutional notices</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center">
              <FaPlus className="mr-2" /> Create Notice
            </Button>
          </div>

          {/* Notices List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-secondary font-heading">Recent Notices</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center py-8 text-text-muted" colSpan={4}>
                      No notices found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  notices.map((notice) => (
                    <TableRow key={notice._id}>
                      <TableCell>
                        <div className="flex items-center">
                          <FaBell className="text-primary mr-3" />
                          <div>
                            <p className="font-medium text-secondary">{notice.title}</p>
                            <p className="text-sm text-text-muted truncate max-w-xs">{notice.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {notice.courseId?.courseName || 'All Courses'}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <button onClick={() => openViewModal(notice)} className="text-primary hover:text-primary/80"><FaEye /></button>
                          <button onClick={() => handleDelete(notice._id)} className="text-danger hover:text-danger/80"><FaTrash /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Create New Notice</h2>
                  <button onClick={() => setShowCreateModal(false)} className="text-text-secondary hover:text-secondary">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter notice title..."
                  />

                  <Select
                    label="Target Course"
                    value={formData.courseId}
                    onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select Course</SelectItem>
                      {courses.map(course => (
                        <SelectItem key={course._id} value={course._id}>{course.courseName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      placeholder="Enter notice content..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button onClick={handleCreate}>Create Notice</Button>
                </div>
              </div>
            </div>
          )}

          {/* View Modal */}
          {showViewModal && selectedNotice && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Notice Details</h2>
                  <button onClick={() => setShowViewModal(false)} className="text-text-secondary hover:text-secondary">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-secondary">{selectedNotice.title}</h3>
                    <p className="text-sm text-text-muted">
                      Posted on: {new Date(selectedNotice.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-primary/10 text-primary">
                      {selectedNotice.courseId?.courseName || 'All Courses'}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-secondary whitespace-pre-wrap leading-relaxed">
                      {selectedNotice.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={() => setShowViewModal(false)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticesManagement;