import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaBell, FaCalendarAlt } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';

const StudentNotices = () => {
  const { studentId } = useParams();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, [studentId]);

  const fetchNotices = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/notices`);
      setNotices(response.data.notices || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading notices..." />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-secondary mb-6 flex items-center gap-3 font-heading">
          <FaBell className="text-primary" /> Notices & Announcements
        </h1>

        <div className="grid grid-cols-1 gap-4">
          {notices.length > 0 ? notices.map(notice => (
            <Card key={notice._id} className="border-l-4 border-l-primary border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-secondary font-heading">{notice.title}</h3>
                  <span className="text-sm text-text-muted flex items-center">
                    <FaCalendarAlt className="inline mr-1" />
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-text-secondary">{notice.description}</p>
              </CardContent>
            </Card>
          )) : (
            <Card className="border border-gray-200">
              <CardContent className="p-12 text-center">
                <FaBell size={48} className="mx-auto mb-4 text-primary" />
                <p className="text-text-secondary text-lg">No notices available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotices;
