const db = require('../config/db');

const Return = {
  create: ({ product_id, quantity, reason, status }) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO returns (product_id, quantity, reason, status, return_date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      db.run(query, [product_id, quantity, reason, status], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, product_id, quantity, reason, status });
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          r.id, 
          r.product_id, 
          p.name AS product_name, 
          p.sku AS product_sku, 
          r.quantity, 
          r.return_date, 
          r.reason, 
          r.status
        FROM returns r
        JOIN products p ON r.product_id = p.id
        ORDER BY r.return_date DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM returns WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  update: (id, { product_id, quantity, reason, status }) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE returns 
        SET product_id = ?, quantity = ?, reason = ?, status = ?
        WHERE id = ?
      `;
      db.run(query, [product_id, quantity, reason, status, id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  }
};

module.exports = Return;
