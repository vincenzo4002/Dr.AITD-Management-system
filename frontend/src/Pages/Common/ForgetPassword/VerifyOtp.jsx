import React, { useEffect, useState } from "react";
import authService from "../../../services/authService";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { ShieldCheck } from "lucide-react";

const VerifyOtp = () => {
  const location = useLocation();

  const pathParts = location.pathname.split("/");
  const firstPart = pathParts[1];
  const userId = pathParts[2];
  console.log(firstPart, userId);

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

  let navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.resetPassword(userId, otp, password, role);

      console.log(res);

      if (res.success) {
        setOtp("");
        setPassword("");
        toast.success(res.msg);
        navigate("/");
      }
    } catch (err) {
      console.log("Something went wrong", err);
      toast.error(err.response?.data?.msg || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-secondary font-heading">
            Verify OTP
          </h1>
          <p className="text-text-secondary mt-2">
            Enter the OTP sent to your email and set a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="OTP"
            type="number"
            value={otp}
            placeholder="Enter 4-digit OTP"
            onChange={(e) => setOtp(e.target.value)}
            maxLength={4}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={password}
            placeholder="Enter new password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
          >
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
