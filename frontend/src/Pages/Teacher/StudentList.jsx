import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/subjects');
      if (response.data.success && response.data.subjects.length > 0) {
        setSubjects(response.data.subjects);
        setSelectedSubject(response.data.subjects[0]._id);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const subject = subjects.find(s => s._id === selectedSubject);

      if (!subject) {
        setLoading(false);
        return;
      }

      const response = await api.get('/api/admin/students');

      if (response.data.success) {
        const allStudents = response.data.students;
        const subjectCourseId = typeof subject.courseId === 'object' ? subject.courseId._id : subject.courseId;

        const filteredStudents = allStudents
          .filter(student => {
            const studentCourseId = typeof student.courseId === 'object' ? student.courseId._id : student.courseId;
            return studentCourseId === subjectCourseId;
          })
          .map(student => ({ ...student, status: 'Present' }));

        setStudents(filteredStudents);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(student =>
      student._id === studentId ? { ...student, status } : student
    ));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubject || students.length === 0) {
      toast.error('Please select a subject and ensure students are loaded');
      return;
    }

    const teacherId = localStorage.getItem('userId');
    if (!teacherId) {
      toast.error("Teacher ID missing. Please log in again.");
      return;
    }

    setSaving(true);

    try {
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: student.status
      }));

      // CORRECT ROUTE + CORRECT BODY
      const response = await api.post('/api/teacher/admin/attendance', {
        teacherId,
        subjectId: selectedSubject,
        date: selectedDate,
        attendance: attendanceData
      });

      if (response.data.success) {
        toast.success('Attendance saved successfully!');
      } else {
        toast.error(response.data.msg || 'Failed to save attendance');
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };


  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'Present' })));
  };

  const markAllAbsent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'Absent' })));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-secondary font-heading">Student Attendance</h1>
            <p className="text-text-secondary mt-2">Mark attendance for all students</p>
          </div>

          <Card className="border border-gray-200 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Select
                  label="Subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subjectName} ({subject.subjectCode})
                    </option>
                  ))}
                </Select>

                <Input
                  label="Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={markAllPresent}
                  variant="success"
                >
                  Mark All Present
                </Button>
                <Button
                  onClick={markAllAbsent}
                  variant="danger"
                >
                  Mark All Absent
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner message="Loading students..." />
            </div>
          ) : (
            <>
              <Card className="border border-gray-200 overflow-hidden mb-6">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase font-heading">
                          Roll No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase font-heading">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase font-heading">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase font-heading">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase font-heading">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                            {student.rollNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-secondary">{student.name}</div>
                            <div className="text-sm text-text-secondary">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                            {student.courseId?.courseName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'Present'
                              ? 'bg-success/10 text-success'
                              : 'bg-danger/10 text-danger'
                              }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusChange(student._id, 'Present')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${student.status === 'Present'
                                  ? 'bg-success text-white'
                                  : 'bg-success/10 text-success hover:bg-success/20'
                                  }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleStatusChange(student._id, 'Absent')}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${student.status === 'Absent'
                                  ? 'bg-danger text-white'
                                  : 'bg-danger/10 text-danger hover:bg-danger/20'
                                  }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 mb-6">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-6 text-sm">
                      <span className="text-text-secondary">Total Students: <span className="font-semibold text-secondary">{students.length}</span></span>
                      <span className="text-success">Present: <span className="font-semibold">{students.filter(s => s.status === 'Present').length}</span></span>
                      <span className="text-danger">Absent: <span className="font-semibold">{students.filter(s => s.status === 'Absent').length}</span></span>
                    </div>
                    <Button
                      onClick={handleSaveAttendance}
                      disabled={saving}
                      isLoading={saving}
                      className="px-6"
                    >
                      {saving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentList;
