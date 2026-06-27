const db = require('../config/db');

const analyticsService = {
  getDashboardSummary: () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const queries = {
          totalProducts: `SELECT COUNT(*) as count FROM products`,
          totalStockValue: `
            SELECT SUM(s.quantity * p.price) as value 
            FROM stock s 
            JOIN products p ON s.product_id = p.id 
            WHERE s.status = 'available'
          `,
          totalStockVolume: `SELECT SUM(quantity) as volume FROM stock WHERE status = 'available'`,
          lowStockCount: `
            SELECT COUNT(DISTINCT s.product_id) as count 
            FROM stock s 
            JOIN products p ON s.product_id = p.id 
            WHERE s.status = 'available' AND s.quantity < p.min_stock_level
          `,
          quarantinedCount: `SELECT SUM(quantity) as volume FROM stock WHERE status = 'quarantined'`,
          totalDispatches: `SELECT SUM(quantity) as count FROM dispatches`,
          totalReturns: `SELECT SUM(quantity) as count FROM returns`,
          totalDamaged: `SELECT SUM(quantity) as count FROM damaged_goods`
        };

        const results = {};
        let completed = 0;
        const keys = Object.keys(queries);

        keys.forEach((key) => {
          db.get(queries[key], [], (err, row) => {
            if (err) {
              return reject(err);
            }
            results[key] = row ? (row.count !== undefined ? row.count : (row.value !== undefined ? row.value : row.volume)) : 0;
            completed++;
            if (completed === keys.length) {
              resolve({
                totalProducts: results.totalProducts || 0,
                totalStockValue: parseFloat((results.totalStockValue || 0).toFixed(2)),
                totalStockVolume: results.totalStockVolume || 0,
                lowStockCount: results.lowStockCount || 0,
                quarantinedCount: results.quarantinedCount || 0,
                totalDispatches: results.totalDispatches || 0,
                totalReturns: results.totalReturns || 0,
                totalDamaged: results.totalDamaged || 0
              });
            }
          });
        });
      });
    });
  },

  getCategoryDistribution: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.category, SUM(s.quantity) as value
        FROM stock s
        JOIN products p ON s.product_id = p.id
        WHERE s.status = 'available'
        GROUP BY p.category
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  getStockMovements: () => {
    return new Promise((resolve, reject) => {
      // Retrieves past 6 months of aggregate logs
      const query = `
        SELECT 
          strftime('%Y-%m', transaction_date) as month, 
          transaction_type, 
          SUM(quantity) as total_qty
        FROM stock_history
        GROUP BY month, transaction_type
        ORDER BY month ASC
        LIMIT 12
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  getTopProducts: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.name, SUM(d.quantity) as value
        FROM dispatches d
        JOIN products p ON d.product_id = p.id
        GROUP BY p.id
        ORDER BY value DESC
        LIMIT 5
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
};

module.exports = analyticsService;
