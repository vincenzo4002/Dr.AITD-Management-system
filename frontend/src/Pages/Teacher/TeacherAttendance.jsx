import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import { FaCalendarAlt, FaCheck, FaTimes, FaSave } from 'react-icons/fa';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

const TeacherAttendance = () => {
  const { id: teacherId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [teacherId]);

  useEffect(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      fetchStudents();
    } else if (selectedSubject === 'all') {
      setStudents([]);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get(`/api/teacher/${teacherId}/dashboard`);
      setSubjects(response.data.teacher?.assignedSubjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/teacher/${teacherId}/subjects/${selectedSubject}/students`
      );
      setStudents(response.data.students || []);
      const initialAttendance = {};
      response.data.students.forEach(student => {
        initialAttendance[student._id] = 'Present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubject === 'all') {
      alert('Please select a specific subject to mark attendance');
      return;
    }
    setSubmitting(true);
    try {
      const attendanceData = Object.keys(attendance).map(studentId => ({
        studentId,
        status: attendance[studentId]
      }));

      await api.post(
        `/api/teacher/${teacherId}/attendance`,
        { subjectId: selectedSubject, date, attendance: attendanceData }
      );
      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary font-heading">Mark Attendance</h1>
          <p className="text-text-secondary">Record daily attendance for your classes</p>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Select
              label="Select Subject"
              value={selectedSubject}
              onValueChange={setSelectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Select Subject --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Select Subject --</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.subjectName} ({subject.subjectCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              icon={FaCalendarAlt}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : selectedSubject === 'all' ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-text-secondary">Please select a subject to view student list</p>
            </div>
          ) : selectedSubject && students.length > 0 ? (
            <form onSubmit={handleSubmit}>
              <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">{student.rollNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-4">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${attendance[student._id] === 'Present'
                              ? 'bg-primary/10 text-primary ring-2 ring-primary'
                              : 'bg-background text-text-secondary hover:bg-gray-100'
                              }`}>
                              <input
                                type="radio"
                                name={`attendance-${student._id}`}
                                checked={attendance[student._id] === 'Present'}
                                onChange={() => handleAttendanceChange(student._id, 'Present')}
                                className="hidden"
                              />
                              <FaCheck size={14} />
                              <span className="font-medium">Present</span>
                            </label>

                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${attendance[student._id] === 'Absent'
                              ? 'bg-danger/10 text-danger ring-2 ring-danger'
                              : 'bg-background text-text-secondary hover:bg-gray-100'
                              }`}>
                              <input
                                type="radio"
                                name={`attendance-${student._id}`}
                                checked={attendance[student._id] === 'Absent'}
                                onChange={() => handleAttendanceChange(student._id, 'Absent')}
                                className="hidden"
                              />
                              <FaTimes size={14} />
                              <span className="font-medium">Absent</span>
                            </label>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={submitting}
                  className="w-full sm:w-auto"
                >
                  <FaSave className="mr-2" />
                  Submit Attendance
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-text-secondary">No students found for this subject</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAttendance;
