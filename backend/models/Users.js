const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Teacher Schema
const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    phone: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dob: { type: Date },
    profilePhoto: { type: String },

    // Professional
    employeeId: { type: String, unique: true, sparse: true },
    department: { type: String },
    designation: { type: String },
    qualifications: { type: String },
    specialization: { type: String },
    experience: { type: Number, default: 0 },
    researchInterests: { type: String },
    joinDate: { type: Date },
    cvUrl: { type: String },

    // Responsibilities
    assignedCourse: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],

    otp: { type: String },
    otpExpiry: { type: Date },

    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Student Schema
const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },

    // Academic
    rollNo: { type: String, required: true, unique: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    branch: { type: String },
    semester: { type: Number },
    section: { type: String },

    // Personal
    phone: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dob: { type: Date },
    profilePhoto: { type: String },

    // Additional
    hostelInfo: { type: String },
    transportInfo: { type: String },

    cvUrl: { type: String },
    achievements: [{ type: String }],

    isDemo: { type: Boolean, default: false },
    passwordChanged: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Admin Schema
const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'admin' },
    otp: { type: String },
    otpExpiry: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hooks
StudentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) { next(error); }
});

TeacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) { next(error); }
});

AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) { next(error); }
});

const Teacher = mongoose.model('Teacher', TeacherSchema);
const Student = mongoose.model('Student', StudentSchema);
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = { Teacher, Student, Admin };
