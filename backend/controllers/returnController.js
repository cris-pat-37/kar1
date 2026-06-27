const Return = require('../models/Return');
const inventoryService = require('../services/inventoryService');

const returnController = {
  create: async (req, res, next) => {
    try {
      const { product_id, quantity, reason, status } = req.body;
      const user_id = req.user.id;

      const isRestocked = status === 'restocked';

      // Update stock levels
      await inventoryService.returnStock({
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        isRestocked,
        user_id,
        notes: `Returned item log. Reason: ${reason || 'N/A'}`
      });

      // Save return record
      const newReturn = await Return.create({
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        reason,
        status // 'inspected', 'restocked', or 'damaged'
      });

      res.status(201).json(newReturn);
    } catch (err) {
      next(err);
    }
  },

  list: async (req, res, next) => {
    try {
      const returns = await Return.findAll();
      res.json(returns);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { product_id, quantity, reason, status } = req.body;
      const user_id = req.user.id;

      const oldReturn = await Return.findById(id);
      if (!oldReturn) {
        return res.status(404).json({ message: 'Return record not found.' });
      }

      const newReturn = {
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        reason,
        status
      };

      // Recalculate inventory
      await inventoryService.editReturnStock({
        oldReturn,
        newReturn,
        user_id
      });

      // Update return record
      await Return.update(id, newReturn);

      res.json({ id, ...newReturn });
    } catch (err) {
      if (err.message.includes('Insufficient')) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  }
};

module.exports = returnController;
