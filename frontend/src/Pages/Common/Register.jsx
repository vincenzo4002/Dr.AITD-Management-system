import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/Select";
import { GraduationCap, ArrowLeft } from "lucide-react";

import api from "../../api/axiosInstance";
import authService from "../../services/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    courseId: ""
  });
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      console.log("Fetching courses from /api/courses...");
      const response = await api.get('/api/courses');
      console.log("Courses response:", response.data);
      if (response.data && response.data.courses) {
        setCourses(response.data.courses);
      } else {
        console.warn("No courses found in response data");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses. Please try refreshing.");
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [registeredStudent, setRegisteredStudent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.courseId) {
      toast.error("Please select a course");
      return;
    }

    setIsLoading(true);
    try {
      // Use authService for registration
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        courseId: formData.courseId
      }, 'student');

      setRegisteredStudent(response.student);
      toast.success("Registration successful!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.msg || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (registeredStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-secondary mb-4">Registration Successful!</h2>
          <p className="text-text-secondary mb-6">
            Your account has been created. Please note your Roll Number, as you may need it to log in.
          </p>

          <div className="bg-gray-100 p-4 rounded-lg mb-8">
            <p className="text-sm text-text-secondary uppercase tracking-wide mb-1">Your Roll Number</p>
            <p className="text-3xl font-mono font-bold text-primary">{registeredStudent.rollNo}</p>
          </div>

          <Button
            onClick={() => navigate("/login")}
            className="w-full py-3"
          >
            Proceed to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative py-12">
        <Link to="/" className="absolute top-8 left-8 flex items-center text-text-secondary hover:text-primary transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        <div className="mb-8 mt-12 lg:mt-0">
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-primary p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary font-heading">Dr AITD</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary mb-2 font-heading">Create an account</h1>
          <p className="text-text-secondary">Start your academic journey with us today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              name="name"
              placeholder="Gulshan kumar"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="kartik@gmail.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Select
            label="Select Course"
            name="courseId"
            value={formData.courseId}
            onValueChange={(value) => handleChange({ target: { name: 'courseId', value } })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Select a Course --" />
            </SelectTrigger>
            <SelectContent>
              {coursesLoading ? (
                <SelectItem value="loading" disabled>Loading courses...</SelectItem>
              ) : courses.length === 0 ? (
                <SelectItem value="none" disabled>No courses available</SelectItem>
              ) : (
                courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.courseName} ({course.courseCode})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 mt-2"
            isLoading={isLoading}
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-text-secondary mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </form>
      </div>

      {/* Right Side - Image/Decoration */}
      <div className="hidden lg:block w-1/2 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/20 backdrop-blur-[1px] z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
          alt="Students studying"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 z-20 bg-gradient-to-t from-secondary/90 to-transparent text-white">
          <h2 className="text-3xl font-bold mb-4 font-heading">Join Our Community</h2>
          <p className="text-lg text-gray-200 max-w-md">
            Connect with thousands of students and educators. Experience a modern way of learning and management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
