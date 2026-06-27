const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.get('/', authMiddleware, dispatchController.list);

router.post(
  '/', 
  authMiddleware, 
  authorize(['admin', 'manager', 'operator']), 
  validateBody(['product_id', 'quantity', 'destination']), 
  dispatchController.create
);

router.put(
  '/:id/status', 
  authMiddleware, 
  authorize(['admin', 'manager']), 
  validateBody(['status']), 
  dispatchController.updateStatus
);

module.exports = router;
