const express = require('express');
const router = express.Router();
const damagedController = require('../controllers/damagedController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.get('/', authMiddleware, damagedController.list);

router.post(
  '/', 
  authMiddleware, 
  authorize(['admin', 'manager', 'operator']), 
  validateBody(['product_id', 'quantity', 'status']), 
  damagedController.create
);

router.put(
  '/:id/status', 
  authMiddleware, 
  authorize(['admin', 'manager']), 
  validateBody(['status', 'action_taken']), 
  damagedController.updateStatus
);

router.put(
  '/:id', 
  authMiddleware, 
  authorize(['admin', 'manager', 'operator']), 
  validateBody(['product_id', 'quantity', 'status']), 
  damagedController.update
);

module.exports = router;
