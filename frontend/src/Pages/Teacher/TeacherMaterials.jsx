import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import { FaPlus, FaFileAlt, FaDownload } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/LoadingSpinner';

const TeacherMaterials = () => {
  const { id: teacherId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterSubject, setFilterSubject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    fileUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const fetchData = async () => {
    try {
      const [materialsRes, dashboardRes] = await Promise.all([
        api.get(`/api/teacher/${teacherId}/materials`),
        api.get(`/api/teacher/${teacherId}/dashboard`)
      ]);
      const materialsData = materialsRes.data.materials || [];
      setAllMaterials(materialsData);
      setMaterials(materialsData);
      setSubjects(dashboardRes.data.teacher?.assignedSubjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterSubject && filterSubject !== 'all') {
      setMaterials(allMaterials.filter(m => m.subjectId?._id === filterSubject));
    } else {
      setMaterials(allMaterials);
    }
  }, [filterSubject, allMaterials]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadData = new FormData();
      uploadData.append('subjectId', formData.subjectId);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      if (formData.file) {
        uploadData.append('file', formData.file);
      }

      await api.post(`/api/teacher/${teacherId}/materials`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Study material uploaded successfully!');
      setShowModal(false);
      setFormData({ subjectId: '', title: '', description: '', file: null });
      fetchData();
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Failed to upload material');
    }
  };

  if (loading) return <LoadingSpinner message="Loading materials..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary font-heading">Study Materials</h1>
          <p className="text-text-secondary">Manage and share course materials</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <FaPlus className="mr-2" /> Upload Material
        </Button>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="max-w-md">
            <Select
              label="Filter by Subject"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject._id}>
                  {subject.subjectName} ({subject.subjectCode})
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map(material => (
          <Card key={material._id} className="hover:shadow-lg transition-shadow border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaFileAlt className="text-primary text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-secondary mb-1 font-heading">{material.title}</h3>
                  <p className="text-sm text-primary font-medium mb-2">
                    {material.subjectId?.subjectName}
                  </p>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">{material.description}</p>

                  {material.fileUrl && (
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                    >
                      <FaDownload className="mr-2" /> Download Resource
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {materials.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FaFileAlt className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <p className="text-text-secondary text-lg">No study materials found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 font-heading text-secondary">Upload Study Material</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Subject"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                required
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.subjectName} ({subject.subjectCode})
                  </option>
                ))}
              </Select>

              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  rows="3"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Upload Document *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  className="block w-full text-sm text-text-secondary
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20
                  "
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Upload
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMaterials;
