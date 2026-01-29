import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import collegeImage from "../../assets/dr-ambedkar-institute-of-technology-for-handicapped-kanpur.jpeg.jpg";
import logo from "../../assets/logo.jpeg";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await api.post(`/api/admin/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      toast.success("Admin registration successful! You can now login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* College logo */}
      <div className="w-[50%] h-screen hidden lg:block relative">
        <div className="absolute inset-0 bg-secondary/20 backdrop-blur-[1px] z-10"></div>
        <img
          className="h-full w-full object-cover"
          src={collegeImage}
          alt="college image"
        />
      </div>

      {/* Form area */}
      <div className="w-full lg:w-[50%] h-screen bg-white flex items-center justify-center flex-col gap-5 p-8">
        {/* Logo */}
        <div className="w-full flex items-center justify-center mb-4">
          <img
            className="w-32"
            src={logo}
            alt="Dr. Ambedkar Institute of Technology for Handicapped Kanpur"
          />
        </div>

        {/* Form */}
        <div className="w-full max-w-md">
          <form
            method="post"
            onSubmit={handleSubmit}
            className="flex flex-col justify-between gap-6"
          >
            <div className="text-center mb-2">
              <h2 className="text-3xl font-bold text-secondary font-heading">Admin Registration</h2>
              <p className="text-sm text-text-secondary mt-2">Create an administrator account</p>
            </div>

            {/* Input fields */}
            <div className="flex flex-col gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </div>

            {/* Submit button */}
            <div className="mt-4">
              <Button
                type="submit"
                className="w-full"
              >
                Register as Admin
              </Button>
            </div>

            <div className="text-center mt-4">
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                Already have an account? Login here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
