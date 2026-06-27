const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/summary', authMiddleware, reportController.getSummary);
router.get('/charts', authMiddleware, reportController.getChartsData);

// Data Exports
router.get('/csv/inventory', authMiddleware, reportController.exportInventoryCSV);
router.get('/csv/history', authMiddleware, reportController.exportHistoryCSV);
router.get('/pdf/inventory', authMiddleware, reportController.exportInventoryPDF);
router.get('/pdf/history', authMiddleware, reportController.exportHistoryPDF);

module.exports = router;
