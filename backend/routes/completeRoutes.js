const express = require('express');
const router = express.Router();

// ================= MIDDLEWARES =================
const { verifyToken, isAdmin, isTeacher } = require('../middleware/Auth');
const upload = require('../middleware/upload');
const errorHandler = require('../middleware/errorHandler');
const validateId = require('../middleware/validateId');

// ================= CONTROLLERS =================
const authController = require('../controller/authController');
const adminController = require('../controller/adminController');
const teacherController = require('../controller/teacherController');
const studentController = require('../controller/studentController');

// ================= MODELS =================
const { Course, Subject, Teacher, Student } = require('../models');


// ======================================================
//                    UNIFIED AUTH ROUTES
// ======================================================
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// Legacy Login Routes (Redirect to unified logic or keep for backward compatibility if needed)
// For now, we point them to the new controller to ensure DB auth works even if frontend isn't updated instantly
router.post('/admin/login', (req, res, next) => { req.body.role = 'admin'; authController.login(req, res, next); });
router.post('/teacher/login', (req, res, next) => { req.body.role = 'teacher'; authController.login(req, res, next); });
router.post('/student/login', (req, res, next) => { req.body.role = 'student'; authController.login(req, res, next); });

// Password Reset Routes
// Password Reset Routes
router.post('/student/forgetPassword', (req, res, next) => { req.body.role = 'student'; authController.forgotPassword(req, res, next); });
router.post('/teacher/forgetPassword', (req, res, next) => { req.body.role = 'teacher'; authController.forgotPassword(req, res, next); });
router.post('/admin/forgetPassword', (req, res, next) => { req.body.role = 'admin'; authController.forgotPassword(req, res, next); });

router.post('/student/verifyOtp', (req, res, next) => { req.body.role = 'student'; authController.verifyOtp(req, res, next); });
router.post('/teacher/verifyOtp', (req, res, next) => { req.body.role = 'teacher'; authController.verifyOtp(req, res, next); });
router.post('/admin/verifyOtp', (req, res, next) => { req.body.role = 'admin'; authController.verifyOtp(req, res, next); });

router.post('/student/resetPassword', (req, res, next) => { req.body.role = 'student'; authController.resetPassword(req, res, next); });
router.post('/teacher/resetPassword', (req, res, next) => { req.body.role = 'teacher'; authController.resetPassword(req, res, next); });
router.post('/admin/resetPassword', (req, res, next) => { req.body.role = 'admin'; authController.resetPassword(req, res, next); });


// ======================================================
//                      TEACHER ROUTES
// ======================================================

// ======================================================
//              ADMIN USING TEACHER FUNCTIONS
//              (Must be before parameterized routes)
// ======================================================
router.post('/teacher/admin/attendance', verifyToken, (req, res, next) => {
  // Set teacherId in params for the controller to use
  req.params.teacherId = req.body.teacherId || 'admin';
  // Call the controller
  teacherController.markAttendance(req, res, next);
});
router.post('/teacher/admin/assignments', verifyToken, upload.single('file'), (req, res, next) => {
  req.params.teacherId = 'admin';
  teacherController.addAssignment(req, res, next);
});
router.post('/teacher/admin/notices', verifyToken, (req, res, next) => {
  req.params.teacherId = 'admin';
  teacherController.addNotice(req, res, next);
});
router.post('/teacher/admin/materials', verifyToken, upload.single('file'), (req, res, next) => {
  req.params.teacherId = 'admin';
  teacherController.addStudyMaterial(req, res, next);
});
router.get('/teacher/admin/dashboard', verifyToken, (req, res, next) => {
  req.params.teacherId = 'admin';
  teacherController.getTeacherDashboard(req, res, next);
});

// Dashboard + subjects + courses
router.get('/teacher/:teacherId/dashboard', verifyToken, validateId('teacherId'), teacherController.getTeacherDashboard);
router.post('/teacher/:teacherId/change-password', verifyToken, teacherController.changePassword);
router.put('/teacher/:teacherId/profile', verifyToken, isAdmin, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, email, phone, department, designation } = req.body;
    const { Teacher } = require('../models');

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { name, email, phone, department, designation },
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ success: false, msg: 'Teacher not found' });
    }

    res.json({ success: true, teacher: updatedTeacher });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
});

// Students by subject
router.get('/teacher/:teacherId/subjects/:subjectId/students', verifyToken, validateId(['teacherId', 'subjectId']), teacherController.getStudentsBySubject);

// Attendance
router.post('/teacher/:teacherId/attendance', verifyToken, validateId('teacherId'), teacherController.markAttendance);
router.get('/teacher/:teacherId/attendance-report', verifyToken, teacherController.getAttendanceReport);

// Assignments
router.get('/teacher/:teacherId/assignments', verifyToken, validateId('teacherId'), teacherController.getTeacherAssignments);
router.post('/teacher/:teacherId/assignments', verifyToken, validateId('teacherId'), upload.single('file'), teacherController.addAssignment);

// Marks
router.post('/teacher/:teacherId/marks', verifyToken, teacherController.addMarks);
router.get('/teacher/:teacherId/marks/:subjectId', verifyToken, teacherController.getAllStudentsMarks);

// Teacher subjects and courses
router.get('/teacher/:teacherId/subjects', verifyToken, teacherController.getTeacherSubjects);
router.get('/teacher/:teacherId/courses', verifyToken, teacherController.getTeacherCourses);

// Notes + Materials + Notices
router.post('/teacher/:teacherId/notes', verifyToken, upload.single('file'), teacherController.addNotes);
router.post('/teacher/:teacherId/materials', verifyToken, upload.single('file'), teacherController.addStudyMaterial);
router.post('/teacher/:teacherId/notices', verifyToken, teacherController.addNotice);

router.get('/teacher/:teacherId/notes', verifyToken, teacherController.getTeacherNotes);
router.get('/teacher/:teacherId/materials', verifyToken, teacherController.getTeacherMaterials);
router.get('/teacher/:teacherId/notices', verifyToken, teacherController.getTeacherNotices);

// Timetable + Leave
router.get('/teacher/:teacherId/timetable', verifyToken, teacherController.getTimetable);
router.post('/teacher/:teacherId/leave', verifyToken, teacherController.applyLeave);
router.get('/teacher/:teacherId/leaves', verifyToken, teacherController.getLeaves);

// Learning Resources (NEW)
router.post('/teacher/:teacherId/resources', verifyToken, upload.single('file'), teacherController.addResource);
router.get('/teacher/:teacherId/resources', verifyToken, teacherController.getResources);
router.delete('/teacher/:teacherId/resources/:resourceId', verifyToken, teacherController.deleteResource);


// ======================================================
//                      STUDENT ROUTES
// ======================================================
router.post('/student/register', studentController.studentRegister);
router.post('/student/:studentId/change-password', verifyToken, validateId('studentId'), studentController.changePassword);

router.get('/student/:studentId/dashboard', verifyToken, validateId('studentId'), studentController.getStudentDashboard);
router.get('/student/:studentId/profile', verifyToken, validateId('studentId'), studentController.getStudentProfile);
router.put('/student/:studentId/profile', verifyToken, isAdmin, validateId('studentId'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email, phone } = req.body;
    const { Student } = require('../models');

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { name, email, phone },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, msg: 'Student not found' });
    }

    res.json({ success: true, student: updatedStudent });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
});
router.get('/student/:studentId/attendance', verifyToken, validateId('studentId'), studentController.getStudentAttendance);
router.get('/student/:studentId/subjects', verifyToken, validateId('studentId'), studentController.getStudentSubjects);
router.get('/student/:studentId/notes', verifyToken, validateId('studentId'), studentController.getNotesBySubject);
router.get('/student/:studentId/resources', verifyToken, validateId('studentId'), studentController.getResources);
router.get('/student/:studentId/materials', verifyToken, validateId('studentId'), studentController.getStudyMaterials);
router.get('/student/:studentId/assignments', verifyToken, validateId('studentId'), studentController.getAssignments);
router.post('/student/:studentId/assignments/:assignmentId/submit', verifyToken, validateId(['studentId', 'assignmentId']), studentController.submitAssignment);
router.get('/student/:studentId/marks', verifyToken, validateId('studentId'), studentController.getStudentMarks);
router.get('/student/:studentId/notices', verifyToken, validateId('studentId'), studentController.getNotices);

// Timetable + Fees + Leave
router.get('/student/:studentId/timetable', verifyToken, validateId('studentId'), studentController.getTimetable);
router.get('/student/:studentId/fees', verifyToken, validateId('studentId'), studentController.getFees);
router.post('/student/:studentId/leave', verifyToken, validateId('studentId'), studentController.applyLeave);
router.get('/student/:studentId/leaves', verifyToken, studentController.getLeaves);

// Library
router.get('/student/library/books', verifyToken, adminController.getAllBooks);


// ======================================================
//                      ADMIN DASHBOARD
// ======================================================
router.get('/admin/dashboard', verifyToken, isAdmin, adminController.getDashboardData);


// ======================================================
//                       ADMIN MANAGEMENT
// ======================================================

// Students
router.get('/admin/students', verifyToken, adminController.getAllStudents);
router.post('/admin/students', verifyToken, isAdmin, adminController.addStudent);
router.put('/admin/students/:studentId', verifyToken, isAdmin, validateId('studentId'), adminController.updateStudent);
router.delete('/admin/students/:studentId', verifyToken, isAdmin, validateId('studentId'), adminController.deleteStudent);
router.get('/admin/students/:studentId', verifyToken, validateId('studentId'), adminController.getStudentDetails);

// Teachers
router.get('/admin/teachers', verifyToken, adminController.getAllTeachers);
router.post('/admin/teachers', verifyToken, isAdmin, adminController.addTeacher);
router.put('/admin/teachers/:teacherId', verifyToken, isAdmin, validateId('teacherId'), adminController.updateTeacher);
router.delete('/admin/teachers/:teacherId', verifyToken, isAdmin, validateId('teacherId'), adminController.deleteTeacher);
router.get('/admin/teachers/:teacherId', verifyToken, isAdmin, validateId('teacherId'), adminController.getTeacherDetails);

// Courses (public read, admin write)
router.get('/courses', adminController.getAllCourses);
router.get('/admin/courses', verifyToken, adminController.getAllCourses);
router.post('/admin/courses', verifyToken, isAdmin, adminController.addCourse);
router.put('/admin/courses/:courseId', verifyToken, isAdmin, validateId('courseId'), adminController.updateCourse);
router.delete('/admin/courses/:courseId', verifyToken, isAdmin, validateId('courseId'), adminController.deleteCourse);

// Subjects (public read, admin write)
router.get('/subjects', adminController.getAllSubjects);
router.get('/admin/subjects', verifyToken, adminController.getAllSubjects);
router.post('/admin/subjects', verifyToken, isAdmin, adminController.addSubject);
router.post('/subjects/add', verifyToken, isAdmin, adminController.addSubject);
router.delete('/admin/subjects/:subjectId', verifyToken, isAdmin, validateId('subjectId'), adminController.deleteSubject);

// Teacher ↔ Subject assignment
router.post('/admin/assign-teacher', verifyToken, isAdmin, adminController.assignTeacherToSubject);
router.post('/admin/remove-teacher', verifyToken, isAdmin, adminController.removeTeacherFromSubject);

// Attendance report
router.get('/admin/attendance-report', verifyToken, isAdmin, adminController.getComprehensiveAttendanceReport);

// Other Reports
router.get('/admin/reports/fees', verifyToken, isAdmin, adminController.getFeeReport);
router.get('/admin/reports/academic', verifyToken, isAdmin, adminController.getAcademicReport);
router.get('/admin/reports/enrollment', verifyToken, isAdmin, adminController.getEnrollmentReport);

// Manual Reports
router.post('/admin/manual-reports', verifyToken, isAdmin, adminController.createManualReport);
router.get('/admin/manual-reports', verifyToken, isAdmin, adminController.getAllManualReports);
router.put('/admin/manual-reports/:reportId', verifyToken, isAdmin, validateId('reportId'), adminController.updateManualReport);
router.delete('/admin/manual-reports/:reportId', verifyToken, isAdmin, validateId('reportId'), adminController.deleteManualReport);

// ================= TIMETABLE ROUTES =================
router.post('/admin/timetable', verifyToken, isAdmin, adminController.addTimetable);
router.get('/admin/timetable', verifyToken, isAdmin, adminController.getTimetable);
router.delete('/admin/timetable/:id', verifyToken, isAdmin, validateId('id'), adminController.deleteTimetable);

// ================= FEE ROUTES =================
router.get('/admin/fees', verifyToken, isAdmin, adminController.getAllFees);
router.post('/admin/fees', verifyToken, isAdmin, adminController.addFee);
router.put('/admin/fees/:id', verifyToken, isAdmin, validateId('id'), adminController.updateFee);

// ================= SETTINGS ROUTES =================
router.get('/admin/settings', verifyToken, isAdmin, adminController.getSettings);
router.put('/admin/settings', verifyToken, isAdmin, adminController.updateSettings);

// ================= LIBRARY ROUTES =================
router.post('/admin/library/books', verifyToken, isAdmin, adminController.addBook);
router.get('/admin/library/books', verifyToken, isAdmin, adminController.getAllBooks);
router.post('/admin/library/issue', verifyToken, isAdmin, adminController.issueBook);
router.post('/admin/library/return', verifyToken, isAdmin, adminController.returnBook);
router.delete('/admin/library/books/:id', verifyToken, isAdmin, validateId('id'), adminController.deleteBook);

// Delete operations
router.delete('/admin/assignments/:assignmentId', verifyToken, isAdmin, validateId('assignmentId'), adminController.deleteAssignment);
router.delete('/admin/notices/:noticeId', verifyToken, isAdmin, validateId('noticeId'), adminController.deleteNotice);
router.delete('/admin/materials/:materialId', verifyToken, isAdmin, validateId('materialId'), adminController.deleteMaterial);

// Get all operations
router.get('/admin/notices', verifyToken, isAdmin, adminController.getAllNotices);
router.get('/admin/assignments', verifyToken, isAdmin, adminController.getAllAssignments);
router.get('/admin/materials', verifyToken, isAdmin, adminController.getAllMaterials);
router.get('/admin/attendance', verifyToken, isAdmin, adminController.getAllAttendance);


// Teacher student management
router.get('/teacher/students/:studentId', verifyToken, validateId('studentId'), adminController.getStudentDetails);
router.put('/teacher/students/:studentId', verifyToken, isAdmin, validateId('studentId'), adminController.updateStudent);
router.delete('/teacher/students/:studentId', verifyToken, isAdmin, validateId('studentId'), adminController.deleteStudent);


// ======================================================
// Error Handler (Must be last)
router.use(errorHandler);

module.exports = router;
