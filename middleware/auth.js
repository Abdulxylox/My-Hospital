// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const isRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Missing user' });
  if (Array.isArray(role) ? role.includes(req.user.role) : req.user.role === role) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: insufficient role' });
};

module.exports = { authMiddleware, isRole };
