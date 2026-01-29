import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

const AttendanceUpload = ({ teacherId }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🚀 Fetch subjects on page load
  useEffect(() => {
    fetchSubjects();
  }, []);

  // 🚀 Fetch students when subject changes
  useEffect(() => {
    if (selectedSubject) fetchStudents();
  }, [selectedSubject]);

  // ===================== FETCH SUBJECTS =====================
  const fetchSubjects = async () => {
    try {
      const res = await api.get(`/api/teacher/${teacherId}/subjects`);
      setSubjects(res.data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  // ===================== FETCH STUDENTS =====================
  const fetchStudents = async () => {
    if (!selectedSubject) return;

    setLoading(true);
    try {
      const res = await api.get(
        `/api/teacher/${teacherId}/subjects/${selectedSubject}/students`
      );

      const studentList = res.data.students || [];
      setStudents(studentList);

      // Initialize attendance as Present for all
      const initial = {};
      studentList.forEach((s) => {
        initial[s._id] = 'Present';
      });

      setAttendance(initial);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // ===================== CHANGE STATUS =====================
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // ===================== SUBMIT ATTENDANCE =====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSubject || students.length === 0) {
      toast.error('Please select a subject and load students');
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        subjectId: selectedSubject,
        date: attendanceDate,
        attendance: Object.entries(attendance).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      };

      await api.post(`/api/teacher/${teacherId}/attendance`, data);

      toast.success('Attendance submitted successfully!');

      // Reset Form
      setSelectedSubject('');
      setStudents([]);
      setAttendance({});
      setAttendanceDate(new Date().toISOString().split('T')[0]);

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // ===================== MARK ALL =====================
  const markAllPresent = () => {
    const obj = {};
    students.forEach((s) => (obj[s._id] = 'Present'));
    setAttendance(obj);
  };

  const markAllAbsent = () => {
    const obj = {};
    students.forEach((s) => (obj[s._id] = 'Absent'));
    setAttendance(obj);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-secondary font-heading">Mark Attendance</h1>

      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* SUBJECT DROPDOWN */}
              <Select
                label="Subject *"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.subjectName} ({subject.subjectCode})
                  </option>
                ))}
              </Select>

              {/* DATE */}
              <Input
                label="Date *"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                required
              />

            </div>

            {/* LOADING SPINNER */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner message="Loading students..." />
              </div>
            )}

            {/* STUDENT LIST */}
            {students.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-secondary font-heading">
                    <FaUsers className="inline mr-2" />
                    Students ({students.length})
                  </h3>
                  <div className="space-x-2">
                    <Button type="button" onClick={markAllPresent} variant="success" className="text-sm">
                      Mark All Present
                    </Button>
                    <Button type="button" onClick={markAllAbsent} variant="danger" className="text-sm">
                      Mark All Absent
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {students.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-secondary">{student.name}</p>
                        <p className="text-sm text-text-secondary">Roll No: {student.rollNo}</p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAttendanceChange(student._id, 'Present')}
                          className={`px-3 py-2 rounded-lg flex items-center transition-colors ${attendance[student._id] === 'Present'
                            ? 'bg-success text-white'
                            : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                            }`}
                        >
                          <FaCheck className="mr-1" /> Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAttendanceChange(student._id, 'Absent')}
                          className={`px-3 py-2 rounded-lg flex items-center transition-colors ${attendance[student._id] === 'Absent'
                            ? 'bg-danger text-white'
                            : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                            }`}
                        >
                          <FaTimes className="mr-1" /> Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center"
                  isLoading={submitting}
                >
                  {!submitting && <FaCalendarAlt className="mr-2" />}
                  {submitting ? "Submitting..." : "Submit Attendance"}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceUpload;
