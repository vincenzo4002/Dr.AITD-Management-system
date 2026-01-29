const mongoose = require('mongoose');

// Attendance Schema
const AttendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.Mixed, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent'], required: true }
}, { timestamps: true });

// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.Mixed, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: { type: String },
    deadline: { type: Date, required: true },
    maxMarks: { type: Number },
    submissionType: { type: String, enum: ['online', 'offline'], default: 'online' },
    files: [{
        name: String,
        url: String,
        type: String
    }],
    fileUrl: { type: String }, // Legacy support
    isActive: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true },
    tags: [String],
    submissions: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        submissionDate: { type: Date, default: Date.now },
        files: [{ name: String, url: String }],
        fileUrl: { type: String }, // Legacy support
        remarks: { type: String },
        marksObtained: { type: Number }
    }]
}, { timestamps: true });

// Marks Schema
const MarksSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.Mixed, required: true },
    marks: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    examType: { type: String, required: true }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', AttendanceSchema);
const Assignments = mongoose.model('Assignment', AssignmentSchema);
const Marks = mongoose.model('Marks', MarksSchema);

module.exports = { Attendance, Assignments, Marks };
