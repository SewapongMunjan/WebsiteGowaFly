// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!verified) {
      return res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: verified.id },
      select: { id: true, email: true, fullName: true },
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User does not exist, authorization denied' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token, authorization denied' });
  }
};

module.exports = auth;