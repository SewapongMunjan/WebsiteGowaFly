// controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, phone FROM users WHERE user_id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    
    await pool.query(
      'UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?',
      [full_name, phone, req.user.id]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    // Get user from database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE user_id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    
    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [password_hash, req.user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};