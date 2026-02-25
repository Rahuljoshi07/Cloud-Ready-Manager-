const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['admin', 'user', 'viewer']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());

  const { email, password, name, role, subscriptions } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return errorResponse(res, 'Email already registered', 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'user',
      subscriptions: subscriptions || ['sub-001-prod'],
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const { password: _, ...userData } = user.toJSON();

    return successResponse(res, { user: userData, token }, 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) return errorResponse(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return errorResponse(res, 'Invalid credentials', 401);

    await user.update({ lastLogin: new Date() });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const { password: _, ...userData } = user.toJSON();

    return successResponse(res, { user: userData, token });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, { user });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function updateProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    const { name, subscriptions, notificationPreferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (subscriptions) updates.subscriptions = subscriptions;
    if (notificationPreferences) updates.notificationPreferences = notificationPreferences;

    await user.update(updates);
    const { password: _, ...userData } = user.toJSON();
    return successResponse(res, { user: userData });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return errorResponse(res, 'Valid current and new password (min 6 chars) required', 400);
  }
  try {
    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return errorResponse(res, 'Current password incorrect', 401);
    const hashed = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashed });
    return successResponse(res, { message: 'Password updated successfully' });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function listUsers(req, res) {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    return successResponse(res, { users });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

module.exports = { register, login, getProfile, updateProfile, changePassword, listUsers, registerValidation, loginValidation };
