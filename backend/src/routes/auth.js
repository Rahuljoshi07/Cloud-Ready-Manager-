const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  register, login, getProfile, updateProfile, changePassword, listUsers,
  registerValidation, loginValidation,
} = require('../controllers/authController');

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.get('/users', authenticate, requireRole('admin'), listUsers);

module.exports = router;
