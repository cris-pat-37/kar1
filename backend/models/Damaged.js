const db = require('../config/db');

const Damaged = {
  create: ({ product_id, quantity, description, action_taken, status }) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO damaged_goods (product_id, quantity, description, action_taken, status, report_date)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      db.run(query, [product_id, quantity, description, action_taken, status], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, product_id, quantity, description, action_taken, status });
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          d.id, 
          d.product_id, 
          p.name AS product_name, 
          p.sku AS product_sku, 
          d.quantity, 
          d.report_date, 
          d.description, 
          d.action_taken, 
          d.status
        FROM damaged_goods d
        JOIN products p ON d.product_id = p.id
        ORDER BY d.report_date DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM damaged_goods WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  updateStatus: (id, { status, action_taken }) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE damaged_goods SET status = ?, action_taken = ? WHERE id = ?`;
      db.run(query, [status, action_taken, id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  },

  update: (id, { product_id, quantity, description, action_taken, status }) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE damaged_goods 
        SET product_id = ?, quantity = ?, description = ?, action_taken = ?, status = ?
        WHERE id = ?
      `;
      db.run(query, [product_id, quantity, description, action_taken, status, id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  }
};

module.exports = Damaged;
