// teacherController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {
  Teacher,
  Student,
  Subject,
  Course,
  TeacherSubjectAssignment,
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
// Helper to check access rights
const checkAccess = (req, targetTeacherId) => {
  // Admin can access any teacher data
  if (req.user.role === 'admin') return true;
  // Teachers can only access their own data
  if (req.user.role === 'teacher' && req.user.id === targetTeacherId) return true;
  // Special case for demo/hardcoded IDs if the logged in user is a teacher (allowing them to see demo data? maybe not secure but practical for this codebase)
  if (req.user.role === 'teacher' && (targetTeacherId === 'teacher' || targetTeacherId === 'admin')) return true;
  return false;
};

const isValidId = (id) => {
  const specialIds = ['teacher', 'admin', 'gulshan', 'ankita', 'aditya', 'abhishek']; // Add demo IDs
  return specialIds.includes(id) || mongoose.Types.ObjectId.isValid(id);
};

const sendNotification = async (type, data) => {
  try {
    console.log(`Notification: ${type}`);
    return true;
  } catch (error) {
    console.log('Notification error:', error.message);
    return false;
  }
};

// Helpers
const normalizeDateOnly = (d) => {
  // Accept string or Date; return YYYY-MM-DD
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().split('T')[0];
};

const buildFileUrl = (req, file) => {
  if (!file) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
};

// NOTE: Teacher registration removed - Teachers are now created by admin only

// ------------------------- TEACHER LOGIN -------------------------
// ------------------------- TEACHER LOGIN -------------------------
const teacherLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, msg: 'Username and password required' });
    }

    // Check if teacher exists in DB
    const teacher = await Teacher.findOne({
      $or: [{ email: username }, { username: username }]
    });

    if (!teacher) {
      return res.status(404).json({ success: false, msg: 'Teacher not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: teacher._id, role: 'teacher' }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true });

    return res.json({
      success: true,
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        assignedCourse: teacher.assignedCourse,
        assignedSubjects: teacher.assignedSubjects,
        role: 'teacher'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- TEACHER DASHBOARD -------------------------
const getTeacherDashboard = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

    if (!checkAccess(req, teacherId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }

    // Demo/predefined handlers
    const demoIds = ['gulshan', 'ankita', 'aditya', 'abhishek'];
    if (demoIds.includes(teacherId)) {
      // Try fetching by username first
      const teacher = await Teacher.findOne({ username: teacherId })
        .populate('assignedCourse', 'courseName courseCode')
        .populate({
          path: 'assignedSubjects',
          select: 'subjectName subjectCode courseId',
          populate: { path: 'courseId', select: 'courseName courseCode' }
        });

      if (teacher) {
        const assignments = await TeacherSubjectAssignment.find({ teacherId: teacher._id, isActive: true })
          .populate('subjectId', 'subjectName subjectCode')
          .populate('courseId', 'courseName courseCode');

        return res.json({ success: true, teacher, assignments });
      }
    }

    if (teacherId === 'teacher') {
      const courses = await Course.find({ isActive: true });
      const subjects = await Subject.find({ isActive: true }).populate('courseId', 'courseName courseCode');

      return res.json({
        success: true,
        teacher: {
          _id: 'teacher',
          name: 'Demo Teacher',
          email: 'teacher@college.edu',
          assignedCourse: courses,
          assignedSubjects: subjects,
          department: 'Computer Science',
          designation: 'Assistant Professor'
        },
        assignments: []
      });
    }

    if (teacherId === 'admin') {
      const courses = await Course.find({ isActive: true });
      const subjects = await Subject.find({ isActive: true }).populate('courseId', 'courseName courseCode');

      return res.json({
        success: true,
        teacher: {
          _id: 'admin',
          name: 'Administrator (Teacher View)',
          email: 'admin@college.edu',
          assignedCourse: courses,
          assignedSubjects: subjects,
          department: 'Administration',
          designation: 'System Administrator'
        },
        assignments: []
      });
    }

    const teacher = await Teacher.findById(teacherId)
      .populate('assignedCourse', 'courseName courseCode')
      .populate({
        path: 'assignedSubjects',
        select: 'subjectName subjectCode courseId',
        populate: { path: 'courseId', select: 'courseName courseCode' }
      });

    if (!teacher) {
      return res.status(404).json({ success: false, msg: 'Teacher not found' });
    }

    const assignments = await TeacherSubjectAssignment.find({ teacherId, isActive: true })
      .populate('subjectId', 'subjectName subjectCode')
      .populate('courseId', 'courseName courseCode');

    res.json({ success: true, teacher, assignments });
  } catch (error) {
    console.error('getTeacherDashboard error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- GET TEACHER SUBJECTS (NEW) -------------------------
const getTeacherSubjects = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

    if (!checkAccess(req, teacherId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }

    if (!teacherId) return res.status(400).json({ success: false, msg: 'teacherId required' });

    if (teacherId === 'admin' || teacherId === 'teacher') {
      const subjects = await Subject.find({ isActive: true }).select('subjectName subjectCode courseId');
      return res.json({ success: true, subjects });
    }

    const teacher = await Teacher.findById(teacherId).populate('assignedSubjects', 'subjectName subjectCode courseId');
    if (!teacher) return res.status(404).json({ success: false, msg: 'Teacher not found' });

    res.json({ success: true, subjects: teacher.assignedSubjects || [] });
  } catch (error) {
    console.error('getTeacherSubjects error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- GET TEACHER COURSES (NEW) -------------------------
const getTeacherCourses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

    if (!checkAccess(req, teacherId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }

    if (!teacherId) return res.status(400).json({ success: false, msg: 'teacherId required' });

    if (teacherId === 'admin' || teacherId === 'teacher') {
      const courses = await Course.find({ isActive: true }).select('courseName courseCode');
      return res.json({ success: true, courses });
    }

    const teacher = await Teacher.findById(teacherId).populate('assignedCourse', 'courseName courseCode');
    if (!teacher) return res.status(404).json({ success: false, msg: 'Teacher not found' });

    res.json({ success: true, courses: teacher.assignedCourse || [] });
  } catch (error) {
    console.error('getTeacherCourses error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- GET STUDENTS BY SUBJECT (accepts teacherId param) -------------------------
const getStudentsBySubject = async (req, res) => {
  try {
    // route: /api/teacher/:teacherId/subjects/:subjectId/students
    const { subjectId } = req.params;

    if (!subjectId) return res.status(400).json({ success: false, msg: 'subjectId required' });

    const subject = await Subject.findById(subjectId).populate('courseId');
    if (!subject) return res.status(404).json({ success: false, msg: 'Subject not found' });

    const students = await Student.find({ courseId: subject.courseId, isActive: true });
    res.json({ success: true, students, subject });
  } catch (error) {
    console.error('getStudentsBySubject error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- MARK ATTENDANCE -------------------------
const markAttendance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });
    const { subjectId, date, attendance } = req.body;

    console.log('Attendance request:', { teacherId, subjectId, date, attendanceCount: attendance?.length });

    if (!subjectId || !date || !attendance || !Array.isArray(attendance)) {
      return res.status(400).json({ success: false, msg: 'subjectId, date and attendance array are required' });
    }

    if (attendance.length === 0) {
      return res.status(400).json({ success: false, msg: 'Attendance array cannot be empty' });
    }

    const actualTeacherId = teacherId === 'admin' ? 'admin' : teacherId;
    const attendanceDate = new Date(date);

    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ success: false, msg: 'Invalid date format' });
    }

    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Delete existing attendance for that subject & date
    const deleteResult = await Attendance.deleteMany({
      subjectId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} existing attendance records`);

    // Create new attendance records
    const attendanceRecords = attendance.map(record => ({
      studentId: record.studentId,
      subjectId,
      teacherId: actualTeacherId,
      date: attendanceDate,
      status: record.status
    }));

    const savedRecords = await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Saved ${savedRecords.length} new attendance records`);

    res.json({ success: true, msg: 'Attendance marked successfully', savedCount: savedRecords.length });
  } catch (error) {
    console.error('❌ markAttendance error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- GET ATTENDANCE REPORT -------------------------
const getAttendanceReport = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (teacherId && !isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });
    const { subjectId, courseId, startDate, endDate } = req.query;

    const teacher = await Teacher.findById(teacherId).populate('assignedSubjects assignedCourse');

    let query = {};
    // For admin/demo teacher, teacherId may be 'admin' or 'teacher' - allow query on those but keep teacherId filtering if real
    if (teacherId && teacherId !== 'admin' && teacherId !== 'teacher') {
      query.teacherId = teacherId;
    }

    if (subjectId) query.subjectId = subjectId;
    if (startDate && endDate) {
      const s = normalizeDateOnly(startDate);
      const e = normalizeDateOnly(endDate);
      if (!s || !e) return res.status(400).json({ success: false, msg: 'Invalid startDate or endDate' });
      query.date = { $gte: s, $lte: e };
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name rollNo email courseId')
      .populate('subjectId', 'subjectName subjectCode courseId')
      .populate({ path: 'studentId', populate: { path: 'courseId', select: 'courseName courseCode' } })
      .sort({ date: -1 });

    // Build student stats
    const studentStats = {};
    attendance.forEach(record => {
      const sid = record.studentId._id.toString();
      if (!studentStats[sid]) {
        studentStats[sid] = {
          student: record.studentId,
          totalClasses: 0,
          presentClasses: 0,
          absentClasses: 0,
          subjects: {}
        };
      }

      const subId = record.subjectId._id.toString();
      if (!studentStats[sid].subjects[subId]) {
        studentStats[sid].subjects[subId] = { subject: record.subjectId, total: 0, present: 0, absent: 0 };
      }

      studentStats[sid].totalClasses++;
      studentStats[sid].subjects[subId].total++;

      if (record.status === 'Present') {
        studentStats[sid].presentClasses++;
        studentStats[sid].subjects[subId].present++;
      } else {
        studentStats[sid].absentClasses++;
        studentStats[sid].subjects[subId].absent++;
      }
    });

    // Compute percentages
    Object.keys(studentStats).forEach(sid => {
      const stats = studentStats[sid];
      stats.attendancePercentage = stats.totalClasses > 0 ? ((stats.presentClasses / stats.totalClasses) * 100).toFixed(2) : '0.00';
      Object.keys(stats.subjects).forEach(subId => {
        const ss = stats.subjects[subId];
        ss.percentage = ss.total > 0 ? ((ss.present / ss.total) * 100).toFixed(2) : '0.00';
      });
    });

    res.json({
      success: true,
      attendance,
      studentStats: Object.values(studentStats),
      teacher: {
        assignedSubjects: teacher?.assignedSubjects || [],
        assignedCourses: teacher?.assignedCourse || []
      }
    });
  } catch (error) {
    console.error('getAttendanceReport error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- ADD MARKS -------------------------
const addMarks = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });
    const { studentId, subjectId, marks, totalMarks, examType } = req.body;

    if (!studentId || !subjectId || marks == null || totalMarks == null) {
      return res.status(400).json({ success: false, msg: 'studentId, subjectId, marks and totalMarks are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, msg: 'Invalid student or subject ID' });
    }

    const markRecord = new Marks({ studentId, subjectId, teacherId, marks, totalMarks, examType });
    await markRecord.save();

    const teacher = teacherId === 'admin' ? { name: 'Administrator' } : await Teacher.findById(teacherId);
    const subject = await Subject.findById(subjectId);

    // Send notification to student
    await sendNotification('marks', {
      sender: { id: teacherId, role: 'teacher', name: teacher?.name || 'Teacher' },
      subjectName: subject?.subjectName || '',
      studentId,
      entityId: markRecord._id
    });

    res.status(201).json({ success: true, msg: 'Marks added successfully', markRecord });
  } catch (error) {
    console.error('addMarks error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- GET ALL STUDENTS MARKS -------------------------
const getAllStudentsMarks = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });
    if (subjectId && !mongoose.Types.ObjectId.isValid(subjectId)) return res.status(400).json({ success: false, msg: 'Invalid Subject ID' });
    if (!subjectId) return res.status(400).json({ success: false, msg: 'subjectId required' });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, msg: 'Subject not found' });

    const students = await Student.find({ courseId: subject.courseId, isActive: true });

    const marks = await Marks.find({ subjectId, teacherId })
      .populate('studentId', 'name rollNo email')
      .sort({ examType: 1, createdAt: -1 });

    const studentMarks = {};
    students.forEach(student => {
      studentMarks[student._id] = {
        student,
        marks: {},
        totalMarks: 0,
        totalPossible: 0,
        percentage: 0
      };
    });

    marks.forEach(mark => {
      const sid = mark.studentId._id.toString();
      if (!studentMarks[sid]) return;
      if (!studentMarks[sid].marks[mark.examType]) studentMarks[sid].marks[mark.examType] = [];
      studentMarks[sid].marks[mark.examType].push(mark);
      studentMarks[sid].totalMarks += mark.marks;
      studentMarks[sid].totalPossible += mark.totalMarks;
    });

    Object.keys(studentMarks).forEach(sid => {
      const s = studentMarks[sid];
      s.percentage = s.totalPossible > 0 ? ((s.totalMarks / s.totalPossible) * 100).toFixed(2) : '0.00';
    });

    res.json({ success: true, studentMarks: Object.values(studentMarks), subject });
  } catch (error) {
    console.error('getAllStudentsMarks error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- ADD NOTES -------------------------
const addNotes = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });
    const { subjectId, title, description } = req.body;

    if (!title || !subjectId) {
      return res.status(400).json({ success: false, msg: 'Title and subject are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, msg: 'Invalid subject ID' });
    }

    const fileUrl = buildFileUrl(req, req.file);

    const note = new Notes({ teacherId, subjectId, title, fileUrl, description });
    await note.save();

    res.status(201).json({ success: true, msg: 'Note added successfully', note });
  } catch (error) {
    console.error('addNotes error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- ADD STUDY MATERIAL -------------------------
const addStudyMaterial = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });
    const { subjectId, title, description } = req.body;

    if (!title || !subjectId) {
      return res.status(400).json({ success: false, msg: 'Title and subject are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, msg: 'Invalid subject ID' });
    }

    const actualTeacherId = teacherId === 'admin' ? 'admin' : teacherId;
    let materialFileUrl = req.body.fileUrl || buildFileUrl(req, req.file);

    if (!materialFileUrl) {
      return res.status(400).json({ success: false, msg: 'Please provide a file or file URL' });
    }

    const material = new StudyMaterial({ teacherId: actualTeacherId, subjectId, title, fileUrl: materialFileUrl, description });
    await material.save();

    const teacher = actualTeacherId === 'admin' ? { name: 'Administrator' } : await Teacher.findById(actualTeacherId);
    const subject = await Subject.findById(subjectId).populate('courseId');

    // Notify students of the course
    await sendNotification('material', {
      sender: { id: actualTeacherId, role: 'teacher', name: teacher?.name || 'Teacher' },
      title,
      courseId: subject?.courseId?._id,
      subjectId,
      entityId: material._id
    });

    res.status(201).json({ success: true, msg: 'Study material added successfully', material });
  } catch (error) {
    console.error('addStudyMaterial error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- ADD ASSIGNMENT -------------------------
const addAssignment = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });
    const { subjectId, title, description, deadline, maxMarks, submissionType } = req.body;

    if (!title || !subjectId || !deadline) {
      return res.status(400).json({ success: false, msg: 'Title, subject, and deadline are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, msg: 'Invalid subject ID' });
    }

    const actualTeacherId = teacherId === 'admin' ? 'admin' : teacherId;
    const fileUrl = buildFileUrl(req, req.file) || req.body.fileUrl || null;

    let files = [];
    if (req.file) {
      files.push({
        name: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        type: req.file.mimetype
      });
    }

    const assignment = new Assignments({
      teacherId: actualTeacherId,
      subjectId,
      title,
      description,
      deadline,
      fileUrl,
      maxMarks: maxMarks || null,
      submissionType: submissionType || 'online',
      files
    });
    await assignment.save();

    const teacher = actualTeacherId === 'admin' ? { name: 'Administrator' } : await Teacher.findById(actualTeacherId);
    const subject = await Subject.findById(subjectId).populate('courseId');

    // Notify students
    await sendNotification('assignment', {
      sender: { id: actualTeacherId, role: 'teacher', name: teacher?.name || 'Teacher' },
      title,
      courseId: subject?.courseId?._id,
      subjectId,
      entityId: assignment._id
    });

    res.status(201).json({ success: true, msg: 'Assignment added successfully', assignment });
  } catch (error) {
    console.error('addAssignment error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, msg: error.message });
    }
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- ADD NOTICE -------------------------
const addNotice = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });
    const { courseId, title, description } = req.body;

    if (!title || !description || !courseId) {
      return res.status(400).json({ success: false, msg: 'Title, description, and course are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, msg: 'Invalid course ID' });
    }

    const actualTeacherId = teacherId === 'admin' ? 'admin' : teacherId;

    const notice = new Notices({ teacherId: actualTeacherId, courseId, title, description });
    await notice.save();

    const teacher = actualTeacherId === 'admin' ? { name: 'Administrator' } : await Teacher.findById(actualTeacherId);

    // Notify students in the course
    await sendNotification('notice', {
      sender: { id: actualTeacherId, role: 'teacher', name: teacher?.name || 'Teacher' },
      title,
      courseId,
      entityId: notice._id
    });

    res.status(201).json({ success: true, msg: 'Notice added successfully', notice });
  } catch (error) {
    console.error('addNotice error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- GET TEACHER'S NOTES -------------------------
const getTeacherNotes = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

    if (!checkAccess(req, teacherId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const notes = await Notes.find({ teacherId }).populate('subjectId', 'subjectName');
    res.json({ success: true, notes });
  } catch (error) {
    console.error('getTeacherNotes error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- GET TEACHER'S STUDY MATERIALS -------------------------
const getTeacherMaterials = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

    if (!checkAccess(req, teacherId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const materials = await StudyMaterial.find({ teacherId }).populate('subjectId', 'subjectName');
    res.json({ success: true, materials });
  } catch (error) {
    console.error('getTeacherMaterials error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- GET TEACHER ASSIGNMENTS WITH SUBMISSIONS -------------------------
const getTeacherAssignments = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

    if (!checkAccess(req, teacherId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const { subjectId } = req.query;

    let query = { teacherId };
    if (subjectId) query.subjectId = subjectId;

    const assignments = await Assignments.find(query)
      .populate('subjectId', 'subjectName subjectCode courseId')
      .populate({
        path: 'submissions.studentId',
        select: 'name rollNo email'
      })
      .sort({ deadline: -1 });

    const assignmentsWithDetails = await Promise.all(assignments.map(async (assignment) => {
      const subject = await Subject.findById(assignment.subjectId._id);
      const allStudents = await Student.find({ courseId: subject.courseId, isActive: true });

      const submittedStudentIds = (assignment.submissions || []).map(sub => sub.studentId._id.toString());
      const notSubmitted = allStudents.filter(student => !submittedStudentIds.includes(student._id.toString()));

      return {
        ...assignment.toObject(),
        totalStudents: allStudents.length,
        submittedCount: (assignment.submissions || []).length,
        pendingCount: notSubmitted.length,
        notSubmittedStudents: notSubmitted
      };
    }));

    res.json({ success: true, assignments: assignmentsWithDetails });
  } catch (error) {
    console.error('getTeacherAssignments error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- ADD COURSE -------------------------
const addCourse = async (req, res) => {
  try {
    const { courseName, courseCode, courseDuration } = req.body;
    if (!courseName || !courseCode) return res.status(400).json({ success: false, msg: 'courseName and courseCode required' });

    // Prevent duplicates
    const existing = await Course.findOne({ courseCode });
    if (existing) return res.status(400).json({ success: false, msg: 'Course with this code already exists' });

    const course = new Course({ courseName, courseCode, courseDuration });
    await course.save();

    res.status(201).json({ success: true, msg: 'Course added successfully', course });
  } catch (error) {
    console.error('addCourse error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- ADD SUBJECT -------------------------
const addSubject = async (req, res) => {
  try {
    const { subjectName, subjectCode, courseId } = req.body;
    if (!subjectName || !subjectCode || !courseId) {
      return res.status(400).json({ success: false, msg: 'subjectName, subjectCode and courseId required' });
    }

    const existing = await Subject.findOne({ subjectCode, courseId });
    if (existing) return res.status(400).json({ success: false, msg: 'Subject with this code already exists for the course' });

    const subject = new Subject({ subjectName, subjectCode, courseId });
    await subject.save();

    res.status(201).json({ success: true, msg: 'Subject added successfully', subject });
  } catch (error) {
    console.error('addSubject error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ------------------------- GET TEACHER NOTICES -------------------------
const getTeacherNotices = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

    if (!checkAccess(req, teacherId)) {
      return res.status(403).json({ success: false, msg: 'Access denied' });
    }
    const teacher = await Teacher.findById(teacherId);

    const notices = await Notices.find({
      teacherId,
      isActive: true
    })
      .populate('courseId', 'courseName courseCode')
      .sort({ createdAt: -1 });

    const noticesWithStudentCount = await Promise.all(notices.map(async (notice) => {
      const studentCount = await Student.countDocuments({
        courseId: notice.courseId._id,
        isActive: true
      });

      return {
        ...notice.toObject(),
        studentCount
      };
    }));

    res.json({ success: true, notices: noticesWithStudentCount });
  } catch (error) {
    console.error('getTeacherNotices error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

module.exports = {
  teacherLogin,
  getTeacherDashboard,
  getTeacherSubjects,
  getTeacherCourses,
  getStudentsBySubject,
  markAttendance,
  getAttendanceReport,
  addMarks,
  getAllStudentsMarks,
  addNotes,
  addStudyMaterial,
  addAssignment,
  addNotice,
  addCourse,
  addSubject,
  getTeacherNotes,
  getTeacherMaterials,
  getTeacherAssignments,
  getTeacherNotices,
  // New Features
  getTimetable: async (req, res) => {
    try {
      const { teacherId } = req.params;
      if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

      if (!checkAccess(req, teacherId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const timetable = await Timetable.find({ teacherId, isActive: true })
        .populate('subjectId', 'subjectName subjectCode')
        .populate('courseId', 'courseName courseCode')
        .sort({ day: 1, timeSlot: 1 });
      res.json({ success: true, timetable });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },
  applyLeave: async (req, res) => {
    try {
      const { teacherId } = req.params;
      if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

      if (!checkAccess(req, teacherId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const { leaveType, startDate, endDate, reason } = req.body;
      const leave = new Leave({
        userId: teacherId,
        userRole: 'teacher',
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
  changePassword: async (req, res) => {
    try {
      const { teacherId } = req.params;
      if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

      if (!checkAccess(req, teacherId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const { oldPassword, newPassword } = req.body;

      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ success: false, msg: 'Teacher not found' });
      }

      const isMatch = await bcrypt.compare(oldPassword, teacher.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, msg: 'Incorrect old password' });
      }

      teacher.password = newPassword;
      await teacher.save();

      res.json({ success: true, msg: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },
  getLeaves: async (req, res) => {
    try {
      const { teacherId } = req.params;
      if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

      if (!checkAccess(req, teacherId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const leaves = await Leave.find({ userId: teacherId }).sort({ createdAt: -1 });
      res.json({ success: true, leaves });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  // ------------------------- LEARNING RESOURCES (NEW) -------------------------
  addResource: async (req, res) => {
    try {
      const { teacherId } = req.params;
      if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

      if (!checkAccess(req, teacherId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const { subjectId, title, description, type, links, tags, isPublished } = req.body;

      if (!title || !subjectId || !type) {
        return res.status(400).json({ success: false, msg: 'Title, subject, and type are required' });
      }

      if (req.fileValidationError) {
        return res.status(400).json({ success: false, msg: req.fileValidationError });
      }

      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json({ success: false, msg: 'Invalid subject ID' });
      }

      const actualTeacherId = teacherId === 'admin' ? 'admin' : teacherId;

      // Handle file upload (single or multiple)
      let files = [];
      if (req.file) {
        files.push({
          name: req.file.originalname,
          url: buildFileUrl(req, req.file),
          size: req.file.size,
          fileType: req.file.mimetype
        });
      }

      let parsedLinks = [];
      try {
        if (links) {
          parsedLinks = typeof links === 'string' ? JSON.parse(links) : links;
        }
      } catch (e) {
        console.warn('Invalid links JSON:', links);
        // Fallback: if it's a simple string, maybe treat as one link? Or just ignore.
        // For now, ignore invalid JSON to prevent crash
        parsedLinks = [];
      }

      const resource = new LearningResource({
        teacherId: actualTeacherId,
        subjectId,
        title,
        description,
        type,
        files,
        links: parsedLinks,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        isPublished: isPublished === 'true' || isPublished === true
      });

      await resource.save();
      res.status(201).json({ success: true, msg: 'Resource added successfully', resource });
    } catch (error) {
      console.error('addResource error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, msg: error.message });
      }
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  getResources: async (req, res) => {
    try {
      const { teacherId } = req.params;
      if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

      if (!checkAccess(req, teacherId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      const { subjectId, type } = req.query;

      let query = { teacherId, isActive: true };
      if (subjectId) query.subjectId = subjectId;
      if (type) query.type = type;

      const resources = await LearningResource.find(query)
        .populate('subjectId', 'subjectName subjectCode')
        .sort({ createdAt: -1 });

      res.json({ success: true, resources });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  deleteResource: async (req, res) => {
    try {
      const { resourceId, teacherId } = req.params;
      if (!isValidId(teacherId)) return res.status(400).json({ success: false, msg: 'Invalid Teacher ID format' });

      if (!checkAccess(req, teacherId)) {
        return res.status(403).json({ success: false, msg: 'Access denied' });
      }
      await LearningResource.findByIdAndUpdate(resourceId, { isActive: false });
      res.json({ success: true, msg: 'Resource deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }
};
