import React, { useState, useEffect } from 'react';
import { FaClipboardCheck, FaPlus, FaCalendarAlt, FaEdit, FaEye, FaDownload, FaTimes, FaSearch, FaClock, FaUsers } from 'react-icons/fa';
import AdminHeader from '../../components/AdminHeader';
import BackButton from '../../components/BackButton';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const ExamManagement = () => {
  const [exams, setExams] = useState([
    { id: 1, name: 'Mid-Term Exam', course: 'Computer Science', subject: 'Data Structures', date: '2024-02-15', time: '10:00 AM', duration: '3 hours', room: 'Room 101', status: 'Scheduled', students: 45 },
    { id: 2, name: 'Final Exam', course: 'Mechanical Eng.', subject: 'Thermodynamics', date: '2024-03-20', time: '2:00 PM', duration: '3 hours', room: 'Room 205', status: 'Scheduled', students: 38 },
    { id: 3, name: 'Unit Test', course: 'Business Admin', subject: 'Marketing', date: '2024-01-25', time: '11:00 AM', duration: '2 hours', room: 'Room 301', status: 'Completed', students: 42 },
    { id: 4, name: 'Quiz 1', course: 'Computer Science', subject: 'Algorithms', date: '2024-02-10', time: '9:00 AM', duration: '1 hour', room: 'Room 102', status: 'Completed', students: 40 },
    { id: 5, name: 'Practical Exam', course: 'Mechanical Eng.', subject: 'Workshop', date: '2024-02-28', time: '1:00 PM', duration: '4 hours', room: 'Lab 1', status: 'Scheduled', students: 35 }
  ]);

  const [results] = useState([
    { examId: 1, student: 'John Doe', rollNo: 'CS001', marks: 85, grade: 'A', status: 'Pass' },
    { examId: 1, student: 'Jane Smith', rollNo: 'CS002', marks: 92, grade: 'A+', status: 'Pass' },
    { examId: 3, student: 'Mike Johnson', rollNo: 'BA003', marks: 78, grade: 'B+', status: 'Pass' }
  ]);

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        api.get('/api/courses'),
        api.get('/api/subjects')
      ]);

      setCourses(coursesRes.data.courses || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback or silent fail if endpoints don't exist yet/mock mode
    }
  };

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const [newExam, setNewExam] = useState({
    name: '', course: '', subject: '', date: '', time: '', duration: '', room: '', students: 0
  });

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || exam.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Exam Name,Course,Subject,Date,Time,Duration,Room,Students,Status\n" +
      filteredExams.map(exam =>
        `"${exam.name}",${exam.course},${exam.subject},${exam.date},${exam.time},${exam.duration},${exam.room},${exam.students},${exam.status}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exam_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scheduleExam = () => {
    const exam = {
      id: exams.length + 1,
      ...newExam,
      status: 'Scheduled'
    };
    setExams([...exams, exam]);
    setNewExam({ name: '', course: '', subject: '', date: '', time: '', duration: '', room: '', students: 0 });
    setShowScheduleModal(false);
    toast.success('Exam scheduled successfully!');
  };

  const viewDetails = (exam) => {
    setSelectedExam(exam);
    setShowDetailsModal(true);
  };

  const editExam = (exam) => {
    setSelectedExam(exam);
    setShowEditModal(true);
  };

  const saveEditedExam = () => {
    setExams(exams.map(exam => exam.id === selectedExam.id ? selectedExam : exam));
    setShowEditModal(false);
    toast.success('Exam updated successfully!');
  };

  const viewResults = (exam) => {
    setSelectedExam(exam);
    setShowResultsModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton className="mb-4" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary font-heading">Exam Management</h1>
              <p className="text-text-secondary">Schedule and manage examinations</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={exportReport}
                className="flex items-center space-x-2"
              >
                <FaDownload />
                <span>Export Report</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FaCalendarAlt />
                <span>Exam Calendar</span>
              </Button>
              <Button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center space-x-2"
              >
                <FaPlus />
                <span>Schedule Exam</span>
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaClipboardCheck className="text-3xl text-primary mr-4" />
                <div>
                  <p className="text-text-secondary">Total Exams</p>
                  <p className="text-2xl font-bold text-secondary">{exams.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaClipboardCheck className="text-3xl text-primary mr-4" />
                <div>
                  <p className="text-text-secondary">Completed</p>
                  <p className="text-2xl font-bold text-secondary">{exams.filter(exam => exam.status === 'Completed').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaClipboardCheck className="text-secondary mr-4 text-3xl" />
                <div>
                  <p className="text-text-secondary">Scheduled</p>
                  <p className="text-2xl font-bold text-secondary">{exams.filter(exam => exam.status === 'Scheduled').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaUsers className="text-3xl text-primary mr-4" />
                <div>
                  <p className="text-text-secondary">Total Students</p>
                  <p className="text-2xl font-bold text-secondary">{exams.reduce((sum, exam) => sum + exam.students, 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exam List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Exam Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaClipboardCheck className="text-primary mr-3" />
                          <span className="font-medium text-secondary">{exam.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{exam.course}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{exam.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{exam.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{exam.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{exam.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-secondary">{exam.students}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${exam.status === 'Completed' ? 'bg-primary/10 text-primary' :
                          exam.status === 'Scheduled' ? 'bg-secondary/10 text-secondary' :
                            'bg-gray-100 text-text-secondary'
                          }`}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewDetails(exam)}
                            className="text-primary hover:text-primary/80"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => editExam(exam)}
                            className="text-primary hover:text-primary/80"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => viewResults(exam)}
                            className="text-secondary hover:text-secondary/80"
                          >
                            <FaClipboardCheck />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule Exam Modal */}
          {showScheduleModal && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Schedule New Exam</h2>
                  <button onClick={() => setShowScheduleModal(false)} className="text-text-secondary hover:text-secondary">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Exam Name"
                    value={newExam.name}
                    onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                  />
                  <Select
                    label="Course"
                    value={newExam.course}
                    onValueChange={(value) => setNewExam({ ...newExam, course: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course._id} value={course.courseName}>
                          {course.courseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    label="Subject"
                    value={newExam.subject}
                    onValueChange={(value) => setNewExam({ ...newExam, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject._id} value={subject.subjectName}>
                          {subject.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    label="Date"
                    type="date"
                    value={newExam.date}
                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={newExam.time}
                    onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                  />
                  <Select
                    label="Duration"
                    value={newExam.duration}
                    onValueChange={(value) => setNewExam({ ...newExam, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                      <SelectItem value="3 hours">3 hours</SelectItem>
                      <SelectItem value="4 hours">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    label="Room"
                    value={newExam.room}
                    onChange={(e) => setNewExam({ ...newExam, room: e.target.value })}
                  />
                  <Input
                    label="Expected Students"
                    type="number"
                    value={newExam.students}
                    onChange={(e) => setNewExam({ ...newExam, students: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={scheduleExam}
                  >
                    Schedule Exam
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View Details Modal */}
          {showDetailsModal && selectedExam && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Exam Details</h2>
                  <button onClick={() => setShowDetailsModal(false)} className="text-text-secondary hover:text-secondary">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-secondary mb-3">Exam Information</h3>
                    <p className="text-text-secondary"><strong>Name:</strong> {selectedExam.name}</p>
                    <p className="text-text-secondary"><strong>Course:</strong> {selectedExam.course}</p>
                    <p className="text-text-secondary"><strong>Subject:</strong> {selectedExam.subject}</p>
                    <p className="text-text-secondary"><strong>Room:</strong> {selectedExam.room}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-secondary mb-3">Schedule Details</h3>
                    <p className="text-text-secondary"><strong>Date:</strong> {selectedExam.date}</p>
                    <p className="text-text-secondary"><strong>Time:</strong> {selectedExam.time}</p>
                    <p className="text-text-secondary"><strong>Duration:</strong> {selectedExam.duration}</p>
                    <p className="text-text-secondary"><strong>Students:</strong> {selectedExam.students}</p>
                    <p className="text-text-secondary"><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedExam.status === 'Completed' ? 'bg-primary/10 text-primary' :
                        selectedExam.status === 'Scheduled' ? 'bg-secondary/10 text-secondary' :
                          'bg-gray-100 text-text-secondary'
                        }`}>
                        {selectedExam.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Exam Modal */}
          {showEditModal && selectedExam && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Edit Exam</h2>
                  <button onClick={() => setShowEditModal(false)} className="text-text-secondary hover:text-secondary">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Exam Name"
                    value={selectedExam.name}
                    onChange={(e) => setSelectedExam({ ...selectedExam, name: e.target.value })}
                  />
                  <Input
                    label="Date"
                    type="date"
                    value={selectedExam.date}
                    onChange={(e) => setSelectedExam({ ...selectedExam, date: e.target.value })}
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={selectedExam.time}
                    onChange={(e) => setSelectedExam({ ...selectedExam, time: e.target.value })}
                  />
                  <Input
                    label="Room"
                    value={selectedExam.room}
                    onChange={(e) => setSelectedExam({ ...selectedExam, room: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveEditedExam}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View Results Modal */}
          {showResultsModal && selectedExam && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Exam Results - {selectedExam.name}</h2>
                  <button onClick={() => setShowResultsModal(false)} className="text-text-secondary hover:text-secondary">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-secondary mb-3">Exam Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-text-secondary">
                    <p><strong>Course:</strong> {selectedExam.course}</p>
                    <p><strong>Subject:</strong> {selectedExam.subject}</p>
                    <p><strong>Date:</strong> {selectedExam.date}</p>
                    <p><strong>Duration:</strong> {selectedExam.duration}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Roll No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Student Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.filter(result => result.examId === selectedExam.id).map((result, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-text-secondary">{result.rollNo}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{result.student}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{result.marks}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{result.grade}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {result.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {results.filter(result => result.examId === selectedExam.id).length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-4 py-3 text-sm text-text-secondary text-center">No results available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setShowResultsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamManagement;