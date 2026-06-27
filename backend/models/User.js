const db = require('../config/db');

const User = {
  create: ({ username, password, email, role }) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`;
      db.run(query, [username, password, email, role], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, username, email, role });
      });
    });
  },

  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users WHERE username = ?`;
      db.get(query, [username], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, username, email, role, created_at FROM users WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, username, email, role, created_at FROM users`;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  updatePassword: (id, hashedPassword) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE users SET password = ? WHERE id = ?`;
      db.run(query, [hashedPassword, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }
};

module.exports = User;
