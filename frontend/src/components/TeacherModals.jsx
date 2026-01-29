import React, { useState, useEffect } from 'react';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/Select';
import { FaTimes } from 'react-icons/fa';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

export const AttendanceModal = ({ isOpen, onClose, teacherId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const subjectsRes = await api.get('/api/subjects');

      if (subjectsRes.data.success) {
        setSubjects(subjectsRes.data.subjects);
        if (subjectsRes.data.subjects.length > 0) {
          const firstSubject = subjectsRes.data.subjects[0];
          setSelectedSubject(firstSubject._id);
          fetchStudentsBySubject(firstSubject._id);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStudentsBySubject = async (subjectId) => {
    try {
      const subject = subjects.find(s => s._id === subjectId) ||
        await api.get('/api/subjects')
          .then(res => res.data.subjects.find(s => s._id === subjectId));

      if (subject) {
        const studentsRes = await api.get('/api/admin/students');

        if (studentsRes.data.success) {
          const filteredStudents = studentsRes.data.students
            .filter(student => student.courseId._id === subject.courseId)
            .map(student => ({ ...student, status: 'Present' }));
          setStudents(filteredStudents);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    fetchStudentsBySubject(subjectId);
  };

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(student =>
      student._id === studentId ? { ...student, status } : student
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: student.status
      }));

      await api.post(`/api/teacher/${teacherId}/attendance`, {
        subjectId: selectedSubject,
        date: selectedDate,
        attendance: attendanceData
      });

      toast.success('Attendance saved successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Mark Attendance</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Subject</label>
          <div className="mb-4">
            <Select
              value={selectedSubject}
              onValueChange={handleSubjectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.subjectName} ({subject.subjectCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {students.map(student => (
            <div key={student._id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={student.status === 'Present'}
                  onChange={(e) => handleStatusChange(student._id, e.target.checked ? 'Present' : 'Absent')}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.rollNo}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${student.status === 'Present'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {student.status}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(student._id, 'Present')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${student.status === 'Present'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                      }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleStatusChange(student._id, 'Absent')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${student.status === 'Absent'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                      }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Total Students: {students.length}</span>
            <span className="text-green-600">Present: {students.filter(s => s.status === 'Present').length}</span>
            <span className="text-red-600">Absent: {students.filter(s => s.status === 'Absent').length}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AssignmentModal = ({ isOpen, onClose, teacherId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    subjectId: '',
    fileUrl: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState('link');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setUploadType('link');
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/subjects');
      if (response.data.success && response.data.subjects.length > 0) {
        setSubjects(response.data.subjects);
        setFormData({
          title: '',
          description: '',
          deadline: '',
          subjectId: response.data.subjects[0]._id,
          fileUrl: ''
        });
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a PDF file');
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.deadline || !formData.subjectId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (uploadType === 'link' && !formData.fileUrl) {
      toast.error('Please provide a file link');
      return;
    }

    if (uploadType === 'file' && !file) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {

      if (uploadType === 'file') {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('deadline', formData.deadline);
        formDataToSend.append('subjectId', formData.subjectId);
        formDataToSend.append('file', file);

        await api.post(`/api/teacher/${teacherId}/assignments`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post(`/api/teacher/${teacherId}/assignments`, formData);
      }

      toast.success('Assignment created successfully!');
      onClose();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error.response?.data?.msg || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Assignment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Assignment title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Subject</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.subjectName} - {subject.subjectCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Deadline</label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="link"
                  checked={uploadType === 'link'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                Link
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={uploadType === 'file'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                PDF Upload
              </label>
            </div>
          </div>

          {uploadType === 'link' ? (
            <div>
              <label className="block text-sm font-medium mb-2">File Link</label>
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="https://example.com/assignment.pdf"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Upload PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-lg"
              />
              {file && (
                <p className="text-sm text-green-600 mt-1">Selected: {file.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg h-24"
              placeholder="Assignment description"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const NoticeModal = ({ isOpen, onClose, teacherId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      if (response.data.success && response.data.courses.length > 0) {
        setCourses(response.data.courses);
        setFormData({
          title: '',
          description: '',
          courseId: response.data.courses[0]._id
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.courseId) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/teacher/${teacherId}/notices`, formData);

      toast.success('Notice posted successfully!');
      onClose();
    } catch (error) {
      console.error('Notice error:', error);
      toast.error(error.response?.data?.msg || 'Failed to post notice');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Post Notice</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Notice title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Course</label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Course</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.courseName} ({course.courseCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg h-32"
              placeholder="Notice description"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Notice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const MaterialModal = ({ isOpen, onClose, teacherId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    fileUrl: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState('link');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setUploadType('link');
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/subjects');
      if (response.data.success && response.data.subjects.length > 0) {
        setSubjects(response.data.subjects);
        setFormData({
          title: '',
          description: '',
          subjectId: response.data.subjects[0]._id,
          fileUrl: ''
        });
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a PDF file');
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.subjectId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (uploadType === 'link' && !formData.fileUrl) {
      toast.error('Please provide a file link');
      return;
    }

    if (uploadType === 'file' && !file) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {
      if (uploadType === 'file') {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('subjectId', formData.subjectId);
        formDataToSend.append('file', file);

        await api.post(`/api/teacher/${teacherId}/materials`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post(`/api/teacher/${teacherId}/materials`, formData);
      }

      toast.success('Material uploaded successfully!');
      onClose();
    } catch (error) {
      console.error('Material upload error:', error);
      toast.error(error.response?.data?.msg || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Material</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Material title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Subject</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.subjectName} - {subject.subjectCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="link"
                  checked={uploadType === 'link'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                Link
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={uploadType === 'file'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                PDF Upload
              </label>
            </div>
          </div>

          {uploadType === 'link' ? (
            <div>
              <label className="block text-sm font-medium mb-2">File Link</label>
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="https://example.com/material.pdf"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Upload PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-lg"
              />
              {file && (
                <p className="text-sm text-green-600 mt-1">Selected: {file.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg h-24"
              placeholder="Material description"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Material'}
          </button>
        </div>
      </div>
    </div>
  );
};
