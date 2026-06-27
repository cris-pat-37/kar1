const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.get('/', authMiddleware, productController.list);
router.get('/:id', authMiddleware, productController.getById);

router.post(
  '/', 
  authMiddleware, 
  authorize(['admin', 'manager']), 
  validateBody(['name', 'sku', 'category']), 
  productController.create
);

router.put(
  '/:id', 
  authMiddleware, 
  authorize(['admin', 'manager']), 
  validateBody(['name', 'sku', 'category']), 
  productController.update
);

router.delete('/:id', authMiddleware, authorize('admin'), productController.delete);

module.exports = router;
