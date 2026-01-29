import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary p-2 rounded-lg">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-secondary font-heading">Dr AITD</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/login">
                            <Button variant="ghost">Log in</Button>
                        </Link>
                        <Link to="/register">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Slider */}
            <HeroSlider />

            {/* Features Grid */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-secondary mb-4 font-heading">Everything You Need</h2>
                        <p className="text-lg text-text-secondary">Powerful features to manage every aspect of your educational institution.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Student Management",
                                desc: "Track admissions, attendance, and academic progress with ease."
                            },
                            {
                                icon: BookOpen,
                                title: "Course Planning",
                                desc: "Manage curriculum, subjects, and timetables efficiently."
                            },
                            {
                                icon: Shield,
                                title: "Secure & Reliable",
                                desc: "Role-based access control and encrypted data protection."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-3">{feature.title}</h3>
                                <p className="text-text-secondary">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "Institutions", value: "1+" },
                            { label: "Students", value: "150+" },
                            { label: "Teachers", value: "50+" },
                            { label: "Uptime", value: "99.9%" }
                        ].map((stat, idx) => (
                            <div key={idx}>
                                <div className="text-4xl font-extrabold text-primary mb-2">{stat.value}</div>
                                <div className="text-text-secondary font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Global Footer */}
            <Footer />
        </div>
    );
};

export default LandingPage;
