import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import { FaDownload, FaEye, FaUser, FaClock, FaTasks, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card, { CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentAssignments = () => {
  const { studentId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, [studentId]);

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/assignments`);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', text: 'Overdue', variant: 'danger' };
    } else if (diffDays <= 3) {
      return { status: 'urgent', text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, variant: 'warning' };
    } else {
      return { status: 'normal', text: `Due in ${diffDays} days`, variant: 'primary' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading assignments..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <FaTasks className="text-3xl text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-secondary font-heading">My Assignments</h1>
            <p className="text-text-secondary">View and manage your course assignments</p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <FaTasks className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-text-secondary text-lg">No assignments available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => {
              const deadlineInfo = getDeadlineStatus(assignment.deadline);

              return (
                <Card key={assignment._id} className="border-l-4 border-l-primary border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-secondary font-heading">{assignment.title}</h3>
                          <Badge variant={deadlineInfo.variant}>
                            {deadlineInfo.text}
                          </Badge>
                        </div>

                        <p className="text-primary font-medium mb-2">{assignment.subjectId?.subjectName}</p>

                        {assignment.description && (
                          <p className="text-text-secondary mb-4">{assignment.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                          <div className="flex items-center space-x-1">
                            <FaUser />
                            <span>By: {assignment.teacherId?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaCalendarAlt />
                            <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaClock />
                            <span>Assigned: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {assignment.fileUrl && (
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                          <Button
                            onClick={() => window.open(assignment.fileUrl, '_blank')}
                            variant="primary"
                            className="flex items-center gap-2"
                            title="View Assignment"
                          >
                            <FaEye /> View
                          </Button>
                          <Button
                            onClick={() => handleDownload(assignment.fileUrl, `${assignment.title}.pdf`)}
                            variant="secondary"
                            className="flex items-center gap-2"
                            title="Download Assignment"
                          >
                            <FaDownload /> Download
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
