const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { errorResponse } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';

/**
 * Verifies JWT and attaches user data to req.user.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization token required', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user || !user.isActive) return errorResponse(res, 'User not found or inactive', 401);
    req.user = user.toJSON();
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return errorResponse(res, 'Token expired', 401);
    return errorResponse(res, 'Invalid token', 401);
  }
}

/**
 * Role-based access control factory.
 * @param {...string} roles - Allowed roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return errorResponse(res, 'Not authenticated', 401);
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `Access restricted to: ${roles.join(', ')}`, 403);
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
