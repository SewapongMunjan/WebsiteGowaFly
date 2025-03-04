// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate JWT token
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.user_id, email: user.email, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Verify JWT token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};