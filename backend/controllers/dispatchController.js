const Dispatch = require('../models/Dispatch');
const inventoryService = require('../services/inventoryService');

const dispatchController = {
  create: async (req, res, next) => {
    try {
      const { product_id, quantity, destination, tracking_number } = req.body;
      const user_id = req.user.id;

      // Adjust inventory and write stock history
      await inventoryService.dispatchStock({
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        user_id,
        notes: `Dispatched to ${destination}. Tracking: ${tracking_number || 'N/A'}`
      });

      // Save dispatch record
      const newDispatch = await Dispatch.create({
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        destination,
        tracking_number,
        status: 'shipped' // starts as shipped
      });

      res.status(201).json(newDispatch);
    } catch (err) {
      // If error is about insufficient stock, return 400
      if (err.message.includes('Insufficient stock')) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  },

  list: async (req, res, next) => {
    try {
      const dispatches = await Dispatch.findAll();
      res.json(dispatches);
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // e.g. shipped -> delivered

      const dispatch = await Dispatch.findById(id);
      if (!dispatch) {
        return res.status(404).json({ message: 'Dispatch record not found.' });
      }

      await Dispatch.updateStatus(id, status);
      res.json({ id, status });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = dispatchController;
