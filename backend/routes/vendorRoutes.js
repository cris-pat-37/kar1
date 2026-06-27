const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.get('/', authMiddleware, vendorController.list);
router.get('/:id', authMiddleware, vendorController.getById);

router.post(
  '/', 
  authMiddleware, 
  authorize(['admin', 'manager']), 
  validateBody(['name']), 
  vendorController.create
);

router.put(
  '/:id', 
  authMiddleware, 
  authorize(['admin', 'manager']), 
  validateBody(['name']), 
  vendorController.update
);

router.delete('/:id', authMiddleware, authorize('admin'), vendorController.delete);

module.exports = router;
