const { Teacher, Student, Admin } = require('./Users');
const { Course, Subject, Timetable, TeacherSubjectAssignment } = require('./Academics');
const { Attendance, Assignments, Marks } = require('./Activities');
const { LearningResource, StudyMaterial, Notes, Library } = require('./Resources');
const { Notices, Leave, Fee, Report, Notification } = require('./Operations');

module.exports = {
    // Users
    Teacher, Student, Admin,
    // Academics
    Course, Subject, Timetable, TeacherSubjectAssignment,
    // Activities
    Attendance, Assignments, Marks,
    // Resources
    LearningResource, StudyMaterial, Notes, Library,
    // Operations
    Notices, Leave, Fee, Report, Notification
};
