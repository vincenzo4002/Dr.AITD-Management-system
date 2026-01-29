const mongoose = require('mongoose');
const { Course } = require('./models');
require('dotenv').config();

const checkCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-erp');
        console.log('MongoDB Connected');

        const courses = await Course.find({});
        console.log('Total Courses:', courses.length);
        console.log('Courses:', JSON.stringify(courses, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkCourses();
