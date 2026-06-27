const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.get('/', authMiddleware, stockController.list);
router.get('/alerts', authMiddleware, stockController.getAlerts);
router.get('/history', authMiddleware, stockController.getHistory);
router.get('/:productId', authMiddleware, stockController.getByProduct);

router.post(
  '/entry', 
  authMiddleware, 
  authorize(['admin', 'manager', 'operator']), 
  validateBody(['product_id', 'quantity']), 
  stockController.addEntry
);

module.exports = router;
