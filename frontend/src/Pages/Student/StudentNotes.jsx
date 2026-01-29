import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { FaDownload, FaEye, FaUser, FaClock, FaStickyNote } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentNotes = () => {
  const { studentId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, [studentId]);

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/api/student/${studentId}/notes`);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
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
        <LoadingSpinner message="Loading notes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <FaStickyNote className="text-3xl text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-secondary font-heading">My Notes</h1>
            <p className="text-text-secondary">Access lecture notes and study materials</p>
          </div>
        </div>

        {notes.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <FaStickyNote className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-text-secondary text-lg">No notes available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {notes.map((note) => (
              <Card key={note._id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-secondary mb-2 font-heading">{note.title}</h3>
                      <p className="text-primary font-medium mb-2">{note.subjectId?.subjectName}</p>
                      {note.description && (
                        <p className="text-text-secondary mb-4">{note.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                        <div className="flex items-center space-x-1">
                          <FaUser />
                          <span>By: {note.teacherId?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaClock />
                          <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {note.fileUrl && (
                      <div className="flex items-center space-x-2 w-full md:w-auto">
                        <Button
                          onClick={() => window.open(note.fileUrl, '_blank')}
                          variant="primary"
                          className="flex items-center gap-2"
                          title="View"
                        >
                          <FaEye /> View
                        </Button>
                        <Button
                          onClick={() => handleDownload(note.fileUrl, `${note.title}.pdf`)}
                          variant="success"
                          className="flex items-center gap-2"
                          title="Download"
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

export default StudentNotes;
