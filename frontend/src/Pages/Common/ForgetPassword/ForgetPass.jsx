import React, { useEffect, useState } from "react";
import authService from "../../../services/authService";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackButton from "../../../components/BackButton";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { KeyRound } from "lucide-react";

const ForgetPass = () => {
  const location = useLocation();

  const pathParts = location.pathname.split("/");
  const firstPart = pathParts[1];
  console.log(firstPart);

  const [role, setRole] = useState("");

  useEffect(() => {
    if (firstPart === "student") {
      setRole("student");
    } else if (firstPart === "teacher") {
      setRole("teacher");
    } else if (firstPart === "admin") {
      setRole("admin");
    }
  }, [firstPart]);

  let { id } = useParams();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  let navigate = useNavigate("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email, role);

      if (res.success) {
        setEmail("");
        toast.success(res.msg);
        const userId = res.userId;
        if (role === "teacher") {
          navigate(`/teacher/${userId}/forgetPassword/verifyotp`);
        } else if (role === "admin") {
          navigate(`/admin/${userId}/forgetPassword/verifyotp`);
        } else {
          navigate(`/student/${userId}/forgetPassword/verifyotp`);
        }
      }
    } catch (err) {
      console.log("Something went wrong", err);
      toast.error(err.response?.data?.msg || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Decorative Side Panel */}
      <div className="w-[40%] hidden lg:flex flex-col items-center justify-center relative bg-secondary text-white overflow-hidden">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="text-center px-8 relative z-10">
          <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 font-heading">Reset</h1>
          <p className="text-2xl font-medium mb-4 text-gray-200">Password Recovery</p>
          <div className="w-24 h-1 mx-auto mb-6 bg-primary rounded-full"></div>
          <p className="text-lg text-gray-300">We'll help you get back in</p>
        </div>
      </div>

      {/* Form area */}
      <div className="w-full lg:w-[60%] flex items-center justify-center flex-col px-4 relative">
        <div className="absolute top-8 left-8">
          <BackButton />
        </div>

        <div className="w-full max-w-md">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-secondary font-heading">Forgot Password?</h2>
            <p className="text-text-secondary">Enter your email to reset your password</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-xl p-8 border border-gray-200"
          >
            <div className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={loading}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPass;
