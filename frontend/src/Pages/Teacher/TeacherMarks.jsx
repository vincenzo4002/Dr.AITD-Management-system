import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import { FaPlus, FaTrophy, FaChartLine } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const TeacherMarks = () => {
  const { id: teacherId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [students, setStudents] = useState([]);
  const [studentMarks, setStudentMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    marks: '',
    totalMarks: '',
    examType: 'Mid-Term'
  });

  useEffect(() => {
    fetchSubjects();
  }, [teacherId]);

  useEffect(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      fetchStudentsAndMarks();
    } else if (selectedSubject === 'all') {
      setStudents([]);
      setStudentMarks([]);
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

  const fetchStudentsAndMarks = async () => {
    setLoading(true);
    try {
      console.log('Fetching students for subject:', selectedSubject);
      const [studentsRes, marksRes] = await Promise.all([
        api.get(`/api/teacher/${teacherId}/subjects/${selectedSubject}/students`),
        api.get(`/api/teacher/${teacherId}/marks/${selectedSubject}`)
      ]);
      console.log('Students fetched:', studentsRes.data.students);
      setStudents(studentsRes.data.students || []);
      setStudentMarks(marksRes.data.studentMarks || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubject === 'all') {
      alert('Please select a specific subject to add marks');
      return;
    }
    try {
      await api.post(
        `/teacher/${teacherId}/marks`,
        { ...formData, subjectId: selectedSubject }
      );
      alert('Marks added successfully!');
      setShowModal(false);
      setFormData({ studentId: '', marks: '', totalMarks: '', examType: 'Mid-Term' });
      fetchStudentsAndMarks();
    } catch (error) {
      console.error('Error adding marks:', error);
      alert('Failed to add marks');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary font-heading">Manage Marks</h1>
          <p className="text-text-secondary">Record and track student performance</p>
        </div>
        {selectedSubject && selectedSubject !== 'all' && (
          <Button onClick={() => setShowModal(true)}>
            <FaPlus className="mr-2" /> Add Marks
          </Button>
        )}
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="max-w-md">
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
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner message="Loading marks..." />
      ) : selectedSubject === 'all' ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FaChartLine className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <p className="text-text-secondary text-lg">Please select a subject to view marks</p>
        </div>
      ) : selectedSubject && studentMarks.length > 0 ? (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Total Marks</TableHead>
                <TableHead className="text-center">Total Possible</TableHead>
                <TableHead className="text-center">Percentage</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {studentMarks.map((sm) => (
                <TableRow key={sm.student._id}>
                  <TableCell className="font-medium">{sm.student.rollNo}</TableCell>
                  <TableCell>{sm.student.name}</TableCell>
                  <TableCell className="text-center font-bold">{sm.totalMarks}</TableCell>
                  <TableCell className="text-center">{sm.totalPossible}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${sm.percentage >= 75 ? 'bg-primary/10 text-primary' :
                        sm.percentage >= 50 ? 'bg-secondary/10 text-secondary' :
                          'bg-gray-100 text-text-secondary'
                        }`}
                    >
                      {sm.percentage}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : selectedSubject && selectedSubject !== 'all' ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-text-secondary">No marks recorded yet for this subject</p>
        </div>
      ) : null}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 font-heading text-secondary">Add Marks</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Student"
                value={formData.studentId}
                onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Select Student --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Select Student --</SelectItem>
                  {students.map(student => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name} ({student.rollNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                label="Exam Type"
                value={formData.examType}
                onValueChange={(value) => setFormData({ ...formData, examType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                  <SelectItem value="End-Term">End-Term</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>

              <Input
                label="Marks Obtained"
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                min="0"
                required
              />

              <Input
                label="Total Marks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                min="0"
                required
              />

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Marks
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMarks;
