import React, { useState } from "react";
import { toast } from "react-toastify";
import authService from "../../services/authService";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Lock } from "lucide-react";

const UpdatePass = () => {
  const { id } = useParams();

  let role = useSelector((state) => state.User.role);

  let navigate = useNavigate();

  const [data, setData] = useState({
    currpass: "",
    newpass: "",
    confirmpass: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        oldPassword: data.currpass,
        newPassword: data.newpass
      };

      const res = await authService.updatePassword(data.currpass, data.newpass, id, role);

      setData({
        currpass: "",
        newpass: "",
        confirmpass: "",
      });

      toast.success("Password Updated Successfully");

      role === "teacher"
        ? navigate(`/teacher/${id}/dashboard`)
        : navigate(`/student/${id}/dashboard`);
    } catch (err) {
      console.log("Something Went Wrong", err);
      toast.error(err.response?.data?.msg || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-secondary font-heading">
            Update Password
          </h1>
          <p className="text-text-secondary mt-2">
            Ensure your account stays secure by updating your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter Current Password"
            name="currpass"
            value={data.currpass}
            onChange={handleChange}
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter New Password"
            name="newpass"
            value={data.newpass}
            onChange={handleChange}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm New Password"
            name="confirmpass"
            value={data.confirmpass}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePass;
