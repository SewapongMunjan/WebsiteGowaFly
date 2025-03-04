// utils/validation.js

// Validate email format
exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate password strength
  exports.isStrongPassword = (password) => {
    // Password must be at least 8 characters, include numbers and letters
    return password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
  };
  
  // Validate phone number format
  exports.isValidPhone = (phone) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  };
  
  // Validate passport number format
  exports.isValidPassportNumber = (passport) => {
    // Basic validation - adjust as needed
    return /^[A-Z0-9]{6,15}$/.test(passport);
  };
  
  // Validate date format (YYYY-MM-DD)
  exports.isValidDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  };