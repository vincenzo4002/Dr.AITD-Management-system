import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Provider } from "react-redux";
import Store from "./app/Store";
import Layout from "./Layout";
import RequireAuth from "./components/RequireAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./Pages/Common/Login";
import Register from "./Pages/Common/Register";
import LandingPage from "./Pages/LandingPage";
import StudentAchievers from "./Pages/Common/StudentAchievers";

import AdminRegister from "./Pages/Common/AdminRegister";
import StudentManagement from "./Pages/Admin/StudentManagement";
import SubjectManagement from "./Pages/Admin/SubjectManagement";
import AddSubject from "./Pages/Admin/AddSubject";
import AddCourse from "./Pages/Admin/AddCourse";
import CreateTeacher from "./Pages/Admin/CreateTeacher";
import CreateStudent from "./Pages/Admin/CreateStudent";
import AdminDashboard from "./Pages/Admin/AdminDashboardNew";
import NotificationSummary from "./Pages/Admin/NotificationSummary";
import TeacherSummary from "./Pages/Teacher/TeacherSummary";
import StudentDashboard from "./Pages/Student/StudentDashboardNew";
import StudentMarks from "./Pages/Student/StudentMarks";
import StudentNotes from "./Pages/Student/StudentNotes";
import StudentMaterials from "./Pages/Student/StudentMaterials";
import StudentAssignments from "./Pages/Student/StudentAssignments";
import StudentAttendance from "./Pages/Student/StudentAttendance";
import StudentTimetable from "./Pages/Student/StudentTimetable";
import StudentNotices from "./Pages/Student/StudentNotices";
import StudentFees from "./Pages/Student/StudentFees";
import StudentLeave from "./Pages/Student/StudentLeave";
import StudentSubjects from "./Pages/Student/StudentSubjects";
import TeacherDashboard from "./Pages/Teacher/TeacherDashboardNew";
import StudentList from "./Pages/Teacher/StudentList";
import StudentProfile from "./Pages/Student/StudentProfile";
import StudentLibrary from "./Pages/Student/StudentLibrary";
import TeacherProfile from "./Pages/Teacher/TeacherProfile";
import TeacherAttendance from "./Pages/Teacher/TeacherAttendance";
import TeacherAssignments from "./Pages/Teacher/TeacherAssignments";
import TeacherMaterials from "./Pages/Teacher/TeacherMaterials";
import TeacherMarks from "./Pages/Teacher/TeacherMarks";
import TeacherResources from "./Pages/Teacher/TeacherResources";

// ... existing imports ...
import TeacherTimetable from "./Pages/Teacher/TeacherTimetable";
import TeacherNotices from "./Pages/Teacher/TeacherNotices";
import TeacherLeave from "./Pages/Teacher/TeacherLeave";
import UpdatePass from "./Pages/Common/UpdatePass";
import ForgetPass from "./Pages/Common/ForgetPassword/ForgetPass";
import VerifyOtp from "./Pages/Common/ForgetPassword/VerifyOtp";
import NotFound from "./Pages/Common/NotFound";
import Unauthorized from "./Pages/Unauthorized";

// Additional Admin Pages
import TeacherManagement from "./Pages/Admin/TeacherManagement";
import CourseManagement from "./Pages/Admin/CourseManagement";
import FeeManagement from "./Pages/Admin/FeeManagement";
import AttendanceManagement from "./Pages/Admin/AttendanceManagement";
import ExamManagement from "./Pages/Admin/ExamManagement";
import LibraryManagement from "./Pages/Admin/LibraryManagement";
import TimetableManagement from "./Pages/Admin/TimetableManagement";
import ReportsManagement from "./Pages/Admin/ReportsManagement";
import SettingsManagement from "./Pages/Admin/SettingsManagement";
import NoticesManagement from "./Pages/Admin/NoticesManagement";
import AdminUpload from "./Pages/Admin/AdminUpload";
import TeacherUpload from "./Pages/Teacher/TeacherUpload";
import AttendanceUpload from "./Pages/Teacher/AttendanceUpload";
import StudentResources from "./Pages/Student/StudentResources";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      {/* home route */}
      <Route index element={<LandingPage />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="achievers" element={<StudentAchievers />} />

      {/* Public Password Reset Routes */}
      <Route path="student/forgetPassword" element={<ForgetPass />} />
      <Route path="teacher/forgetPassword" element={<ForgetPass />} />
      <Route path="admin/forgetPassword" element={<ForgetPass />} />
      <Route path="student/:userId/forgetPassword/verifyotp" element={<VerifyOtp />} />
      <Route path="teacher/:userId/forgetPassword/verifyotp" element={<VerifyOtp />} />
      <Route path="admin/:userId/forgetPassword/verifyotp" element={<VerifyOtp />} />

      {/* student routes */}
      <Route element={<RequireAuth allowedRoles={['admin', 'teacher', 'student']} />}>
        <Route path="student/:studentId">
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="notes" element={<StudentNotes />} />
          <Route path="materials" element={<StudentMaterials />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="notices" element={<StudentNotices />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="leave" element={<StudentLeave />} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="library" element={<StudentLibrary />} />
          <Route path="marks" element={<StudentMarks />} />
          <Route path="updatePassword" element={<UpdatePass />} />
          <Route path="forgetPassword" element={<ForgetPass />} />
          <Route path="forgetPassword/verifyotp" element={<VerifyOtp />} />
        </Route>
      </Route>
      {/* teacher routes */}
      <Route element={<RequireAuth allowedRoles={['admin', 'teacher']} />}>
        <Route path="teacher/:id">
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="students" element={<StudentList />} />
          <Route path="summary" element={<TeacherSummary />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="materials" element={<TeacherMaterials />} />
          <Route path="resources" element={<TeacherResources />} />
          <Route path="marks" element={<TeacherMarks />} />
          <Route path="timetable" element={<TeacherTimetable />} />
          <Route path="notices" element={<TeacherNotices />} />
          <Route path="leave" element={<TeacherLeave />} />
          <Route path="upload" element={<TeacherUpload />} />
          <Route path="attendance/upload" element={<AttendanceUpload />} />
          <Route path="updatePassword" element={<UpdatePass />} />
          <Route path="forgetPassword" element={<ForgetPass />} />
          <Route path="forgetPassword/verifyotp" element={<VerifyOtp />} />
        </Route>
      </Route>
      {/* admin routes */}
      <Route element={<RequireAuth allowedRoles={['admin']} />}>
        <Route path="admin">
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="create-teacher" element={<CreateTeacher />} />
          <Route path="create-student" element={<CreateStudent />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="add-subject" element={<AddSubject />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="notifications" element={<NotificationSummary />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="library" element={<LibraryManagement />} />
          <Route path="timetable" element={<TimetableManagement />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="settings" element={<SettingsManagement />} />
          <Route path="notices" element={<NoticesManagement />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="register" element={<AdminRegister />} />
        </Route>
      </Route>
      {/* 404 and unauthorized routes */}
      <Route path="unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <Provider store={Store}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        bodyClassName="toastBody"
      />
    </Provider>
  </ErrorBoundary>
);
