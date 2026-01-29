import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import { FaBell, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

const TeacherNotices = () => {
  const { id: teacherId } = useParams();
  const [notices, setNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [filterCourse, setFilterCourse] = useState('all');
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const fetchData = async () => {
    try {
      const [noticesRes, dashboardRes] = await Promise.all([
        api.get(`/api/teacher/${teacherId}/notices`),
        api.get(`/api/teacher/${teacherId}/dashboard`)
      ]);
      const noticesData = noticesRes.data.notices || [];
      setAllNotices(noticesData);
      setNotices(noticesData);
      setSubjects(dashboardRes.data.teacher?.assignedSubjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterCourse && filterCourse !== 'all') {
      setNotices(allNotices.filter(n => n.courseId?._id === filterCourse));
    } else {
      setNotices(allNotices);
    }
  }, [filterCourse, allNotices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/teacher/${teacherId}/notices`, formData);
      alert('Notice sent successfully!');
      setShowModal(false);
      setFormData({ courseId: '', title: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error sending notice:', error);
      alert('Failed to send notice');
    }
  };

  if (loading) return <LoadingSpinner message="Loading notices..." />;

  // Get unique courses from subjects for the filter
  const uniqueCourses = Array.from(new Set(subjects.map(s => s.courseId?._id)))
    .map(id => {
      const subject = subjects.find(s => s.courseId?._id === id);
      return subject?.courseId;
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary font-heading">My Notices</h1>
          <p className="text-text-secondary">Manage and post notices for your classes</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <FaPlus className="mr-2" /> Create Notice
        </Button>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="max-w-md">
            <Select
              label="Filter by Course"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {uniqueCourses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.courseName}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {notices.length > 0 ? notices.map(notice => (
          <Card key={notice._id} className="hover:shadow-md transition-shadow border border-gray-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-secondary font-heading">{notice.title}</h3>
                  <p className="text-sm text-primary font-medium">
                    Course: {notice.courseId?.courseName || 'All'}
                  </p>
                </div>
                <span className="text-sm text-text-secondary flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-text-secondary">{notice.description}</p>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <FaBell className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <p className="text-text-secondary text-lg">No notices found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 font-heading text-secondary">Create Notice</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Course/Subject"
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
              >
                <option value="">-- Select Course --</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject.courseId?._id || ''}>
                    {subject.courseId?.courseName} - {subject.subjectName}
                  </option>
                ))}
              </Select>

              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  rows="3"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Send
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherNotices;
