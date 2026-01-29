import React, { useState } from 'react';
import { FaClipboardList, FaCalendarAlt, FaDownload, FaSearch, FaTimes, FaEdit, FaEye, FaCheck } from 'react-icons/fa';
import AdminHeader from '../../components/AdminHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const AttendanceManagement = () => {
  const [attendanceData, setAttendanceData] = useState([
    { id: 1, student: 'Gulshan ', rollNo: 'CS001', course: 'Computer Science', present: 85, total: 100, percentage: 85, status: 'Present' },
    { id: 2, student: 'Ankita', rollNo: 'ME002', course: 'Mechanical Eng.', present: 92, total: 100, percentage: 92, status: 'Present' },
    { id: 3, student: 'Aditya', rollNo: 'BA003', course: 'Business Admin', present: 78, total: 100, percentage: 78, status: 'Absent' },
    { id: 4, student: 'Abhishek', rollNo: 'CS004', course: 'Computer Science', present: 88, total: 100, percentage: 88, status: 'Present' },
    { id: 5, student: 'Krishana', rollNo: 'ME005', course: 'Mechanical Eng.', present: 65, total: 100, percentage: 65, status: 'Present' }
  ]);

  const [showMarkModal, setShowMarkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const [markAttendanceData, setMarkAttendanceData] = useState([
    { id: 1, student: 'Gulshan ', rollNo: 'CS001', course: 'Computer Science', status: 'Present' },
    { id: 2, student: 'Ankita', rollNo: 'ME002', course: 'Mechanical Eng.', status: 'Present' },
    { id: 3, student: 'Aditya', rollNo: 'BA003', course: 'Business Admin', status: 'Absent' },
    { id: 4, student: 'Abhishek', rollNo: 'CS004', course: 'Computer Science', status: 'Present' },
    { id: 5, student: 'Krishana', rollNo: 'ME005', course: 'Mechanical Eng.', status: 'Present' }
  ]);

  // Helper functions
  const filteredData = attendanceData.filter(record => {
    const matchesSearch = record.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'All Courses' || record.course === selectedCourse;
    const matchesStatus = selectedStatus === 'All Status' ||
      (selectedStatus === 'Good (Above 80%)' && record.percentage >= 80) ||
      (selectedStatus === 'Average (60-80%)' && record.percentage >= 60 && record.percentage < 80) ||
      (selectedStatus === 'Poor (Below 60%)' && record.percentage < 60);
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Roll No,Student Name,Course,Present Days,Total Days,Percentage,Status\n" +
      filteredData.map(record =>
        `${record.rollNo},${record.student},${record.course},${record.present},${record.total},${record.percentage}%,${record.percentage >= 80 ? 'Good' : record.percentage >= 60 ? 'Average' : 'Poor'}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateAttendanceStatus = (studentId, status) => {
    setMarkAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const saveAttendance = () => {
    alert('Attendance saved successfully!');
    setShowMarkModal(false);
  };

  const viewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const editAttendance = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const saveEditedAttendance = () => {
    const updatedPercentage = Math.round((selectedStudent.present / selectedStudent.total) * 100);
    setAttendanceData(prev =>
      prev.map(record =>
        record.id === selectedStudent.id
          ? { ...selectedStudent, percentage: updatedPercentage }
          : record
      )
    );
    alert('Attendance updated successfully!');
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton className="mb-4" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary font-heading">Attendance Management</h1>
              <p className="text-text-secondary">Monitor and manage student attendance</p>
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
                onClick={() => setShowMarkModal(true)}
                className="flex items-center space-x-2"
              >
                <FaCalendarAlt />
                <span>Mark Attendance</span>
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaClipboardList className="text-3xl text-success mr-4" />
                <div>
                  <p className="text-text-secondary">Average Attendance</p>
                  <p className="text-2xl font-bold text-secondary">85%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaClipboardList className="text-3xl text-primary mr-4" />
                <div>
                  <p className="text-text-secondary">Present Today</p>
                  <p className="text-2xl font-bold text-secondary">1,082</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaClipboardList className="text-3xl text-danger mr-4" />
                <div>
                  <p className="text-text-secondary">Absent Today</p>
                  <p className="text-2xl font-bold text-secondary">163</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <FaClipboardList className="text-3xl text-warning mr-4" />
                <div>
                  <p className="text-text-secondary">Low Attendance</p>
                  <p className="text-2xl font-bold text-secondary">45</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                icon={FaSearch}
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option>All Courses</option>
                <option>Computer Science</option>
                <option>Mechanical Engineering</option>
                <option>Business Administration</option>
              </Select>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option>All Status</option>
                <option>Good (Above 80%)</option>
                <option>Average (60-80%)</option>
                <option>Poor (Below 60%)</option>
              </Select>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Present Days</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium text-secondary">{record.rollNo}</TableCell>
                    <TableCell className="font-medium text-secondary">{record.student}</TableCell>
                    <TableCell>{record.course}</TableCell>
                    <TableCell>{record.present}</TableCell>
                    <TableCell>{record.total}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${record.percentage >= 80 ? 'bg-success' :
                              record.percentage >= 60 ? 'bg-warning' : 'bg-danger'
                              }`}
                            style={{ width: `${record.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-text-secondary">{record.percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.percentage >= 80 ? 'bg-success/10 text-success' :
                        record.percentage >= 60 ? 'bg-warning/10 text-warning' :
                          'bg-danger/10 text-danger'
                        }`}>
                        {record.percentage >= 80 ? 'Good' : record.percentage >= 60 ? 'Average' : 'Poor'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        <button
                          onClick={() => viewDetails(record)}
                          className="text-primary hover:text-primary/80 mr-3 flex items-center"
                        >
                          <FaEye className="mr-1" /> View
                        </button>
                        <button
                          onClick={() => editAttendance(record)}
                          className="text-success hover:text-success/80 flex items-center"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mark Attendance Modal */}
          {showMarkModal && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Mark Attendance - {selectedDate}</h2>
                  <button
                    onClick={() => setShowMarkModal(false)}
                    className="text-text-secondary hover:text-secondary"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="mb-4">
                  <Input
                    label="Select Date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Roll No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Student Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Course</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {markAttendanceData.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap font-medium text-secondary">{student.rollNo}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-secondary">{student.student}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-secondary">{student.course}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'Present')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${student.status === 'Present'
                                  ? 'bg-success text-white'
                                  : 'bg-gray-100 text-secondary hover:bg-success/20'
                                  }`}
                              >
                                <FaCheck className="inline mr-1" /> Present
                              </button>
                              <button
                                onClick={() => updateAttendanceStatus(student.id, 'Absent')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${student.status === 'Absent'
                                  ? 'bg-danger text-white'
                                  : 'bg-gray-100 text-secondary hover:bg-danger/20'
                                  }`}
                              >
                                <FaTimes className="inline mr-1" /> Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowMarkModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveAttendance}
                  >
                    Save Attendance
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Attendance Modal */}
          {showEditModal && selectedStudent && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl border border-gray-200 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Edit Attendance - {selectedStudent.student}</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-text-secondary hover:text-secondary"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Student Name"
                    type="text"
                    value={selectedStudent.student}
                    disabled
                    className="bg-gray-50"
                  />

                  <Input
                    label="Present Days"
                    type="number"
                    value={selectedStudent.present}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, present: parseInt(e.target.value) })}
                  />

                  <Input
                    label="Total Days"
                    type="number"
                    value={selectedStudent.total}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, total: parseInt(e.target.value) })}
                  />

                  <Input
                    label="Attendance Percentage"
                    type="text"
                    value={`${Math.round((selectedStudent.present / selectedStudent.total) * 100)}%`}
                    disabled
                    className="bg-gray-50"
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
                    onClick={saveEditedAttendance}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View Details Modal */}
          {showDetailsModal && selectedStudent && (
            <div className="fixed inset-0 bg-secondary/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl border border-gray-200 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-secondary font-heading">Attendance Details - {selectedStudent.student}</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-text-secondary hover:text-secondary"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-secondary mb-2">Student Information</h3>
                    <p className="text-text-secondary"><strong>Name:</strong> {selectedStudent.student}</p>
                    <p className="text-text-secondary"><strong>Roll No:</strong> {selectedStudent.rollNo}</p>
                    <p className="text-text-secondary"><strong>Course:</strong> {selectedStudent.course}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-secondary mb-2">Attendance Summary</h3>
                    <p className="text-text-secondary"><strong>Present Days:</strong> {selectedStudent.present}</p>
                    <p className="text-text-secondary"><strong>Total Days:</strong> {selectedStudent.total}</p>
                    <p className="text-text-secondary"><strong>Percentage:</strong> {selectedStudent.percentage}%</p>
                    <p className="text-text-secondary"><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedStudent.percentage >= 80 ? 'bg-success/10 text-success' :
                        selectedStudent.percentage >= 60 ? 'bg-warning/10 text-warning' :
                          'bg-danger/10 text-danger'
                        }`}>
                        {selectedStudent.percentage >= 80 ? 'Good' : selectedStudent.percentage >= 60 ? 'Average' : 'Poor'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                  <h3 className="font-semibold text-secondary mb-3">Recent Attendance (Last 10 Days)</h3>
                  <div className="grid grid-cols-10 gap-2">
                    {[...Array(10)].map((_, index) => (
                      <div key={index} className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${Math.random() > 0.2 ? 'bg-success' : 'bg-danger'
                          }`}>
                          {Math.random() > 0.2 ? 'P' : 'A'}
                        </div>
                        <div className="text-xs text-text-muted mt-1">
                          {new Date(Date.now() - (9 - index) * 24 * 60 * 60 * 1000).getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowDetailsModal(false)}
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

export default AttendanceManagement;