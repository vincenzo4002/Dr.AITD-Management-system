const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  Student,
  Course,
  Subject,
  Attendance,
  Notes,
  StudyMaterial,
  Assignments,
  Marks,
  Notices,
  Timetable,
  Leave,
  Fee,
  LearningResource
} = require('../models');
const mongoose = require('mongoose');

const isValidId = (id) => {
  const specialIds = ['demo-student', 'admin-student', 'student', 'student1', 'admin'];
  return specialIds.includes(id) || mongoose.Types.ObjectId.isValid(id);
};

// Helper to check access rights
const checkAccess = (req, targetStudentId) => {
  // Admin and Teacher can access any student data
  if (req.user.role === 'admin' || req.user.role === 'teacher') return true;
  // Students can only access their own data
  if (req.user.role === 'student' && req.user.id === targetStudentId) return true;
  return false;
};

// Student Registration
const studentRegister = async (req, res) => {
  try {
    const { name, email, phone, password, courseId } = req.body;

    if (!name || !email || !password || !courseId) {
      return res.status(400).json({ success: false, msg: 'All fields including Course are required' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ success: false, msg: 'Student already exists with this email' });
    }

    // Generate roll number
    const studentCount = await Student.countDocuments();
    const rollNo = `STU${String(studentCount + 1).padStart(4, '0')}`;

    // Generate username from email
    const username = email.split('@')[0];

    const student = new Student({
      name,
      email,
      username,
      phone,
      password,
      rollNo,
      courseId
    });

    await student.save();

    res.status(201).json({
      success: true,
      msg: 'Student registered successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        username: student.username,
        rollNo: student.rollNo
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Student Login
const studentLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, msg: 'Roll Number and Password are required' });
    }

    const student = await Student.findOne({ rollNo: username }).populate('courseId');

    if (!student) {
      return res.status(400).json({ success: false, msg: 'Invalid Roll Number or Password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid Roll Number or Password' });
    }

    const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true });

    return res.json({
      success: true,
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        course: student.courseId,
        role: 'student',
        passwordChanged: student.passwordChanged // Return this flag
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, msg: 'Internal Server Error' });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidId(studentId)) {
      return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });
    }

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const { oldPassword, newPassword } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, msg: 'Student not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Incorrect old password' });
    }

    student.password = newPassword;
    student.passwordChanged = true;
    await student.save();

    res.json({ success: true, msg: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Student Profile
const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }

    // Handle demo students (including backward compatibility)
    if (studentId === 'demo-student' || studentId === 'admin-student' || studentId === 'student' || studentId === 'student1' || studentId === 'admin') {
      return res.json({
        success: true,
        student: {
          _id: studentId,
          name: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'Demo Student' : 'Administrator (Student View)',
          email: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'student@college.edu' : 'admin@college.edu',
          rollNo: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'STU001' : 'ADMIN001',
          phone: '+91 1234567890',
          courseId: {
            courseName: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'Computer Science' : 'System Administration',
            courseCode: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'CSE' : 'ADMIN',
            courseDuration: 4
          }
        }
      });
    }

    const student = await Student.findById(studentId).populate('courseId', 'courseName courseCode courseDuration');

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};


// Get Student Attendance
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });
    const { subjectId, month, year } = req.query;

    // Handle demo students (including backward compatibility)
    if (studentId === 'demo-student' || studentId === 'admin-student' || studentId === 'student' || studentId === 'student1' || studentId === 'admin') {
      return res.json({
        success: true,
        attendance: [],
        student: {
          _id: studentId,
          name: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'Demo Student' : 'Administrator (Student View)',
          email: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'student@college.edu' : 'admin@college.edu'
        },
        stats: {
          totalClasses: 0,
          presentClasses: 0,
          absentClasses: 0,
          attendancePercentage: 0
        }
      });
    }

    // Fetch student data to include in response
    const student = await Student.findById(studentId).populate(
      "courseId",
      "courseName courseCode"
    );

    if (!student) {
      return res.status(404).json({ success: false, msg: "Student not found" });
    }

    let query = { studentId };

    if (subjectId) query.subjectId = subjectId;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate("subjectId", "subjectName subjectCode")
      .sort({ date: -1 });

    // Calculate attendance stats
    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(
      (a) => a.status === "Present"
    ).length;

    const attendancePercentage =
      totalClasses > 0
        ? ((presentClasses / totalClasses) * 100).toFixed(2)
        : 0;

    res.json({
      success: true,
      attendance,
      student,
      stats: {
        totalClasses,
        presentClasses,
        absentClasses: totalClasses - presentClasses,
        attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};


// Get Student Subjects
const getStudentSubjects = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }

    const student = await Student.findById(studentId);
    const subjects = await Subject.find({ courseId: student.courseId, isActive: true });

    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Notes by Subject
const getNotesBySubject = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const { subjectId } = req.query;

    // Handle demo students (including backward compatibility)
    if (studentId === 'demo-student' || studentId === 'admin-student' || studentId === 'student' || studentId === 'student1' || studentId === 'admin') {
      return res.json({
        success: true,
        notes: [],
        student: {
          _id: studentId,
          name: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'Demo Student' : 'Administrator (Student View)'
        }
      });
    }

    const student = await Student.findById(studentId);
    const subjects = await Subject.find({ courseId: student.courseId });
    const subjectIds = subjectId ? [subjectId] : subjects.map(s => s._id);

    const notes = await Notes.find({ subjectId: { $in: subjectIds } })
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, notes, student });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Study Materials
const getStudyMaterials = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const { subjectId } = req.query;

    // Handle demo students (including backward compatibility)
    if (studentId === 'demo-student' || studentId === 'admin-student' || studentId === 'student' || studentId === 'student1' || studentId === 'admin') {
      return res.json({
        success: true,
        materials: [],
        student: {
          _id: studentId,
          name: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'Demo Student' : 'Administrator (Student View)'
        }
      });
    }

    const student = await Student.findById(studentId);
    const subjects = await Subject.find({ courseId: student.courseId });
    const subjectIds = subjectId ? [subjectId] : subjects.map(s => s._id);

    const materials = await StudyMaterial.find({ subjectId: { $in: subjectIds } })
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, materials, student });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Assignments
const getAssignments = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const { subjectId } = req.query;

    // Handle demo students (including backward compatibility)
    if (studentId === 'demo-student' || studentId === 'admin-student' || studentId === 'student' || studentId === 'student1' || studentId === 'admin') {
      return res.json({
        success: true,
        assignments: [],
        student: {
          _id: studentId,
          name: (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') ? 'Demo Student' : 'Administrator (Student View)'
        }
      });
    }

    const student = await Student.findById(studentId);
    const subjects = await Subject.find({ courseId: student.courseId });
    const subjectIds = subjectId ? [subjectId] : subjects.map(s => s._id);

    const assignments = await Assignments.find({ subjectId: { $in: subjectIds } })
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'name')
      .sort({ deadline: 1 });

    res.json({ success: true, assignments, student });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Submit Assignment
const submitAssignment = async (req, res) => {
  try {
    const { studentId, assignmentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) return res.status(400).json({ success: false, msg: 'Invalid Assignment ID' });

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const { fileUrl } = req.body;

    const assignment = await Assignments.findById(assignmentId);

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(s => s.studentId.toString() === studentId);
    if (existingSubmission) {
      return res.status(400).json({ success: false, msg: 'Assignment already submitted' });
    }

    assignment.submissions.push({ studentId, fileUrl });
    await assignment.save();

    res.json({ success: true, msg: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Student Marks
const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const { subjectId, examType } = req.query;

    // Handle demo students (including backward compatibility)
    if (studentId === 'demo-student' || studentId === 'admin-student' || studentId === 'student' || studentId === 'student1' || studentId === 'admin') {
      return res.json({
        success: true,
        marks: []
      });
    }

    let query = { studentId };
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      query.subjectId = subjectId;
    }
    if (examType && typeof examType === 'string' && examType.length <= 50) {
      query.examType = examType;
    }

    const marks = await Marks.find(query)
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, marks });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Notices
const getNotices = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }

    const student = await Student.findById(studentId);
    const notices = await Notices.find({ courseId: student.courseId, isActive: true })
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Comprehensive Student Dashboard
const getStudentDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

    if (!checkAccess(req, studentId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }

    // Handle admin access (including backward compatibility)
    if (studentId === 'admin-student' || studentId === 'admin') {
      const courses = await Course.find({ isActive: true }).limit(1);
      const subjects = await Subject.find({ isActive: true }).limit(2);

      return res.json({
        success: true,
        student: {
          _id: studentId,
          name: 'Administrator (Student View)',
          email: 'admin@college.edu',
          rollNo: 'ADMIN001',
          courseId: courses[0] || { courseName: 'System Administration', courseCode: 'ADMIN' }
        }
      });
    }

    // Handle demo student access (including backward compatibility)
    if (studentId === 'demo-student' || studentId === 'student' || studentId === 'student1') {
      const courses = await Course.find({ isActive: true }).limit(1);

      return res.json({
        success: true,
        student: {
          _id: studentId,
          name: 'Demo Student',
          email: 'student@college.edu',
          rollNo: 'STU001',
          courseId: courses[0] || { courseName: 'Computer Science', courseCode: 'CSE' }
        }
      });
    }

    const student = await Student.findById(studentId).populate('courseId');

    if (!student) {
      return res.status(404).json({ success: false, msg: 'Student not found' });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

module.exports = {
  studentRegister,
  studentLogin,
  getStudentProfile,
  getStudentAttendance,
  getStudentSubjects,
  getNotesBySubject,
  getStudyMaterials,
  getAssignments,
  submitAssignment,
  getStudentMarks,
  getNotices,
  getStudentDashboard,
  changePassword, // Export this
  // New Features
  getTimetable: async (req, res) => {
    try {
      const { studentId } = req.params;
      if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

      if (!checkAccess(req, studentId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const student = await Student.findById(studentId);
      const timetable = await Timetable.find({ courseId: student.courseId, isActive: true })
        .populate('subjectId', 'subjectName subjectCode')
        .populate('teacherId', 'name')
        .sort({ day: 1, timeSlot: 1 });
      res.json({ success: true, timetable });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },
  getFees: async (req, res) => {
    try {
      const { studentId } = req.params;
      if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

      if (!checkAccess(req, studentId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const fees = await Fee.find({ studentId, isActive: true }).sort({ dueDate: 1 });
      res.json({ success: true, fees });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },
  applyLeave: async (req, res) => {
    try {
      const { studentId } = req.params;
      if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

      if (!checkAccess(req, studentId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const { leaveType, startDate, endDate, reason } = req.body;
      const leave = new Leave({
        userId: studentId,
        userRole: 'student',
        leaveType,
        startDate,
        endDate,
        reason
      });
      await leave.save();
      res.json({ success: true, msg: 'Leave application submitted', leave });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },
  getLeaves: async (req, res) => {
    try {
      const { studentId } = req.params;
      if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

      if (!checkAccess(req, studentId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const leaves = await Leave.find({ userId: studentId }).sort({ createdAt: -1 });
      res.json({ success: true, leaves });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },
  getResources: async (req, res) => {
    try {
      const { studentId } = req.params;
      if (!isValidId(studentId)) return res.status(400).json({ success: false, msg: 'Invalid Student ID format' });

      if (!checkAccess(req, studentId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const { subjectId, type } = req.query;

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, msg: 'Student not found' });
      }

      // Find subjects for the student's course
      const subjects = await Subject.find({ courseId: student.courseId });
      const subjectIds = subjects.map(s => s._id);

      let query = {
        subjectId: { $in: subjectIds },
        isActive: true,
        isPublished: true
      };

      if (subjectId) query.subjectId = subjectId;
      if (type) query.type = type;

      const resources = await LearningResource.find(query)
        .populate('subjectId', 'subjectName subjectCode')
        .populate('teacherId', 'name') // Assuming teacherId stores the ID or object with name
        .sort({ createdAt: -1 });

      res.json({ success: true, resources });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }
};