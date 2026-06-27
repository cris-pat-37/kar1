const db = require('../config/db');

const Stock = {
  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          s.id, 
          s.product_id, 
          p.name AS product_name, 
          p.sku AS product_sku, 
          p.category AS product_category,
          p.min_stock_level,
          s.vendor_id, 
          v.name AS vendor_name, 
          s.quantity, 
          s.location, 
          s.unit, 
          s.status, 
          s.last_updated
        FROM stock s
        JOIN products p ON s.product_id = p.id
        LEFT JOIN vendors v ON s.vendor_id = v.id
        ORDER BY p.name ASC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findByProductId: (productId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.*, p.name AS product_name, p.sku AS product_sku 
        FROM stock s
        JOIN products p ON s.product_id = p.id
        WHERE s.product_id = ?
      `;
      db.all(query, [productId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findByProductAndStatus: (productId, status) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM stock WHERE product_id = ? AND status = ?`;
      db.get(query, [productId, status], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  create: ({ product_id, vendor_id, quantity, location, unit, status }) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO stock (product_id, vendor_id, quantity, location, unit, status, last_updated) 
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      db.run(query, [product_id, vendor_id, quantity, location, unit, status], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, product_id, vendor_id, quantity, location, unit, status });
      });
    });
  },

  updateQuantity: (id, quantity) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE stock SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(query, [quantity, id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  },

  updateLocationAndVendor: (id, location, vendorId) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE stock SET location = ?, vendor_id = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(query, [location, vendorId, id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  },

  getLowStock: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          s.id, 
          s.product_id, 
          p.name AS product_name, 
          p.sku AS product_sku, 
          s.quantity, 
          p.min_stock_level, 
          s.location, 
          s.status
        FROM stock s
        JOIN products p ON s.product_id = p.id
        WHERE s.status = 'available' AND s.quantity < p.min_stock_level
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
};

module.exports = Stock;
