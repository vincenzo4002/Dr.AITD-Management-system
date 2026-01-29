import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { FaBook, FaChalkboardTeacher, FaFileAlt, FaClipboardList, FaArrowRight } from 'react-icons/fa';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentSubjects = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await api.get(`/api/student/${studentId}/subjects`);
                if (response.data.success) {
                    setSubjects(response.data.subjects);
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner message="Loading subjects..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-secondary font-heading">My Subjects</h1>
                    <p className="text-text-secondary">View and manage your enrolled subjects</p>
                </div>
            </div>

            {subjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <Card key={subject._id} className="hover:shadow-lg transition-shadow duration-300 border-t-4 border-t-primary border-gray-200">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                        <FaBook size={24} />
                                    </div>
                                    <Badge variant="primary">{subject.subjectCode}</Badge>
                                </div>
                                <CardTitle className="mt-4 text-xl font-heading text-secondary">{subject.subjectName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm text-text-secondary">
                                    <div className="flex items-center gap-2">
                                        <FaChalkboardTeacher className="text-text-muted" />
                                        <span>Sessions: {subject.sessions || 'N/A'}</span>
                                    </div>
                                    {/* Add more subject details here if available */}
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between text-text-secondary hover:text-primary hover:bg-primary/5"
                                    onClick={() => navigate(`/student/${studentId}/materials?subjectId=${subject._id}`)}
                                >
                                    <span className="flex items-center gap-2"><FaFileAlt /> Study Materials</span>
                                    <FaArrowRight size={12} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between text-text-secondary hover:text-primary hover:bg-primary/5"
                                    onClick={() => navigate(`/student/${studentId}/assignments?subjectId=${subject._id}`)}
                                >
                                    <span className="flex items-center gap-2"><FaClipboardList /> Assignments</span>
                                    <FaArrowRight size={12} />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center text-text-muted">
                        <FaBook size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-secondary">No Subjects Found</h3>
                    <p className="text-text-secondary mt-2">You haven't been enrolled in any subjects yet.</p>
                </div>
            )}
        </div>
    );
};

export default StudentSubjects;
