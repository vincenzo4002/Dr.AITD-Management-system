const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Student, Teacher, Admin } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set');
    process.exit(1);
}

const login = async (req, res, next) => {
    try {
        console.log('Login attempt:', { username: req.body.username, role: req.body.role });
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            console.log('Missing credentials:', { username: !!username, password: !!password, role: !!role });
            const error = new Error('Username, password, and role are required');
            error.statusCode = 400;
            throw error;
        }

        let user;
        let isMatch = false;

        // 1. Find User based on Role
        if (role === 'student') {
            // Students log in with Roll Number OR Email
            user = await Student.findOne({
                $or: [{ rollNo: username }, { email: username }]
            }).populate('courseId');
        } else if (role === 'teacher') {
            // Teachers log in with Email or Username
            user = await Teacher.findOne({
                $or: [{ email: username }, { username: username }]
            });
        } else if (role === 'admin') {
            // Admins log in with Email or Username
            user = await Admin.findOne({
                $or: [{ email: username }, { username: username }]
            });
        } else {
            const error = new Error('Invalid role specified');
            error.statusCode = 400;
            throw error;
        }

        // 2. Validate User Existence
        if (!user) {
            console.log('User not found for:', { username, role });
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        console.log('User found:', { id: user._id, name: user.name, email: user.email });

        // 3. Verify Password
        isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Password verification failed');
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // 4. Generate Token (10 years expiry - effectively unlimited)
        const token = jwt.sign(
            { id: user._id, user_id: user._id, role: role, name: user.name },
            JWT_SECRET,
            { expiresIn: '3650d' } // 10 years
        );

        // 5. Set Cookie (10 years expiry - effectively unlimited)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3650 * 24 * 60 * 60 * 1000 // 10 years
        });

        // 6. Prepare Response
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: role,
        };

        if (role === 'student') {
            userData.rollNo = user.rollNo;
            userData.course = user.courseId;
            userData.passwordChanged = user.passwordChanged;
        }

        res.status(200).json({
            success: true,
            token,
            user: userData,
            message: `Welcome back, ${user.name || role}!`
        });

    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// Email Transporter
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const forgotPassword = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            const error = new Error('Email and role are required');
            error.statusCode = 400;
            throw error;
        }

        let user;
        if (role === 'student') {
            user = await Student.findOne({ email });
        } else if (role === 'teacher') {
            user = await Teacher.findOne({ email });
        } else if (role === 'admin') {
            user = await Admin.findOne({ email });
        }

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Email send failed:', emailError);
            // For dev/demo, log the OTP
            console.log(`OTP for ${email}: ${otp}`);
        }

        res.status(200).json({ success: true, msg: 'OTP sent to email', userId: user._id });
    } catch (error) {
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { userId, otp, role } = req.body;

        let user;
        if (role === 'student') user = await Student.findById(userId);
        else if (role === 'teacher') user = await Teacher.findById(userId);
        else if (role === 'admin') user = await Admin.findById(userId);

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            const error = new Error('Invalid or expired OTP');
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({ success: true, msg: 'OTP verified' });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { userId, password, otp, role } = req.body;

        let user;
        if (role === 'student') user = await Student.findById(userId);
        else if (role === 'teacher') user = await Teacher.findById(userId);
        else if (role === 'admin') user = await Admin.findById(userId);

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Verify OTP again to be sure
        if (!otp || user.otp !== otp || user.otpExpiry < Date.now()) {
            const error = new Error('Invalid or expired OTP');
            error.statusCode = 400;
            throw error;
        }

        // Password will be hashed by pre-save hook
        user.password = password;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ success: true, msg: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword
};
