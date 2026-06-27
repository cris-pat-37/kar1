const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const db = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const stockRoutes = require('./routes/stockRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const returnRoutes = require('./routes/returnRoutes');
const damagedRoutes = require('./routes/damagedRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dispatches', dispatchRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/damaged', damagedRoutes);
app.use('/api/reports', reportRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Warehouse Registration API is running successfully.' });
});

// Error handling Middleware
app.use(errorHandler);

// Start Server
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`[SERVER] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
}

module.exports = app;
