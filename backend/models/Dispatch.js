const db = require('../config/db');

const Dispatch = {
  create: ({ product_id, quantity, destination, tracking_number, status }) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO dispatches (product_id, quantity, destination, tracking_number, status, dispatch_date)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      db.run(query, [product_id, quantity, destination, tracking_number, status], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, product_id, quantity, destination, tracking_number, status });
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
          d.dispatch_date, 
          d.destination, 
          d.tracking_number, 
          d.status
        FROM dispatches d
        JOIN products p ON d.product_id = p.id
        ORDER BY d.dispatch_date DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM dispatches WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  updateStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE dispatches SET status = ? WHERE id = ?`;
      db.run(query, [status, id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  }
};

module.exports = Dispatch;
