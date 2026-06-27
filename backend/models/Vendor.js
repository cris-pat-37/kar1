const db = require('../config/db');

const Vendor = {
  create: ({ name, contact_person, email, phone, address }) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO vendors (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)`;
      db.run(query, [name, contact_person, email, phone, address], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, name, contact_person, email, phone, address });
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM vendors ORDER BY name ASC`;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM vendors WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  update: (id, { name, contact_person, email, phone, address }) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE vendors SET name = ?, contact_person = ?, email = ?, phone = ?, address = ? WHERE id = ?`;
      db.run(query, [name, contact_person, email, phone, address, id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM vendors WHERE id = ?`;
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve({ affected: this.changes });
      });
    });
  }
};

module.exports = Vendor;
