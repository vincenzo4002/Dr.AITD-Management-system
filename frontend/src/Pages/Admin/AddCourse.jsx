import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';

const AddCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    courseDuration: '',
    courseDescription: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/admin/courses', formData);

      if (response.data.success) {
        toast.success('Course created successfully!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton className="mb-4" />
          <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
            <h1 className="text-3xl font-bold mb-8 text-secondary font-heading">Add New Course</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Course Name *"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  required
                  placeholder="Bachelor of Technology - Computer Science"
                />

                <Input
                  label="Course Code *"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  required
                  placeholder="BTECH-CSE"
                />

                <Select
                  label="Course Duration *"
                  name="courseDuration"
                  value={formData.courseDuration}
                  onValueChange={(value) => handleInputChange({ target: { name: 'courseDuration', value } })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select Duration</SelectItem>
                    <SelectItem value="1 Year">1 Year</SelectItem>
                    <SelectItem value="2 Years">2 Years</SelectItem>
                    <SelectItem value="3 Years">3 Years</SelectItem>
                    <SelectItem value="4 Years">4 Years</SelectItem>
                    <SelectItem value="5 Years">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  Course Description
                </label>
                <textarea
                  name="courseDescription"
                  value={formData.courseDescription}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  placeholder="Brief description of the course..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
