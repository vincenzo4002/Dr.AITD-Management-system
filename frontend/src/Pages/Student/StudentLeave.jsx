import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlus, FaCalendarCheck, FaClock } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentLeave = () => {
  const { studentId } = useParams();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveTypes = [
    { value: 'Sick Leave', label: 'Sick Leave' },
    { value: 'Casual Leave', label: 'Casual Leave' },
    { value: 'Emergency Leave', label: 'Emergency Leave' },
    { value: 'Family Function', label: 'Family Function' }
  ];

  useEffect(() => {
    fetchLeaves();
  }, [studentId]);

  const fetchLeaves = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/leaves`);
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
      await api.post(`/api/student/${studentId}/leave`, formData);
      toast.success('Leave request submitted successfully!');
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
            <h1 className="text-3xl font-bold text-secondary font-heading">Leave Requests</h1>
            <p className="text-text-secondary mt-1">Manage your leave applications</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FaPlus /> Request Leave
          </Button>
        </div>

        <div className="grid gap-6">
          {leaves.map((leave) => (
            <Card key={leave._id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
            <Card className="border border-dashed border-gray-300">
              <CardContent className="p-12 text-center">
                <p className="text-text-muted text-lg">No leave requests found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Request Leave"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Leave Type"
            name="leaveType"
            value={formData.leaveType}
            onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Leave Type" />
            </SelectTrigger>
            <SelectContent>
              {leaveTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              rows="3"
              required
              placeholder="Please provide a reason for your leave..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentLeave;
