import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { FaDownload, FaEye, FaFileAlt, FaUser, FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

const StudentResources = () => {
  const studentId = window.location.pathname.split('/')[2];
  const [resources, setResources] = useState({
    assignments: [],
    notes: [],
    materials: [],
    attendance: [],
    videos: [],
    others: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    fetchResources();
  }, [studentId]);

  const fetchResources = async () => {
    try {
      const [assignmentsRes, resourcesRes, attendanceRes] = await Promise.all([
        api.get(`/api/student/${studentId}/assignments`),
        api.get(`/api/student/${studentId}/resources`),
        api.get(`/api/student/${studentId}/attendance`)
      ]);

      const allResources = resourcesRes.data.resources || [];

      setResources({
        assignments: assignmentsRes.data.assignments || [],
        notes: allResources.filter(r => r.type === 'lecture_note'),
        materials: allResources.filter(r => ['syllabus', 'reference_book', 'paper'].includes(r.type)),
        videos: allResources.filter(r => r.type === 'video'),
        others: allResources.filter(r => r.type === 'other'),
        attendance: attendanceRes.data.attendance || []
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
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

  const TabButton = ({ id, label, count }) => (
    <Button
      onClick={() => setActiveTab(id)}
      variant={activeTab === id ? 'primary' : 'outline'}
      className="whitespace-nowrap"
    >
      {label} <span className="ml-1 text-xs opacity-80 bg-black/10 px-2 py-0.5 rounded-full">{count}</span>
    </Button>
  );

  const ResourceCard = ({ resource }) => (
    <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {resource.type.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-text-muted">
                {new Date(resource.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-bold text-lg text-secondary mb-1 font-heading">{resource.title}</h3>
            <p className="text-sm text-primary font-medium mb-2">{resource.subjectId?.subjectName}</p>

            {resource.description && (
              <p className="text-sm text-text-secondary mb-4 line-clamp-2">{resource.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
              <div className="flex items-center gap-1">
                <FaUser className="text-text-muted" />
                <span>{resource.teacherId?.name}</span>
              </div>
            </div>

            {/* Files */}
            {resource.files && resource.files.length > 0 && (
              <div className="space-y-2 mb-3">
                {resource.files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-background p-2 rounded-lg text-sm border border-gray-100">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FaFileAlt className="text-text-muted flex-shrink-0" />
                      <span className="truncate text-text-secondary">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => window.open(file.url, '_blank')}
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10"
                        title="View"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        onClick={() => handleDownload(file.url, file.name)}
                        variant="ghost"
                        size="sm"
                        className="text-secondary hover:bg-secondary/10"
                        title="Download"
                      >
                        <FaDownload />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Links */}
            {resource.links && resource.links.length > 0 && (
              <div className="space-y-2">
                {resource.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline bg-primary/10 p-2 rounded-lg"
                  >
                    <FaLink className="flex-shrink-0" />
                    <span className="truncate">{link.title || link.url}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading resources..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary font-heading">Learning Resources</h1>
          <p className="text-text-secondary mt-2">Access your course materials, assignments, and attendance records.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-3 mb-8 pb-2 scrollbar-hide">
          <TabButton id="assignments" label="Assignments" count={resources.assignments.length} />
          <TabButton id="notes" label="Lecture Notes" count={resources.notes.length} />
          <TabButton id="materials" label="Study Materials" count={resources.materials.length} />
          <TabButton id="videos" label="Videos" count={resources.videos.length} />
          <TabButton id="others" label="Other Resources" count={resources.others.length} />
          <TabButton id="attendance" label="Attendance" count={resources.attendance.length} />
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'assignments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.assignments.map((assignment) => (
                <Card key={assignment._id} className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-secondary font-heading">{assignment.title}</h3>
                    </div>
                    {assignment.fileUrl && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Button
                          onClick={() => window.open(assignment.fileUrl, '_blank')}
                          variant="primary"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <FaEye /> View
                        </Button>
                        <Button
                          onClick={() => handleDownload(assignment.fileUrl, assignment.title + '.pdf')}
                          variant="secondary"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <FaDownload /> Download
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {resources.assignments.length === 0 && (
                <Card className="col-span-full border border-dashed border-gray-300">
                  <CardContent className="p-12 text-center text-text-secondary">
                    No assignments found.
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {['notes', 'materials', 'videos', 'others'].includes(activeTab) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources[activeTab].map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
              {resources[activeTab].length === 0 && (
                <Card className="col-span-full border border-dashed border-gray-300">
                  <CardContent className="p-12 text-center text-text-secondary">
                    No resources found in this category.
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <Card className="border border-gray-200 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Teacher</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.attendance.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="text-secondary">
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-secondary">
                          {record.subjectId?.subjectName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'Present' ? 'success' : 'danger'}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-text-secondary">
                          {record.teacherId?.name}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {resources.attendance.length === 0 && (
                  <div className="text-center py-12 text-text-secondary">
                    No attendance records found.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentResources;
