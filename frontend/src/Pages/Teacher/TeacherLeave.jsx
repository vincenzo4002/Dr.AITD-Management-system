import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlus, FaCalendarCheck, FaClock } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';

const TeacherLeave = () => {
  const { id: teacherId } = useParams();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveTypes = ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Personal Leave'];

  useEffect(() => {
    fetchLeaves();
  }, [teacherId]);

  const fetchLeaves = async () => {
    try {
      const response = await api.get(`/api/teacher/${teacherId}/leaves`);
      if (response.data.success) {
        setLeaves(response.data.leaves || []);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/api/teacher/${teacherId}/leave`, formData);
      toast.success('Leave application submitted successfully!');
      setShowModal(false);
      setFormData({ leaveType: 'Sick Leave', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error(error.response?.data?.msg || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading leave history..." />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-secondary font-heading">Leave Applications</h1>
            <p className="text-text-secondary mt-1">Manage your leave requests</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <FaPlus /> Apply Leave
          </Button>
        </div>

        <div className="grid gap-6">
          {leaves.map((leave, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-secondary">{leave.leaveType}</h3>
                    <Badge variant={
                      leave.status === 'Approved' ? 'success' :
                        leave.status === 'Rejected' ? 'danger' : 'warning'
                    }>
                      {leave.status}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mb-2">{leave.reason}</p>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <FaCalendarCheck />
                      <span>
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock />
                      <span>Applied on {new Date(leave.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {leaves.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-text-secondary text-lg">No leave applications yet</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-secondary/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-secondary font-heading">Apply for Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Leave Type"
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                required
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>

              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />

              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  rows="3"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={submitting}>
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLeave;
