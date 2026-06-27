const db = require('../config/db');

const Product = {
  create: ({ name, sku, description, category, price, min_stock_level }) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO products (name, sku, description, category, price, min_stock_level) VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(query, [name, sku, description, category, price, min_stock_level], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, name, sku, description, category, price, min_stock_level });
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM products ORDER BY name ASC`;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM products WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  findBySku: (sku) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM products WHERE sku = ?`;
      db.get(query, [sku], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  update: (id, { name, sku, description, category, price, min_stock_level }) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE products SET name = ?, sku = ?, description = ?, category = ?, price = ?, min_stock_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(query, [name, sku, description, category, price, min_stock_level, id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM products WHERE id = ?`;
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  }
};

module.exports = Product;
