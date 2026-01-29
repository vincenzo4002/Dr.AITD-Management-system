const mongoose = require('mongoose');

// Notice Schema
const NoticeSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.Mixed, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Leave Schema
const LeaveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userRole: { type: String, enum: ['student', 'teacher'], required: true },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Fee Schema
const FeeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    semester: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue', 'Partial'], default: 'Pending' },
    transactions: [{
        amount: { type: Number },
        date: { type: Date, default: Date.now },
        method: { type: String },
        transactionId: { type: String }
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Manual Report Schema
const ReportSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true }, // Academic, Administrative, Other
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Notification Schema
const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userRole: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityType: { type: String }
}, { timestamps: true });

const Notices = mongoose.model('Notice', NoticeSchema);
const Leave = mongoose.model('Leave', LeaveSchema);
const Fee = mongoose.model('Fee', FeeSchema);
const Report = mongoose.model('Report', ReportSchema);
const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = { Notices, Leave, Fee, Report, Notification };
