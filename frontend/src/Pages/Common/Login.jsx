import React, { useState, useEffect } from "react";
import authService from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { addUserDetails } from "../../features/UserSlice";
import { jwtDecode } from "jwt-decode";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { GraduationCap, ArrowLeft, Eye, EyeOff, Lock, User, Shield, Info } from "lucide-react";
import collegeImg from "../../assets/login_bg.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password Change State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [tempStudentId, setTempStudentId] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for session expired query param
    const params = new URLSearchParams(window.location.search);
    if (params.get('sessionExpired')) {
      toast.error("Session Expired. Please login again.");
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // UNIFIED AUTH ENDPOINT
      const response = await authService.login({ username, password }, role);

      const { token, user } = response; // Response now returns 'user' object

      // Check for forced password change (only for students)
      if (role === 'student' && user && user.passwordChanged === false) {
        setTempToken(token);
        setTempStudentId(user.id);
        setShowChangePassword(true);
        setIsLoading(false);
        toast.info("Please change your default password to continue.");
        return;
      }

      loginSuccess(token);

    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const loginSuccess = (token) => {
    Cookies.set("token", token, { expires: 3650 }); // 10 years - effectively unlimited
    localStorage.setItem("token", token);
    dispatch(addUserDetails({ token: token }));

    let decodedToken = jwtDecode(token);
    localStorage.setItem("userId", decodedToken.id);
    localStorage.setItem("userRole", decodedToken.role);

    toast.success(`Welcome back, ${decodedToken.role}!`);

    if (decodedToken.role === "admin") {
      window.location.href = "/admin/dashboard";
    } else {
      const path = role === "student"
        ? `/student/${decodedToken.id}/dashboard`
        : `/teacher/${decodedToken.id}/dashboard`;
      navigate(path);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      await authService.updatePassword(password, newPassword, tempStudentId, 'student', tempToken);

      toast.success("Password updated successfully!");
      setShowChangePassword(false);
      loginSuccess(tempToken); // Proceed to login
    } catch (err) {
      console.error("Password change error:", err);
      toast.error(err.response?.data?.msg || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (r) => {
    switch (r) {
      case 'student': return <User size={18} />;
      case 'teacher': return <GraduationCap size={18} />;
      case 'admin': return <Shield size={18} />;
      default: return <User size={18} />;
    }
  };

  if (showChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-secondary">Change Password</h2>
            <p className="text-text-secondary mt-2">For security, please update your default password.</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />
            <Button type="submit" className="w-full py-3" isLoading={isLoading}>
              Update Password & Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative bg-white shadow-2xl z-10 animate-fade-in">
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center text-text-secondary hover:text-primary transition-colors font-medium group">
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8 mt-16 lg:mt-0">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-tr from-primary to-blue-600 p-3 rounded-xl shadow-lg shadow-primary/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-secondary tracking-tight font-heading">Dr AITD</span>
              <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Management System</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-secondary mb-3 tracking-tight font-heading">Welcome Back</h1>
          <p className="text-text-secondary text-lg">Please sign in to continue to your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selector */}
          <div className="p-1.5 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
            <div className="grid grid-cols-3 gap-2">
              {['student', 'teacher', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${role === r
                    ? 'bg-white text-primary shadow-md transform scale-[1.02] ring-1 ring-gray-100'
                    : 'text-text-secondary hover:text-secondary hover:bg-gray-100'
                    }`}
                >
                  <span className="mr-2">{getRoleIcon(r)}</span>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <Input
              label={role === "student" ? "Email or Roll Number" : "Username / Email"}
              type="text"
              placeholder={role === "student" ? "e.g. 2023001" : "Enter your username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">Remember me</label>
            </div>
            <Link
              to={`/${role}/forgetPassword`}
              className="text-sm font-semibold text-primary hover:text-primary-hover hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full py-3.5 text-lg font-bold"
            isLoading={isLoading}
          >
            Sign in to Dashboard
          </Button>

          {role === 'student' && (
            <p className="text-center text-sm text-text-secondary mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:text-primary-hover hover:underline">
                Create an account
              </Link>
            </p>
          )}
        </form>



        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">© 2024 College ERP System. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Image/Decoration */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 to-black/80 z-10 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-primary/20 z-10"></div>
        <img
          src={collegeImg}
          alt="College Campus"
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[20s]"
        />
        <div className="absolute bottom-0 left-0 right-0 p-16 z-20 text-white">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-4xl font-bold mb-4 leading-tight font-heading">Empowering Education Through Technology</h2>
            <p className="text-lg text-blue-50 leading-relaxed max-w-lg">
              Streamline your academic journey with our comprehensive management system. Access resources, track progress, and stay connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
