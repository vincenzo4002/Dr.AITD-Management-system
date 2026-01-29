import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { FaTrophy } from 'react-icons/fa';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentMarks = () => {
    const { studentId } = useParams();
    const [marks, setMarks] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        subjectId: '',
        examType: ''
    });

    const examTypes = [
        { value: 'Mid Term', label: 'Mid Term' },
        { value: 'Final', label: 'Final' },
        { value: 'Quiz', label: 'Quiz' },
        { value: 'Assignment', label: 'Assignment' },
        { value: 'Project', label: 'Project' }
    ];

    useEffect(() => {
        fetchSubjects();
        fetchMarks();
    }, [studentId]);

    useEffect(() => {
        fetchMarks();
    }, [filters]);

    const fetchSubjects = async () => {
        try {
            const response = await api.get(`/api/student/${studentId}/subjects`);
            setSubjects(response.data.subjects || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchMarks = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.subjectId && filters.subjectId !== 'all') params.subjectId = filters.subjectId;
            if (filters.examType && filters.examType !== 'all') params.examType = filters.examType;

            const response = await api.get(`/api/student/${studentId}/marks`, {
                params
            });
            setMarks(response.data.marks || []);
        } catch (error) {
            console.error('Error fetching marks:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = (obtained, total) => {
        return total > 0 ? ((obtained / total) * 100).toFixed(2) : '0.00';
    };

    const getGrade = (percentage) => {
        const p = parseFloat(percentage);
        if (p >= 90) return { grade: 'A+', color: 'success' };
        if (p >= 80) return { grade: 'A', color: 'success' };
        if (p >= 70) return { grade: 'B', color: 'primary' };
        if (p >= 60) return { grade: 'C', color: 'warning' };
        if (p >= 50) return { grade: 'D', color: 'warning' };
        return { grade: 'F', color: 'danger' };
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary font-heading">My Results</h1>
                    <p className="text-text-secondary">View your academic performance and grades</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="border border-gray-200">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3">
                            <Select
                                label="Filter by Subject"
                                value={filters.subjectId}
                                onValueChange={(value) => setFilters({ ...filters, subjectId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {subjects.map(sub => (
                                        <SelectItem key={sub._id} value={sub._id}>{sub.subjectName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-1/3">
                            <Select
                                label="Filter by Exam Type"
                                value={filters.examType}
                                onValueChange={(value) => setFilters({ ...filters, examType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Exams" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Exams</SelectItem>
                                    {examTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Marks Table */}
            <Card className="border border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-heading text-secondary">
                        <FaTrophy className="text-primary" />
                        Performance Report
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <tr>
                                <TableHead>Subject</TableHead>
                                <TableHead>Exam Type</TableHead>
                                <TableHead>Marks Obtained</TableHead>
                                <TableHead>Total Marks</TableHead>
                                <TableHead>Percentage</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Date</TableHead>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan="7" className="text-center py-8">
                                        <LoadingSpinner />
                                    </TableCell>
                                </TableRow>
                            ) : marks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="7" className="text-center py-8 text-text-secondary">
                                        No marks records found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                marks.map((record) => {
                                    const percentage = calculatePercentage(record.marks, record.totalMarks);
                                    const { grade, color } = getGrade(percentage);
                                    return (
                                        <TableRow key={record._id}>
                                            <TableCell className="font-medium text-secondary">
                                                {record.subjectId?.subjectName || 'Unknown Subject'}
                                                <div className="text-xs text-text-muted">{record.subjectId?.subjectCode}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{record.examType}</Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-secondary">{record.marks}</TableCell>
                                            <TableCell className="text-text-secondary">{record.totalMarks}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full ${parseFloat(percentage) >= 50 ? 'bg-success' : 'bg-danger'}`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{percentage}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={color}>{grade}</Badge>
                                            </TableCell>
                                            <TableCell className="text-text-secondary text-sm">
                                                {new Date(record.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentMarks;
