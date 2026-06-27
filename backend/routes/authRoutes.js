const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.post('/login', validateBody(['username', 'password']), authController.login);

// Only administrators can register new accounts
router.post(
  '/register', 
  authMiddleware, 
  authorize('admin'), 
  validateBody(['username', 'password', 'email', 'role']), 
  authController.register
);

router.get('/profile', authMiddleware, authController.profile);
router.get('/users', authMiddleware, authorize(['admin', 'manager']), authController.listUsers);

router.post(
  '/change-password',
  authMiddleware,
  validateBody(['currentPassword', 'newPassword']),
  authController.changePassword
);

module.exports = router;
