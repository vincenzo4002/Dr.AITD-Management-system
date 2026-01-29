require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Admin, Teacher, Student, Course, Subject } = require('./models');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-erp');
        console.log('MongoDB Connected for seeding');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Clear existing data
        await Admin.deleteMany({});
        await Teacher.deleteMany({});
        await Student.deleteMany({});
        await Course.deleteMany({});
        await Subject.deleteMany({});

        // Create sample course
        const course = new Course({
            courseName: 'Computer Science Engineering',
            courseCode: 'CSE',
            courseDuration: '4 Years',
            isActive: true
        });
        await course.save();

        // Create sample subjects
        const subjects = [
            { subjectName: 'Data Structures', subjectCode: 'CS101', credits: 4, semester: 3, branch: 'CSE', courseId: course._id },
            { subjectName: 'Database Management', subjectCode: 'CS102', credits: 3, semester: 4, branch: 'CSE', courseId: course._id },
            { subjectName: 'Web Development', subjectCode: 'CS103', credits: 4, semester: 5, branch: 'CSE', courseId: course._id }
        ];

        const savedSubjects = await Subject.insertMany(subjects);

        // Create Admin (password will be hashed by pre-save hook)
        const admin = new Admin({
            name: 'System Administrator',
            username: 'admin',
            email: 'admin@draitd.edu',
            password: 'admin123',
            phone: '9506323863',
            isActive: true
        });
        await admin.save();

        // Create Teacher (password will be hashed by pre-save hook)
        const teacher = new Teacher({
            name: 'Dr. John Smith',
            username: 'teacher',
            email: 'teacher@draitd.edu',
            password: 'teacher123',
            phone: '9506323863',
            department: 'Computer Science',
            designation: 'Professor',
            subjects: [savedSubjects[0]._id, savedSubjects[1]._id],
            isActive: true
        });
        await teacher.save();

        // Create Student (password will be hashed by pre-save hook)
        const student = new Student({
            name: 'Alice Johnson',
            rollNo: 'STU2025',
            email: 'student@draitd.edu',
            password: 'student123',
            phone: '9876543212',
            courseId: course._id,
            subjects: savedSubjects.map(s => s._id),
            isActive: true,
            passwordChanged: false
        });
        await student.save();

        console.log('✅ Database seeded successfully!');
        console.log('\n📋 Default Login Credentials:');
        console.log('👤 Admin: admin / admin123');
        console.log('👨‍🏫 Teacher: teacher / teacher123');
        console.log('👨‍🎓 Student: STU2025 / student123');
        console.log('\n🌐 Access the application at: http://localhost:5173');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        mongoose.connection.close();
    }
};

const main = async () => {
    await connectDB();
    await seedData();
};

main();