const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const {
  validateUser,
  validateUserUpdate,
  validateId
} = require('../middleware/validation');

// User routes with validation
router.get('/', getAllUsers);
router.get('/:id', validateId, getUserById);
router.post('/', validateUser, createUser);
router.put('/:id', validateId, validateUserUpdate, updateUser);
router.delete('/:id', validateId, deleteUser);

module.exports = router;
