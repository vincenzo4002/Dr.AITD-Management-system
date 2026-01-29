const mongoose = require('mongoose');

// Learning Resource Schema (Unified)
const LearningResourceSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.Mixed, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        required: true,
        enum: ['lecture_note', 'video', 'syllabus', 'reference_book', 'paper', 'other']
    },
    files: [{
        name: String,
        url: String,
        size: Number,
        fileType: String
    }],
    links: [{
        title: String,
        url: String
    }],
    tags: [String],
    version: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: true },
    releaseDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Study Material Schema
const StudyMaterialSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.Mixed, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Notes Schema
const NotesSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.Mixed, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Library Schema
const LibrarySchema = new mongoose.Schema({
    bookName: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, unique: true, sparse: true },
    category: { type: String },
    quantity: { type: Number, default: 1 },
    remaining: { type: Number, default: 1 },
    issuedTo: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        issueDate: { type: Date, default: Date.now },
        returnDate: { type: Date },
        status: { type: String, enum: ['Issued', 'Returned'], default: 'Issued' }
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const LearningResource = mongoose.model('LearningResource', LearningResourceSchema);
const StudyMaterial = mongoose.model('StudyMaterial', StudyMaterialSchema);
const Notes = mongoose.model('Notes', NotesSchema);
const Library = mongoose.model('Library', LibrarySchema);

module.exports = { LearningResource, StudyMaterial, Notes, Library };
