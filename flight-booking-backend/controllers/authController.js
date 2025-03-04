// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Register a new user
exports.register = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { full_name, email, phone, password } = req.body;
    
    // Check if email already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Insert new user
    const [result] = await connection.query(
      'INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [full_name, email, phone, password_hash]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email, full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        full_name,
        email,
        phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// Login user
exports.login = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, email: user.email, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.query(
      'SELECT user_id, full_name, email, phone FROM users WHERE user_id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};