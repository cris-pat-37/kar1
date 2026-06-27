const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.get('/', authMiddleware, returnController.list);

router.post(
  '/', 
  authMiddleware, 
  authorize(['admin', 'manager', 'operator']), 
  validateBody(['product_id', 'quantity', 'status']), 
  returnController.create
);

router.put(
  '/:id', 
  authMiddleware, 
  authorize(['admin', 'manager', 'operator']), 
  validateBody(['product_id', 'quantity', 'status']), 
  returnController.update
);

module.exports = router;
