import React, { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import BackButton from "../../components/BackButton";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/Select";

const AddSubject = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({
    selectedCourse: "",
    subject_name: "",
    subject_code: "",
    subject_type: "Theory",
    credits: "",
    semester: "",
    branch: "",
    is_elective: false,
    teacher: ""
  });
  const selectedCourses = ["B-TECH", "M-TECH", "PHD", "DIPLOMA", "CERTIFICATE", "OTHER"];
  const branches = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const subjectTypes = ["Theory", "Practical", "Lab"];
  const creditOptions = [1, 2, 3, 4, 5, 6];

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    setUserRole(role);
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/api/admin/teachers');
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeachers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.subject_name ||
      !formData.subject_code ||
      !formData.credits ||
      !formData.semester ||
      !formData.branch
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        subjectName: formData.subject_name,
        subjectCode: formData.subject_code,
        subjectType: formData.subject_type,
        credits: Number(formData.credits),
        semester: Number(formData.semester),
        branch: formData.branch,
        isElective: formData.is_elective,
        teacherId: formData.teacher || null,
        courseId: selectedCourse || null,
      };

      console.log('Submitting payload:', payload);

      await api.post('/api/admin/subjects', payload);

      toast.success("Subject added successfully");

      setFormData({
        selectedCourse: "",
        subject_name: "",
        subject_code: "",
        subject_type: "Theory",
        credits: "",
        semester: "",
        branch: "",
        is_elective: false,
        teacher: "",
      });

      setSelectedCourse("");

    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error(error.response?.data?.msg || error.response?.data?.message || "Failed to add subject");
    }
  };

  if (userRole && userRole !== 'admin') {
    return (
      <div className="flex flex-col w-full min-h-[100vh] pb-10 items-center justify-center bg-background">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-secondary font-heading">Access Denied</h2>
          <p className="text-text-secondary mb-4">Only administrators can add subjects.</p>
          <p className="text-sm text-text-muted">Please login as admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-[100vh] pb-10 bg-background">
      <div className="px-4 py-8">
        <BackButton />
      </div>

      <div className="text-white flex items-center justify-center py-11">
        <h1 className="font-extrabold text-5xl md:text-8xl text-center overflow-hidden text-secondary font-heading">
          Add Subject
        </h1>
      </div>

      <div className="w-full flex justify-center px-5 lg:px-44">
        <form
          method="post"
          className="bg-white flex flex-col gap-4 justify-evenly py-10 w-full md:w-[50vw] px-10 rounded-xl shadow-xl border border-gray-200"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Select Course *"
              name="selectedCourse"
              value={selectedCourse}
              onValueChange={(value) => {
                setSelectedCourse(value);
                setFormData(prev => ({ ...prev, selectedCourse: value }));
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Course</SelectItem>
                {coursesLoading ? (
                  <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                ) : courses.length === 0 ? (
                  <SelectItem value="no-courses" disabled>No courses available</SelectItem>
                ) : (
                  courses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseName} ({course.courseCode})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Subject Name *"
              name="subject_name"
              value={formData.subject_name}
              onChange={handleChange}
              placeholder="e.g., Data Structures"
              required
            />

            <Input
              label="Subject Code *"
              name="subject_code"
              value={formData.subject_code}
              onChange={handleChange}
              placeholder="e.g., CSE201"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Subject Type *"
              name="subject_type"
              value={formData.subject_type}
              onValueChange={(value) => handleChange({ target: { name: 'subject_type', value } })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {subjectTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              label="Credits *"
              name="credits"
              value={formData.credits}
              onValueChange={(value) => handleChange({ target: { name: 'credits', value } })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Credits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Credits</SelectItem>
                {creditOptions.map(credit => (
                  <SelectItem key={credit} value={credit}>{credit}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              label="Semester *"
              name="semester"
              value={formData.semester}
              onValueChange={(value) => handleChange({ target: { name: 'semester', value } })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Semester</SelectItem>
                {semesters.map(sem => (
                  <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Branch *"
              name="branch"
              value={formData.branch}
              onValueChange={(value) => handleChange({ target: { name: 'branch', value } })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Branch</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              label="Assign Teacher (Optional)"
              name="teacher"
              value={formData.teacher}
              onValueChange={(value) => handleChange({ target: { name: 'teacher', value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Teacher</SelectItem>
                {teachers && teachers.map(teacher => (
                  <SelectItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center mt-6 w-full">
            <Button
              type="submit"
              className="w-full"
            >
              Add Subject
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubject;
