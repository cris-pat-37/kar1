const Vendor = require('../models/Vendor');

const vendorController = {
  create: async (req, res, next) => {
    try {
      const { name, contact_person, email, phone, address } = req.body;
      const newVendor = await Vendor.create({ name, contact_person, email, phone, address });
      res.status(201).json(newVendor);
    } catch (err) {
      next(err);
    }
  },

  list: async (req, res, next) => {
    try {
      const vendors = await Vendor.findAll();
      res.json(vendors);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found.' });
      }
      res.json(vendor);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { name, contact_person, email, phone, address } = req.body;
      const { id } = req.params;

      const vendor = await Vendor.findById(id);
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found.' });
      }

      await Vendor.update(id, { name, contact_person, email, phone, address });
      res.json({ id, name, contact_person, email, phone, address });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found.' });
      }

      await Vendor.delete(id);
      res.json({ message: 'Vendor successfully deleted.' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = vendorController;
