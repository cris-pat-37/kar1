const Stock = require('../models/Stock');
const StockHistory = require('../models/StockHistory');
const inventoryService = require('../services/inventoryService');
const alertService = require('../services/alertService');

const stockController = {
  list: async (req, res, next) => {
    try {
      const stock = await Stock.findAll();
      res.json(stock);
    } catch (err) {
      next(err);
    }
  },

  getByProduct: async (req, res, next) => {
    try {
      const stock = await Stock.findByProductId(req.params.productId);
      res.json(stock);
    } catch (err) {
      next(err);
    }
  },

  // Stock-in transaction
  addEntry: async (req, res, next) => {
    try {
      const { product_id, vendor_id, quantity, location, unit, notes } = req.body;
      const user_id = req.user.id; // from JWT token middleware

      const result = await inventoryService.addStock({
        product_id: parseInt(product_id),
        vendor_id: vendor_id ? parseInt(vendor_id) : null,
        quantity: parseInt(quantity),
        location,
        unit,
        user_id,
        notes
      });

      res.status(201).json({
        message: 'Stock entry created successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  getAlerts: async (req, res, next) => {
    try {
      const alerts = await alertService.getActiveAlerts();
      res.json(alerts);
    } catch (err) {
      next(err);
    }
  },

  getHistory: async (req, res, next) => {
    try {
      const history = await StockHistory.findAll();
      res.json(history);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = stockController;
