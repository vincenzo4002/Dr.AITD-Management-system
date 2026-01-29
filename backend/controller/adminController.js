const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  Course,
  Subject,
  Teacher,
  Student,
  TeacherSubjectAssignment,
  Attendance,
  Marks,
  Admin,
  Assignments,
  Notices,
  StudyMaterial,
  Fee,
  Report,
  Library,
  Timetable
} = require('../models');
const { sendNotification } = require('./notificationController');

// Admin Login
// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, msg: 'Username and password are required' });
    }

    // Check if admin exists in DB
    const admin = await Admin.findOne({
      $or: [{ email: username }, { username: username }]
    });

    if (!admin) {
      return res.status(404).json({ success: false, msg: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true });

    return res.json({ success: true, token, admin: { id: admin._id, name: admin.name, role: 'admin' } });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Add Course
const addCourse = async (req, res) => {
  try {
    const { courseName, courseCode, courseDuration, courseDescription } = req.body;

    const course = new Course({ courseName, courseCode, courseDuration, courseDescription });
    await course.save();

    res.status(201).json({ success: true, msg: 'Course added successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Update Course
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseName, courseCode, courseDuration, courseDescription } = req.body;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { courseName, courseCode, courseDuration, courseDescription },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, msg: 'Course not found' });
    }

    res.json({ success: true, msg: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Add Subject
const addSubject = async (req, res) => {
  try {
    const { subjectName, subjectCode, courseId, subjectType, credits, semester, branch, isElective, teacherId } = req.body;

    if (!subjectName || !subjectCode || !semester || !branch) {
      return res.status(400).json({ success: false, msg: 'Subject name, code, semester, and branch are required' });
    }

    const subject = new Subject({
      subjectName,
      subjectCode,
      courseId: courseId || null,
      subjectType: subjectType || 'Theory',
      credits: credits || 0,
      semester,
      branch,
      isElective: isElective || false,
      teacherId: teacherId || null
    });
    await subject.save();

    res.status(201).json({ success: true, msg: 'Subject added successfully', subject });
  } catch (error) {
    console.error('Add subject error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Add Teacher
const addTeacher = async (req, res) => {
  try {
    const { name, email, phone, password, assignedCourse, assignedSubjects } = req.body;

    const teacher = new Teacher({
      name, email, phone, password, assignedCourse, assignedSubjects
    });
    await teacher.save();

    res.status(201).json({ success: true, msg: 'Teacher added successfully', teacher });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Add Student
const addStudent = async (req, res) => {
  try {
    const { name, email, phone, rollNo, password, courseId, semester } = req.body;

    const student = new Student({
      name, email, phone, rollNo, password, courseId, semester
    });
    await student.save();

    res.status(201).json({ success: true, msg: 'Student added successfully', student });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Assign Teacher to Subject
const assignTeacherToSubject = async (req, res) => {
  try {
    const { teacherId, subjectId, courseId } = req.body;

    const assignment = new TeacherSubjectAssignment({ teacherId, subjectId, courseId });
    await assignment.save();

    // Update teacher's assigned subjects
    await Teacher.findByIdAndUpdate(teacherId, {
      $addToSet: { assignedSubjects: subjectId, assignedCourse: courseId }
    });

    res.status(201).json({ success: true, msg: 'Teacher assigned successfully', assignment });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Remove Teacher from Subject
const removeTeacherFromSubject = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.body;

    await TeacherSubjectAssignment.findOneAndUpdate(
      { teacherId, subjectId },
      { isActive: false }
    );

    await Teacher.findByIdAndUpdate(teacherId, {
      $pull: { assignedSubjects: subjectId }
    });

    res.json({ success: true, msg: 'Teacher removed from subject successfully' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Data for Dashboard
const getDashboardData = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true });
    const subjects = await Subject.find({ isActive: true }).populate('courseId');
    const teachers = await Teacher.find({ isActive: true });
    const students = await Student.find({ isActive: true }).populate('courseId');

    const totalAttendance = await Attendance.countDocuments();
    const totalMarks = await Marks.countDocuments();

    res.json({
      success: true,
      data: {
        courses,
        subjects,
        teachers,
        students,
        stats: {
          totalCourses: courses.length,
          totalSubjects: subjects.length,
          totalTeachers: teachers.length,
          totalStudents: students.length,
          totalAttendance,
          totalMarks
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Course - Admin Only
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, msg: 'Access denied. Admin only.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, msg: 'Course not found' });
    }

    await Course.findByIdAndUpdate(courseId, { isActive: false });

    // Send notification to all teachers
    await sendNotification('general', {
      sender: { id: req.user.id, role: 'admin', name: 'Administrator' },
      title: 'Course Deleted',
      message: `Course ${course.courseName} has been deleted by administrator`,
      recipients: { type: 'teachers' }
    });

    res.json({ success: true, msg: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Subject - Admin Only
const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, msg: 'Access denied. Admin only.' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, msg: 'Subject not found' });
    }

    await Subject.findByIdAndUpdate(subjectId, { isActive: false });

    // Send notification to teachers
    await sendNotification('general', {
      sender: { id: req.user.id, role: 'admin', name: 'Administrator' },
      title: 'Subject Deleted',
      message: `Subject ${subject.subjectName} has been deleted by administrator`,
      recipients: { type: 'teachers' }
    });

    res.json({ success: true, msg: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Teacher - Admin Only
const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, msg: 'Access denied. Admin only.' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, msg: 'Teacher not found' });
    }

    await Teacher.findByIdAndUpdate(teacherId, { isActive: false });

    res.json({ success: true, msg: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Student - Admin Only
const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, msg: 'Access denied. Admin only.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, msg: 'Student not found' });
    }

    await Student.findByIdAndUpdate(studentId, { isActive: false });

    res.json({ success: true, msg: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Assignment - Admin Only
const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    console.log('Attempting to delete assignment:', assignmentId);

    const assignment = await Assignments.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, msg: 'Assignment not found' });
    }

    await Assignments.findByIdAndUpdate(assignmentId, { isActive: false });
    res.json({ success: true, msg: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Notice - Admin Only
const deleteNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    console.log('Attempting to delete notice:', noticeId);

    const notice = await Notices.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ success: false, msg: 'Notice not found' });
    }

    await Notices.findByIdAndUpdate(noticeId, { isActive: false });
    res.json({ success: true, msg: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Material - Admin Only
const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    console.log('Attempting to delete material:', materialId);

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, msg: 'Material not found' });
    }

    await StudyMaterial.findByIdAndUpdate(materialId, { isActive: false });
    res.json({ success: true, msg: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Update Teacher - Admin Only
const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, email, phone, department, designation } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { name, email, phone, department, designation },
      { new: true }
    );

    res.json({ success: true, msg: 'Teacher updated successfully', teacher });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Update Student - Admin/Teacher Only
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email, phone, courseId } = req.body;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { name, email, phone, courseId },
      { new: true }
    ).populate('courseId', 'courseName courseCode');

    res.json({ success: true, msg: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Student Details - Admin/Teacher Only
const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate('courseId', 'courseName courseCode courseDuration');

    if (!student) {
      return res.status(404).json({ success: false, msg: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Teacher Details - Admin Only
const getTeacherDetails = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId)
      .populate('assignedCourse', 'courseName courseCode')
      .populate('assignedSubjects', 'subjectName subjectCode');

    if (!teacher) {
      return res.status(404).json({ success: false, msg: 'Teacher not found' });
    }

    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Comprehensive Attendance Report
const getComprehensiveAttendanceReport = async (req, res) => {
  try {
    const { courseId, subjectId, startDate, endDate, studentId } = req.query;

    // Build query
    let query = {};
    if (courseId) query.course = courseId;
    if (subjectId) query.subject = subjectId;
    if (studentId) query.student = studentId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Get attendance records
    const attendance = await Attendance.find(query)
      .populate('student', 'name rollNo email')
      .populate('subject', 'subject_name subject_code')
      .populate('course', 'courseName courseCode')
      .populate('teacher', 'name')
      .sort({ date: -1, 'student.name': 1 });

    // Get all courses and subjects for filters
    const allCourses = await Course.find({ isActive: true }, 'courseName courseCode');
    const allSubjects = await Subject.find({}, 'subject_name subject_code');

    // Calculate statistics
    const studentStats = {};
    const subjectStats = {};
    const courseStats = {};

    attendance.forEach(record => {
      if (!record.student || !record.subject || !record.course) return;

      const studentId = record.student._id.toString();
      const subjectId = record.subject._id.toString();
      const courseId = record.course._id.toString();

      // Student statistics
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          student: record.student,
          course: record.course,
          totalClasses: 0,
          presentClasses: 0,
          absentClasses: 0,
          subjects: {}
        };
      }

      studentStats[studentId].totalClasses++;
      if (record.isPresent) {
        studentStats[studentId].presentClasses++;
      } else {
        studentStats[studentId].absentClasses++;
      }

      // Subject-wise student stats
      if (!studentStats[studentId].subjects[subjectId]) {
        studentStats[studentId].subjects[subjectId] = {
          subject: record.subject,
          total: 0,
          present: 0,
          absent: 0
        };
      }

      studentStats[studentId].subjects[subjectId].total++;
      if (record.isPresent) {
        studentStats[studentId].subjects[subjectId].present++;
      } else {
        studentStats[studentId].subjects[subjectId].absent++;
      }

      // Subject statistics
      if (!subjectStats[subjectId]) {
        subjectStats[subjectId] = {
          subject: record.subject,
          totalClasses: 0,
          totalStudents: new Set(),
          presentCount: 0,
          absentCount: 0
        };
      }

      subjectStats[subjectId].totalClasses++;
      subjectStats[subjectId].totalStudents.add(studentId);
      if (record.isPresent) {
        subjectStats[subjectId].presentCount++;
      } else {
        subjectStats[subjectId].absentCount++;
      }

      // Course statistics
      if (!courseStats[courseId]) {
        courseStats[courseId] = {
          course: record.course,
          totalClasses: 0,
          totalStudents: new Set(),
          presentCount: 0,
          absentCount: 0
        };
      }

      courseStats[courseId].totalClasses++;
      courseStats[courseId].totalStudents.add(studentId);
      if (record.isPresent) {
        courseStats[courseId].presentCount++;
      } else {
        courseStats[courseId].absentCount++;
      }
    });

    // Calculate percentages
    Object.keys(studentStats).forEach(studentId => {
      const stats = studentStats[studentId];
      stats.attendancePercentage = stats.totalClasses > 0 ?
        ((stats.presentClasses / stats.totalClasses) * 100).toFixed(2) : 0;

      Object.keys(stats.subjects).forEach(subjectId => {
        const subjectStats = stats.subjects[subjectId];
        subjectStats.percentage = subjectStats.total > 0 ?
          ((subjectStats.present / subjectStats.total) * 100).toFixed(2) : 0;
      });
    });

    // Convert sets to counts and calculate percentages for subject and course stats
    Object.keys(subjectStats).forEach(subjectId => {
      const stats = subjectStats[subjectId];
      stats.totalStudents = stats.totalStudents.size;
      stats.attendancePercentage = stats.totalClasses > 0 ?
        ((stats.presentCount / (stats.presentCount + stats.absentCount)) * 100).toFixed(2) : 0;
    });

    Object.keys(courseStats).forEach(courseId => {
      const stats = courseStats[courseId];
      stats.totalStudents = stats.totalStudents.size;
      stats.attendancePercentage = stats.totalClasses > 0 ?
        ((stats.presentCount / (stats.presentCount + stats.absentCount)) * 100).toFixed(2) : 0;
    });

    res.json({
      success: true,
      data: {
        attendance,
        studentStats: Object.values(studentStats),
        subjectStats: Object.values(subjectStats),
        courseStats: Object.values(courseStats),
        filters: {
          courses: allCourses,
          subjects: allSubjects
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .populate('courseId', 'courseName courseCode')
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }) // Ensure we only get active subjects if that flag exists, or just all
      .populate('courseId', 'courseName courseCode')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Fee Report
const getFeeReport = async (req, res) => {
  try {
    const fees = await Fee.find({ isActive: true }).populate('studentId', 'name rollNo courseId');

    let totalExpected = 0;
    let totalCollected = 0;
    let totalDue = 0;
    const courseWiseStats = {};

    fees.forEach(fee => {
      totalExpected += fee.totalAmount;
      totalCollected += fee.paidAmount;
      totalDue += fee.dueAmount;

      // Course-wise breakdown (if student exists)
      if (fee.studentId && fee.studentId.courseId) {
        const courseId = fee.studentId.courseId.toString();
        if (!courseWiseStats[courseId]) {
          courseWiseStats[courseId] = { total: 0, collected: 0, due: 0 };
        }
        courseWiseStats[courseId].total += fee.totalAmount;
        courseWiseStats[courseId].collected += fee.paidAmount;
        courseWiseStats[courseId].due += fee.dueAmount;
      }
    });

    res.json({
      success: true,
      data: {
        summary: { totalExpected, totalCollected, totalDue },
        courseWiseStats,
        details: fees
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Academic Report
const getAcademicReport = async (req, res) => {
  try {
    const marks = await Marks.find({}).populate('studentId', 'name rollNo').populate('subjectId', 'subjectName');

    const subjectStats = {};
    const studentPerformance = {};

    marks.forEach(mark => {
      // Subject Stats
      if (mark.subjectId) {
        const subName = mark.subjectId.subjectName;
        if (!subjectStats[subName]) {
          subjectStats[subName] = { totalMarks: 0, count: 0, average: 0, highest: 0 };
        }
        subjectStats[subName].totalMarks += mark.marksObtained;
        subjectStats[subName].count++;
        if (mark.marksObtained > subjectStats[subName].highest) {
          subjectStats[subName].highest = mark.marksObtained;
        }
      }

      // Student Performance
      if (mark.studentId) {
        const studName = mark.studentId.name;
        if (!studentPerformance[studName]) {
          studentPerformance[studName] = { totalMarks: 0, subjects: 0 };
        }
        studentPerformance[studName].totalMarks += mark.marksObtained;
        studentPerformance[studName].subjects++;
      }
    });

    // Calculate averages
    Object.keys(subjectStats).forEach(sub => {
      subjectStats[sub].average = (subjectStats[sub].totalMarks / subjectStats[sub].count).toFixed(2);
    });

    res.json({
      success: true,
      data: {
        subjectStats,
        studentPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Enrollment Report
const getEnrollmentReport = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true }).populate('courseId', 'courseName');

    const courseDistribution = {};
    const yearDistribution = {};

    students.forEach(student => {
      // Course Distribution
      if (student.courseId) {
        const courseName = student.courseId.courseName;
        courseDistribution[courseName] = (courseDistribution[courseName] || 0) + 1;
      }

      // Year/Semester Distribution (assuming semester indicates year roughly)
      if (student.semester) {
        yearDistribution[`Semester ${student.semester}`] = (yearDistribution[`Semester ${student.semester}`] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        courseDistribution,
        yearDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Create Manual Report
const createManualReport = async (req, res) => {
  try {
    const { title, type, content } = req.body;
    const report = new Report({
      title,
      type,
      content,
      generatedBy: req.user.id
    });
    await report.save();
    res.status(201).json({ success: true, msg: 'Report created successfully', report });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Manual Reports
const getAllManualReports = async (req, res) => {
  try {
    const reports = await Report.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Update Manual Report
const updateManualReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { title, type, content } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { title, type, content },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, msg: 'Report not found' });
    }

    res.json({ success: true, msg: 'Report updated successfully', report });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Manual Report
const deleteManualReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findByIdAndUpdate(reportId, { isActive: false });

    if (!report) {
      return res.status(404).json({ success: false, msg: 'Report not found' });
    }

    res.json({ success: true, msg: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= TIMETABLE MANAGEMENT =================

// Add Timetable Entry
const addTimetable = async (req, res) => {
  try {
    const { courseId, semester, day, timeSlot, subjectId, teacherId, roomNo } = req.body;

    const timetable = new Timetable({
      courseId, semester, day, timeSlot, subjectId, teacherId, roomNo
    });
    await timetable.save();

    res.status(201).json({ success: true, msg: 'Timetable entry added', timetable });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get Timetable
const getTimetable = async (req, res) => {
  try {
    const { courseId, semester } = req.query;
    let query = { isActive: true };
    if (courseId) query.courseId = courseId;
    if (semester) query.semester = semester;

    const timetable = await Timetable.find(query)
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'name')
      .populate('courseId', 'courseName')
      .sort({ day: 1, timeSlot: 1 });

    res.json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Timetable Entry
const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    await Timetable.findByIdAndUpdate(id, { isActive: false });
    res.json({ success: true, msg: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= FEE MANAGEMENT =================

// Add Fee Record
const addFee = async (req, res) => {
  try {
    const { studentId, semester, totalAmount, dueAmount, dueDate } = req.body;

    const fee = new Fee({
      studentId, semester, totalAmount, dueAmount, dueDate
    });
    await fee.save();

    res.status(201).json({ success: true, msg: 'Fee record added', fee });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Update Fee Record
const updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paidAmount, transaction } = req.body;

    const fee = await Fee.findById(id);
    if (!fee) return res.status(404).json({ success: false, msg: 'Fee record not found' });

    if (paidAmount) {
      fee.paidAmount += Number(paidAmount);
      fee.dueAmount -= Number(paidAmount);
    }

    if (status) fee.status = status;

    if (transaction) {
      fee.transactions.push(transaction);
    }

    await fee.save();
    res.json({ success: true, msg: 'Fee updated', fee });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Fees
const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find({ isActive: true })
      .populate('studentId', 'name rollNo email courseId')
      .populate({
        path: 'studentId',
        populate: {
          path: 'courseId',
          select: 'courseName courseCode'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= SETTINGS MANAGEMENT =================

// Get Settings
const getSettings = async (req, res) => {
  try {
    // For now, return default settings
    // You can create a Settings model later if needed
    const settings = {
      institutionName: 'Dr. Ambedkar Institute of Technology for Handicapped',
      academicYear: '2024-2025',
      semester: 'Odd',
      address: 'Kanpur, Uttar Pradesh',
      phone: '+91-XXXXXXXXXX',
      email: 'info@draitd.edu.in',
      website: 'www.draitd.edu.in'
    };

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Update Settings
const updateSettings = async (req, res) => {
  try {
    const settings = req.body;

    // For now, just return success
    // You can implement actual database storage later
    res.json({ success: true, msg: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= LIBRARY MANAGEMENT =================

// Add Book
const addBook = async (req, res) => {
  try {
    const { bookName, author, isbn, category, quantity } = req.body;

    const book = new Library({
      bookName, author, isbn, category, quantity, remaining: quantity
    });
    await book.save();

    res.status(201).json({ success: true, msg: 'Book added', book });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Books
const getAllBooks = async (req, res) => {
  try {
    const books = await Library.find({ isActive: true });
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Issue Book
const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, returnDate } = req.body;

    const book = await Library.findById(bookId);
    if (!book || book.remaining <= 0) {
      return res.status(400).json({ success: false, msg: 'Book not available' });
    }

    book.issuedTo.push({ studentId, returnDate });
    book.remaining -= 1;
    await book.save();

    res.json({ success: true, msg: 'Book issued', book });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Return Book
const returnBook = async (req, res) => {
  try {
    const { bookId, studentId } = req.body;

    const book = await Library.findById(bookId);
    if (!book) return res.status(404).json({ success: false, msg: 'Book not found' });

    const issueRecord = book.issuedTo.find(
      i => i.studentId.toString() === studentId && i.status === 'Issued'
    );

    if (!issueRecord) {
      return res.status(400).json({ success: false, msg: 'No active issue record found for this student' });
    }

    issueRecord.status = 'Returned';
    issueRecord.returnDate = new Date();
    book.remaining += 1;
    await book.save();

    res.json({ success: true, msg: 'Book returned', book });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Delete Book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    await Library.findByIdAndUpdate(id, { isActive: false });
    res.json({ success: true, msg: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};


// Get All Notices - Admin Only
const getAllNotices = async (req, res) => {
  try {
    const notices = await Notices.find({ isActive: true })
      .populate('courseId', 'courseName courseCode')
      .sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Assignments - Admin Only
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignments.find({ isActive: true })
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Materials - Admin Only
const getAllMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ isActive: true })
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get All Attendance - Admin Only
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({})
      .populate('studentId', 'name rollNo')
      .populate('subjectId', 'subjectName subjectCode')
      .populate('teacherId', 'name')
      .sort({ date: -1 })
      .limit(1000); // Limit to recent 1000 records for performance
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

module.exports = {
  adminLogin,
  addCourse,
  addSubject,
  addTeacher,
  addStudent,
  assignTeacherToSubject,
  removeTeacherFromSubject,
  getDashboardData,
  deleteCourse,
  deleteSubject,
  deleteTeacher,
  deleteStudent,
  deleteAssignment,
  deleteNotice,
  deleteMaterial,
  updateTeacher,
  updateStudent,
  getStudentDetails,
  getTeacherDetails,
  getComprehensiveAttendanceReport,
  getFeeReport,
  getAcademicReport,
  getEnrollmentReport,
  createManualReport,
  getAllManualReports,
  updateManualReport,
  deleteManualReport,
  getAllStudents,
  getAllTeachers,
  // New Exports
  addTimetable,
  getTimetable,
  deleteTimetable,
  addFee,
  updateFee,
  getAllFees,
  getSettings,
  updateSettings,
  addBook,
  getAllBooks,
  issueBook,
  returnBook,
  deleteBook,
  getAllNotices,
  getAllAssignments,
  getAllMaterials,
  getAllAttendance,
  updateCourse,
  getAllCourses,
  getAllSubjects
};