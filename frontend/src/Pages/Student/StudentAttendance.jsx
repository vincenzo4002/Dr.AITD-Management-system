import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { FaClipboardList, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card, { CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentAttendance = () => {
  const { studentId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchAttendance();
  }, [studentId]);

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/attendance`);
      setAttendance(response.data.attendance || []);
      setStudentName(response.data.student?.name || '');
      calculateStats(response.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceData) => {
    const subjectStats = {};
    let totalPresent = 0;
    let totalClasses = attendanceData.length;

    attendanceData.forEach(record => {
      const subjectName = record.subjectId?.subjectName || 'Unknown';

      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { present: 0, total: 0 };
      }

      subjectStats[subjectName].total++;
      if (record.status === 'Present') {
        subjectStats[subjectName].present++;
        totalPresent++;
      }
    });

    // Calculate percentages
    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject];
      stats.percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;
    });

    const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : 0;

    setStats({
      subjects: subjectStats,
      overall: {
        present: totalPresent,
        total: totalClasses,
        percentage: overallPercentage
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading attendance..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <FaClipboardList className="text-3xl text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-secondary font-heading">My Attendance</h1>
            <p className="text-text-secondary">Track your attendance records and statistics</p>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-text-secondary mb-2">Overall Attendance</h3>
              <div className="text-3xl font-bold text-primary">{stats.overall?.percentage}%</div>
              <p className="text-text-muted">{stats.overall?.present}/{stats.overall?.total} classes</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-text-secondary mb-2">Present Days</h3>
              <div className="text-3xl font-bold text-success">{stats.overall?.present}</div>
              <p className="text-text-muted">Total present</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-text-secondary mb-2">Total Classes</h3>
              <div className="text-3xl font-bold text-secondary">{stats.overall?.total}</div>
              <p className="text-text-muted">Classes attended</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Stats */}
        {Object.keys(stats.subjects || {}).length > 0 && (
          <Card className="mb-8 border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-secondary mb-4 font-heading">Subject-wise Attendance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.subjects).map(([subject, data]) => (
                  <div key={subject} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <h3 className="font-medium text-secondary mb-2">{subject}</h3>
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${parseFloat(data.percentage) < 75 ? 'text-danger' : 'text-success'}`}>
                        {data.percentage}%
                      </span>
                      <span className="text-text-secondary">{data.present}/{data.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full ${parseFloat(data.percentage) < 75 ? 'bg-danger' : 'bg-success'}`}
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Records */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-secondary mb-4 font-heading">Attendance Records</h2>

            {attendance.length === 0 ? (
              <div className="text-center py-8">
                <FaClipboardList className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-text-secondary text-lg">No attendance records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary uppercase tracking-wider">Teacher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendance.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-secondary">
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-text-muted" />
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary font-medium">
                          {record.subjectId?.subjectName}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={record.status === 'Present' ? 'success' : 'danger'}>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {record.teacherId?.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAttendance;
