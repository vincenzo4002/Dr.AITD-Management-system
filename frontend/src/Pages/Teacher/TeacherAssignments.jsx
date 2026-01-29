import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaPlus, FaCalendarAlt, FaUsers, FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-toastify';

const TeacherAssignments = () => {
  const { id: teacherId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    deadline: '',
    maxMarks: '',
    submissionType: 'online'
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const fetchData = async () => {
    try {
      const [assignmentsRes, dashboardRes] = await Promise.all([
        api.get(`/api/teacher/${teacherId}/assignments`),
        api.get(`/api/teacher/${teacherId}/dashboard`)
      ]);
      const assignmentsData = assignmentsRes.data.assignments || [];
      setAllAssignments(assignmentsData);
      setAssignments(assignmentsData);
      setSubjects(dashboardRes.data.teacher?.assignedSubjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterSubject) {
      setAssignments(allAssignments.filter(a => a.subjectId?._id === filterSubject));
    } else {
      setAssignments(allAssignments);
    }
  }, [filterSubject, allAssignments]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('subjectId', formData.subjectId);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('deadline', formData.deadline);
      data.append('maxMarks', formData.maxMarks);
      data.append('submissionType', formData.submissionType);

      if (file) {
        data.append('file', file);
      }

      await api.post(`/api/teacher/${teacherId}/assignments`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Assignment created successfully!');
      setShowModal(false);
      setFormData({
        subjectId: '',
        title: '',
        description: '',
        deadline: '',
        maxMarks: '',
        submissionType: 'online'
      });
      setFile(null);
      fetchData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading assignments..." />;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary font-heading">My Assignments</h1>
            <p className="text-text-secondary mt-1">Create and manage student assignments</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <FaPlus /> Create Assignment
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8 border border-gray-200">
          <CardContent className="p-4">
            <Select
              label="Filter by Subject"
              value={filterSubject}
              onValueChange={setFilterSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.subjectName} ({subject.subjectCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(assignment => (
            <Card key={assignment._id} className="hover:shadow-lg transition-shadow border border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">{assignment.subjectId?.subjectName}</Badge>
                  <Badge variant={assignment.submissionType === 'online' ? 'primary' : 'secondary'}>
                    {assignment.submissionType}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-secondary mb-2 font-heading">{assignment.title}</h3>
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">{assignment.description}</p>

                <div className="space-y-2 text-sm text-text-secondary mb-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" />
                    <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-secondary" />
                    <span>Total Students: {assignment.totalStudents || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-success" />
                    <span>Submitted: {assignment.submittedCount || 0}</span>
                  </div>
                  {assignment.maxMarks && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Max Marks:</span> {assignment.maxMarks}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <Button variant="outline" size="sm">View Submissions</Button>
                  {assignment.fileUrl && (
                    <a
                      href={assignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <FaFileAlt />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-text-secondary text-lg">No assignments created yet</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-secondary font-heading">Create New Assignment</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Select
                label="Subject"
                value={formData.subjectId}
                onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select Subject</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.subjectName} ({subject.subjectCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Assignment Title"
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
                <Input
                  label="Max Marks"
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                  placeholder="e.g. 100"
                />
              </div>

              <Select
                label="Submission Type"
                value={formData.submissionType}
                onValueChange={(value) => setFormData({ ...formData, submissionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Submission Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Upload</SelectItem>
                  <SelectItem value="offline">Offline Submission</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting} className="flex-1">
                  Create Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
