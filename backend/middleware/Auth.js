const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Extract token from header OR cookies
const getToken = (req) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return null;
};

// 1. VERIFY TOKEN (single place)
const verifyToken = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      msg: "Authentication token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // decoded = { id, role, iat, exp }
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token",
    });
  }
};

// 2. Admin only
const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      msg: "Access denied — Admins only",
    });
  }
  next();
};

// 3. Teacher or Admin
const isTeacher = (req, res, next) => {
  if (req.user?.role === "teacher" || req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    msg: "Access denied — Only Teachers or Admins are allowed",
  });
};

module.exports = { verifyToken, isAdmin, isTeacher };
