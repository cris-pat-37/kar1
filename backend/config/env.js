const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_warehouse_key_987654321',
  DB_PATH: process.env.VERCEL ? '/tmp/warehouse.db' : (process.env.DB_PATH || '../database/warehouse.db'),
  NODE_ENV: process.env.NODE_ENV || 'development'
};
