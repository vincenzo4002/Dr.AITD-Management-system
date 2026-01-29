const mongoose = require('mongoose');

// Course Schema
const CourseSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    courseCode: { type: String, required: true, unique: true },
    courseDuration: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Subject Schema
const SubjectSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    subjectType: {
        type: String,
        enum: ["Theory", "Practical", "Lab"],
        default: "Theory"
    },
    credits: { type: Number, default: 0 },
    semester: { type: Number, required: true },
    branch: { type: String, required: true },
    isElective: { type: Boolean, default: false },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        default: null
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        default: null
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Timetable Schema
const TimetableSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true },
    day: { type: String, required: true }, // Monday, Tuesday...
    timeSlot: { type: String, required: true }, // 9:00-10:00
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    roomNo: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Teacher Subject Assignment Schema
const TeacherSubjectAssignmentSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Course = mongoose.model('Course', CourseSchema);
const Subject = mongoose.model('Subject', SubjectSchema);
const Timetable = mongoose.model('Timetable', TimetableSchema);
const TeacherSubjectAssignment = mongoose.model('TeacherSubjectAssignment', TeacherSubjectAssignmentSchema);

module.exports = { Course, Subject, Timetable, TeacherSubjectAssignment };
