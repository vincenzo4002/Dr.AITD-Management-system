import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../api/axiosInstance';
import { BASE_URL } from '../../constants/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaPlus, FaFileAlt, FaVideo, FaBook, FaLink, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-toastify';

const RESOURCE_TYPES = [
    { value: 'lecture_note', label: 'Lecture Note', icon: FaFileAlt },
    { value: 'video', label: 'Video / Recording', icon: FaVideo },
    { value: 'syllabus', label: 'Syllabus', icon: FaBook },
    { value: 'reference_book', label: 'Reference Book', icon: FaBook },
    { value: 'paper', label: 'Question Paper', icon: FaFileAlt },
    { value: 'other', label: 'Other', icon: FaLink },
];

const TeacherResources = () => {
    const { id: teacherId } = useParams();
    const [resources, setResources] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter State
    const [filterSubject, setFilterSubject] = useState('');
    const [filterType, setFilterType] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        subjectId: '',
        title: '',
        description: '',
        type: 'lecture_note',
        links: '', // JSON string or comma separated for simplicity in this version
        tags: '',
        isPublished: true
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, [teacherId]);

    const fetchData = async () => {
        try {
            const [resourcesRes, dashboardRes] = await Promise.all([
                api.get(`/api/teacher/${teacherId}/resources`),
                api.get(`/api/teacher/${teacherId}/dashboard`)
            ]);

            setResources(resourcesRes.data.resources || []);
            setSubjects(dashboardRes.data.teacher?.assignedSubjects || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('subjectId', formData.subjectId);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('type', formData.type);
            data.append('tags', formData.tags);
            data.append('isPublished', formData.isPublished);

            if (file) {
                data.append('file', file);
            }

            await api.post(`/api/teacher/${teacherId}/resources`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Resource added successfully!');
            setShowModal(false);
            setFormData({
                subjectId: '',
                title: '',
                description: '',
                type: 'lecture_note',
                links: '',
                tags: '',
                isPublished: true
            });
            setFile(null);
            fetchData();
        } catch (error) {
            console.error('Error adding resource:', error);
            toast.error(error.response?.data?.msg || 'Failed to add resource');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (resourceId) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;

        try {
            await api.delete(`/api/teacher/${teacherId}/resources/${resourceId}`);
            toast.success('Resource deleted');
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete resource');
        }
    };

    const filteredResources = resources.filter(r => {
        const matchSubject = filterSubject ? r.subjectId?._id === filterSubject : true;
        const matchType = filterType ? r.type === filterType : true;
        return matchSubject && matchType;
    });

    const getTypeIcon = (type) => {
        const found = RESOURCE_TYPES.find(t => t.value === type);
        const Icon = found ? found.icon : FaFileAlt;
        return <Icon />;
    };

    const getTypeLabel = (type) => {
        const found = RESOURCE_TYPES.find(t => t.value === type);
        return found ? found.label : type;
    };

    if (loading) return <LoadingSpinner message="Loading resources..." />;

    return (
        <div className="min-h-screen bg-background">
            <div className="p-6 max-w-7xl mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary font-heading">Learning Resources</h1>
                        <p className="text-text-secondary mt-1">Manage notes, videos, syllabus, and more</p>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                        <FaPlus /> Add Resource
                    </Button>
                </div>

                {/* Filters */}
                <Card className="mb-8 border border-gray-200">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                        <Select
                            label="Filter by Subject"
                            value={filterSubject}
                            onValueChange={(value) => setFilterSubject(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Subjects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Subjects</SelectItem>
                                {subjects.map(sub => (
                                    <SelectItem key={sub._id} value={sub._id}>{sub.subjectName} ({sub.subjectCode})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            label="Filter by Type"
                            value={filterType}
                            onValueChange={(value) => setFilterType(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Types</SelectItem>
                                {RESOURCE_TYPES.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Resource Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map(resource => (
                        <Card key={resource._id} className="hover:shadow-lg transition-shadow border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${resource.type === 'video' ? 'bg-secondary/10 text-secondary' :
                                        resource.type === 'syllabus' ? 'bg-primary/10 text-primary' :
                                            'bg-primary/10 text-primary'
                                        }`}>
                                        {getTypeIcon(resource.type)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(resource._id)}
                                            className="text-text-muted hover:text-danger transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-secondary mb-2 line-clamp-1 font-heading">{resource.title}</h3>
                                <p className="text-sm text-text-secondary mb-4 line-clamp-2">{resource.description}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Badge variant="outline">{resource.subjectId?.subjectName}</Badge>
                                    <Badge variant="secondary">{getTypeLabel(resource.type)}</Badge>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-text-muted">
                                        {new Date(resource.createdAt).toLocaleDateString()}
                                    </span>
                                    {resource.files && resource.files.length > 0 && (
                                        <a
                                            href={resource.files[0].url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1"
                                        >
                                            <FaDownload size={12} /> Download
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-text-secondary">No resources found matching your filters</p>
                    </div>
                )}
            </div>

            {/* Add Resource Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-secondary font-heading">Add New Resource</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <Select
                                label="Subject"
                                value={formData.subjectId}
                                onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Select Subject</SelectItem>
                                    {subjects.map(sub => (
                                        <SelectItem key={sub._id} value={sub._id}>{sub.subjectName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                label="Resource Type"
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RESOURCE_TYPES.map(t => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                label="Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., Chapter 1 Notes"
                            />

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Tags (comma separated)"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="e.g., important, exam, week1"
                            />

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Upload File</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={submitting} className="flex-1">
                                    Upload Resource
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherResources;
