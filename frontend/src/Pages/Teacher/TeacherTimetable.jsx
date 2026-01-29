import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';

const TeacherTimetable = () => {
  const { id: teacherId } = useParams();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '2:00-3:00', '3:00-4:00'];

  useEffect(() => {
    fetchTimetable();
  }, [teacherId]);

  const fetchTimetable = async () => {
    try {
      // Mock timetable data - replace with actual API when available
      await api.get(`/api/teacher/${teacherId}/dashboard`);
      setTimetable([]);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading timetable..." />;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-secondary mb-6 flex items-center gap-3 font-heading">
          <FaCalendarAlt /> My Timetable
        </h1>

        <Card className="border border-gray-200 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary">
                  <th className="p-4 text-white border-b border-gray-200 text-left font-heading">Time</th>
                  {days.map(day => (
                    <th key={day} className="p-4 text-white border-b border-gray-200 text-left font-heading">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, idx) => (
                  <tr key={slot} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 border-b border-gray-200 font-bold text-secondary whitespace-nowrap">
                      <FaClock className="inline mr-2 text-primary" />
                      {slot}
                    </td>
                    {days.map(day => (
                      <td key={`${day}-${slot}`} className="p-4 border-b border-gray-200 text-center text-text-secondary">
                        <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-text-muted text-sm">
                          Free
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 text-center text-text-secondary border-t border-gray-200">
              No classes scheduled yet
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherTimetable;
