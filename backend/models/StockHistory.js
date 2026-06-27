const db = require('../config/db');

const StockHistory = {
  create: ({ product_id, transaction_type, quantity, previous_quantity, new_quantity, user_id, notes }) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO stock_history (product_id, transaction_type, quantity, previous_quantity, new_quantity, user_id, notes, transaction_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      db.run(query, [product_id, transaction_type, quantity, previous_quantity, new_quantity, user_id, notes], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, product_id, transaction_type, quantity, previous_quantity, new_quantity, user_id, notes });
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          h.id, 
          h.product_id, 
          p.name AS product_name, 
          p.sku AS product_sku, 
          h.transaction_type, 
          h.quantity, 
          h.previous_quantity, 
          h.new_quantity, 
          h.user_id, 
          u.username,
          h.transaction_date, 
          h.notes
        FROM stock_history h
        JOIN products p ON h.product_id = p.id
        LEFT JOIN users u ON h.user_id = u.id
        ORDER BY h.transaction_date DESC
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
        SELECT 
          h.id, 
          h.product_id, 
          p.name AS product_name, 
          p.sku AS product_sku, 
          h.transaction_type, 
          h.quantity, 
          h.previous_quantity, 
          h.new_quantity, 
          h.user_id, 
          u.username,
          h.transaction_date, 
          h.notes
        FROM stock_history h
        JOIN products p ON h.product_id = p.id
        LEFT JOIN users u ON h.user_id = u.id
        WHERE h.product_id = ?
        ORDER BY h.transaction_date DESC
      `;
      db.all(query, [productId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
};

module.exports = StockHistory;
