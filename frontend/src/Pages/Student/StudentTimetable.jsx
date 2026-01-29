import React from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';

const StudentTimetable = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '2:00-3:00', '3:00-4:00'];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <FaCalendarAlt className="text-3xl text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-secondary font-heading">My Timetable</h1>
            <p className="text-text-secondary">View your weekly class schedule</p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-lg">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary">
                  <th className="p-4 text-white border-b border-gray-200 text-left font-heading">Time</th>
                  {days.map(day => (
                    <th key={day} className="p-4 text-white border-b border-gray-200 text-center font-heading min-w-[120px]">{day}</th>
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
                      <td key={`${day}-${slot}`} className="p-4 border-b border-gray-200 text-center text-text-muted hover:bg-primary/5 transition-colors">
                        <span className="inline-block px-2 py-1 rounded text-sm">Free</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 text-center text-text-muted bg-gray-50 border-t border-gray-200">
              No classes scheduled yet
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentTimetable;
