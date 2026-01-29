import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from './ui/Button';

const SLIDES = [
    {
        id: 1,
        title: "Manage Your Institute With Confidence",
        subtitle: "A comprehensive, modern ERP solution for colleges and universities. Streamline administration, empower teachers, and engage students.",
        color: "from-secondary to-primary",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    },
    {
        id: 2,
        title: "Empower Learning Through Technology",
        subtitle: "Digital classrooms, online assignments, and seamless resource sharing. Bring your campus into the future.",
        color: "from-purple-600 to-pink-700",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    },
    {
        id: 3,
        title: "Data-Driven Decision Making",
        subtitle: "Real-time analytics for attendance, performance, and financials. Make informed decisions for your institution's growth.",
        color: "from-emerald-600 to-teal-700",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    }
];

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-[600px] overflow-hidden">
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Background Image with Overlay */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} mix-blend-multiply opacity-90`} />
                        <div className="absolute inset-0 bg-black/30" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                        <div className="max-w-3xl text-white pt-20">
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up font-heading">
                                {slide.title}
                            </h1>
                            <p className="text-xl text-gray-200 mb-10 max-w-2xl animate-fade-in-up delay-100">
                                {slide.subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up delay-200">
                                <Link to="/login">
                                    <Button size="lg" className="w-full sm:w-auto bg-white text-secondary hover:bg-gray-100 border-none">
                                        Get Started <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto text-white border-white hover:bg-white/10"
                                >
                                    View Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
