import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { FaUpload, FaFileAlt, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import AdminHeader from '../../components/AdminHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import BackButton from '../../components/BackButton';

const AdminUpload = () => {
  const [activeTab, setActiveTab] = useState('notice');
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    subjectId: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        api.get('/api/courses'),
        api.get('/api/subjects')
      ]);

      setCourses(coursesRes.data.courses || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const uploadFormData = new FormData();

      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);

      if (activeTab === 'notice') {
        uploadFormData.append('courseId', formData.courseId);
      } else {
        uploadFormData.append('subjectId', formData.subjectId);
      }

      if (formData.file) {
        uploadFormData.append('file', formData.file);
      }

      // Since admin doesn't have specific upload endpoints, we'll use teacher endpoints
      // In a real system, you'd create admin-specific endpoints
      const endpoint = activeTab === 'notice'
        ? `/api/admin/notices`
        : `/api/admin/materials`;

      await api.post(endpoint, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(`${activeTab} uploaded successfully!`);
      setFormData({
        title: '',
        description: '',
        courseId: '',
        subjectId: '',
        file: null
      });

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${activeTab}`);
    } finally {
      setUploading(false);
    }
  };

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === id
        ? 'bg-primary text-white'
        : 'bg-gray-100 text-secondary hover:bg-gray-200'
        }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader currentRole="admin" />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold mb-6 text-secondary font-heading">Admin Content Upload</h1>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <TabButton id="notice" label="System Notice" icon={<FaUsers />} />
            <TabButton id="material" label="Study Material" icon={<FaFileAlt />} />
          </div>

          {/* Upload Form */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={`Enter ${activeTab} title`}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  placeholder={`Enter ${activeTab} description`}
                  required
                />
              </div>

              {activeTab === 'notice' ? (
                <Select
                  label="Target Course *"
                  name="courseId"
                  value={formData.courseId}
                  onValueChange={(value) => handleInputChange({ target: { name: 'courseId', value } })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select Course</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.courseName} ({course.courseCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  label="Subject *"
                  name="subjectId"
                  value={formData.subjectId}
                  onValueChange={(value) => handleInputChange({ target: { name: 'subjectId', value } })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select Subject</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.subjectName} ({subject.subjectCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  Upload File (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <FaFileAlt className="mx-auto text-text-muted text-3xl mb-2" />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-primary hover:text-primary/80 font-medium"
                  >
                    Click to upload file
                  </label>
                  <p className="text-sm text-text-muted mt-1">
                    PDF, DOC, DOCX, PPT, PPTX, Images (Max 10MB)
                  </p>
                  {formData.file && (
                    <p className="text-sm text-primary mt-2 font-medium">
                      Selected: {formData.file.name}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    Publish {activeTab}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;
