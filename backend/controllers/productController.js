const Product = require('../models/Product');
const Stock = require('../models/Stock');

const productController = {
  create: async (req, res, next) => {
    try {
      const { name, sku, description, category, price, min_stock_level } = req.body;

      const skuRegex = /^sku\d{3}$/i;
      if (!skuRegex.test(sku)) {
        return res.status(400).json({ message: 'SKU must start with "sku" followed by exactly 3 numbers (e.g., sku001).' });
      }

      const existingSku = await Product.findBySku(sku);
      if (existingSku) {
        return res.status(400).json({ message: `A product with SKU "${sku}" already exists.` });
      }

      const newProduct = await Product.create({
        name,
        sku,
        description,
        category,
        price: parseFloat(price) || 0.0,
        min_stock_level: parseInt(min_stock_level) || 10
      });

      // Initialize default stock as 0
      await Stock.create({
        product_id: newProduct.id,
        vendor_id: null,
        quantity: 0,
        location: 'Unassigned',
        unit: 'pcs',
        status: 'available'
      });

      res.status(201).json(newProduct);
    } catch (err) {
      next(err);
    }
  },

  list: async (req, res, next) => {
    try {
      const products = await Product.findAll();
      res.json(products);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { name, sku, description, category, price, min_stock_level } = req.body;
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      // Validate SKU format
      const skuRegex = /^sku\d{3}$/i;
      if (!skuRegex.test(sku)) {
        return res.status(400).json({ message: 'SKU must start with "sku" followed by exactly 3 numbers (e.g., sku001).' });
      }

      // Check sku uniqueness if changing
      if (sku !== product.sku) {
        const existingSku = await Product.findBySku(sku);
        if (existingSku) {
          return res.status(400).json({ message: `A product with SKU "${sku}" already exists.` });
        }
      }

      await Product.update(id, {
        name,
        sku,
        description,
        category,
        price: parseFloat(price) || 0.0,
        min_stock_level: parseInt(min_stock_level) || 10
      });

      res.json({ id, name, sku, description, category, price, min_stock_level });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      await Product.delete(id);
      res.json({ message: 'Product successfully deleted.' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = productController;
