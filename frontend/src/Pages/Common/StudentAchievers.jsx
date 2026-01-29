import React, { useState } from 'react';
import { FaTrophy, FaStar, FaArrowLeft, FaBell, FaUserGraduate } from 'react-icons/fa';
import Card, { CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const StudentAchievers = () => {
    // Mock data for now, as we don't have a populated "achievements" DB yet
    const [achievers] = useState([
        {
            id: 1,
            name: "Aditya Kumar",
            course: "B.Tech CSE",
            photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya",
            achievements: [
                "1st Place in National Coding Hackathon 2024",
                "Published research paper on AI in Healthcare",
                "CGPA: 9.8"
            ],
            badge: "Gold Medalist"
        },
        {
            id: 2,
            name: "Ankita Maurya",
            course: "MBA",
            photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ankita",
            achievements: [
                "Best Speaker Award - Inter-college Debate",
                "Organized State Level Management Fest",
                "CGPA: 9.5"
            ],
            badge: "Star Performer"
        },
        {
            id: 3,
            name: "Gulshan Kartikk",
            course: "B.Tech CSE",
            photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gulshan",
            achievements: [
                "Developed College ERP System",
                "Google Cloud Certified Associate",
                "CGPA: 9.2"
            ],
            badge: "Tech Wizard"
        }
    ]);

    const [updates] = useState([
        { id: 1, text: "Annual Sports Meet registration closes tomorrow!", time: "2 hours ago" },
        { id: 2, text: "Guest Lecture on Blockchain Technology by Industry Experts.", time: "5 hours ago" },
        { id: 3, text: "Mid-term exam schedule has been released.", time: "1 day ago" }
    ]);

    return (
        <div className="min-h-screen bg-background font-sans">
            {/* Navbar for Public Page */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <FaUserGraduate className="text-primary text-xl" />
                            </div>
                            <span className="text-xl font-bold text-secondary font-heading">College ERP</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <FaBell className="text-text-secondary hover:text-primary transition-colors text-xl" />
                                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-danger rounded-full border-2 border-white"></span>

                                {/* Dropdown for Updates */}
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                                    <div className="p-4 border-b border-gray-100">
                                        <h3 className="font-semibold text-secondary font-heading">Latest Updates</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {updates.map(update => (
                                            <div key={update.id} className="p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                                <p className="text-sm text-secondary">{update.text}</p>
                                                <p className="text-xs text-text-muted mt-1">{update.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => window.history.back()}
                            >
                                <FaArrowLeft size={12} /> Back
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-secondary text-white py-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-white bg-clip-text text-transparent font-heading">
                        Student Hall of Fame
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Celebrating the academic excellence and outstanding achievements of our top performers.
                    </p>
                </div>
            </div>

            {/* Achievers Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {achievers.map((student) => (
                        <div key={student.id} className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                            <Card className="relative h-full border-none">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="relative mb-6">
                                        <img
                                            src={student.photo}
                                            alt={student.name}
                                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-warning text-white p-2 rounded-full shadow-md">
                                            <FaTrophy size={14} />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-secondary mb-1 font-heading">{student.name}</h3>
                                    <p className="text-primary font-medium mb-4">{student.course}</p>

                                    <Badge variant="warning" className="mb-6 px-4 py-1 text-sm">
                                        {student.badge}
                                    </Badge>

                                    <div className="w-full text-left space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Track Record</h4>
                                        {student.achievements.map((achievement, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                                                <FaStar className="text-warning mt-0.5 flex-shrink-0" size={12} />
                                                <span>{achievement}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentAchievers;
