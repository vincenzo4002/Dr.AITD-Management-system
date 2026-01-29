import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { FaDownload, FaEye, FaUser, FaClock, FaBook } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentMaterials = () => {
  const { studentId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [studentId]);

  const fetchMaterials = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/materials`);
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load study materials');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading study materials..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <FaBook className="text-3xl text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-secondary font-heading">Study Materials</h1>
            <p className="text-text-secondary">Access course materials and resources</p>
          </div>
        </div>

        {materials.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-text-secondary text-lg">No study materials available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {materials.map((material) => (
              <Card key={material._id} className="border-l-4 border-l-primary border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-secondary mb-2 font-heading">{material.title}</h3>
                      <p className="text-primary font-medium mb-2">{material.subjectId?.subjectName}</p>
                      {material.description && (
                        <p className="text-text-secondary mb-4">{material.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                        <div className="flex items-center space-x-1">
                          <FaUser />
                          <span>By: {material.teacherId?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaClock />
                          <span>Updated: {new Date(material.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {material.fileUrl && (
                      <div className="flex items-center space-x-2 w-full md:w-auto">
                        <Button
                          onClick={() => window.open(material.fileUrl, '_blank')}
                          variant="primary"
                          className="flex items-center gap-2"
                          title="View Material"
                        >
                          <FaEye /> View
                        </Button>
                        <Button
                          onClick={() => handleDownload(material.fileUrl, `${material.title}.pdf`)}
                          variant="secondary"
                          className="flex items-center gap-2"
                          title="Download Material"
                        >
                          <FaDownload /> Download
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMaterials;
