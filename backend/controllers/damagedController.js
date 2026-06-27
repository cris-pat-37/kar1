const Damaged = require('../models/Damaged');
const inventoryService = require('../services/inventoryService');

const damagedController = {
  create: async (req, res, next) => {
    try {
      const { product_id, quantity, description, status } = req.body;
      const user_id = req.user.id;

      // Decrement active available stock, increment quarantined if status is quarantined
      await inventoryService.reportDamage({
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        action: status, // 'quarantined' or 'disposed'
        user_id,
        notes: `Damaged stock reported. Description: ${description || 'N/A'}`
      });

      // Save damaged log
      const newDamageLog = await Damaged.create({
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        description,
        action_taken: status === 'quarantined' ? 'Placed in quarantine bay' : 'Disposed of',
        status // 'quarantined', 'disposed', 'repaired'
      });

      res.status(201).json(newDamageLog);
    } catch (err) {
      if (err.message.includes('Cannot report damage')) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  },

  list: async (req, res, next) => {
    try {
      const logs = await Damaged.findAll();
      res.json(logs);
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, action_taken } = req.body;

      const log = await Damaged.findById(id);
      if (!log) {
        return res.status(404).json({ message: 'Damaged item record not found.' });
      }

      await Damaged.updateStatus(id, { status, action_taken });
      res.json({ id, status, action_taken });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { product_id, quantity, description, status } = req.body;
      const user_id = req.user.id;

      const oldDamage = await Damaged.findById(id);
      if (!oldDamage) {
        return res.status(404).json({ message: 'Damaged item record not found.' });
      }

      const newDamage = {
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        description,
        action_taken: status === 'quarantined' ? 'Placed in quarantine bay' : 'Disposed of',
        status
      };

      // Recalculate inventory
      await inventoryService.editDamageStock({
        oldDamage,
        newDamage,
        user_id
      });

      // Update damaged record
      await Damaged.update(id, newDamage);

      res.json({ id, ...newDamage });
    } catch (err) {
      if (err.message.includes('Insufficient') || err.message.includes('Cannot report')) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  }
};

module.exports = damagedController;
