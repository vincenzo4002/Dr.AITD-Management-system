import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import AdminHeader from '../../components/AdminHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/ui/Button';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import adminService from '../../services/adminService';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await adminService.getSubjects();
            if (res.success) {
                setSubjects(res.subjects);
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <AdminHeader />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <BackButton className="mb-4" />
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-secondary font-heading">Subject Management</h1>
                            <p className="text-text-secondary">Manage all subjects and curriculum</p>
                        </div>
                        <Link to="/admin/add-subject">
                            <Button className="flex items-center space-x-2">
                                <FaPlus />
                                <span>Add Subject</span>
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Credits</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjects.map((subject) => (
                                    <TableRow key={subject._id}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <FaBook className="text-primary mr-3" />
                                                <span className="font-medium text-secondary">{subject.subjectName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{subject.subjectCode}</TableCell>
                                        <TableCell>{subject.subjectType}</TableCell>
                                        <TableCell>{subject.credits}</TableCell>
                                        <TableCell>{subject.semester}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <button className="text-primary hover:text-primary/80"><FaEye /></button>
                                                <button className="text-primary hover:text-primary/80"><FaEdit /></button>
                                                <button className="text-danger hover:text-red-700"><FaTrash /></button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {subjects.length === 0 && (
                                    <TableRow>
                                        <TableCell className="text-center py-4" colSpan={6}>No subjects found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectManagement;
