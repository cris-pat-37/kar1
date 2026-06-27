const analyticsService = require('../services/analyticsService');
const Stock = require('../models/Stock');
const StockHistory = require('../models/StockHistory');
const exportCSV = require('../utils/exportCSV');
const generatePDF = require('../utils/generatePDF');

const reportController = {
  getSummary: async (req, res, next) => {
    try {
      const summary = await analyticsService.getDashboardSummary();
      res.json(summary);
    } catch (err) {
      next(err);
    }
  },

  getChartsData: async (req, res, next) => {
    try {
      const categoryDistribution = await analyticsService.getCategoryDistribution();
      const movements = await analyticsService.getStockMovements();
      const topProducts = await analyticsService.getTopProducts();

      res.json({
        categoryDistribution,
        movements,
        topProducts
      });
    } catch (err) {
      next(err);
    }
  },

  exportInventoryCSV: async (req, res, next) => {
    try {
      const stock = await Stock.findAll();
      const headers = ['Product ID', 'Product Name', 'SKU', 'Category', 'Quantity', 'Unit', 'Location', 'Status', 'Vendor', 'Last Updated'];
      const keyMap = ['product_id', 'product_name', 'product_sku', 'product_category', 'quantity', 'unit', 'location', 'status', 'vendor_name', 'last_updated'];
      
      const csvContent = exportCSV(headers, stock, keyMap);
      
      res.header('Content-Type', 'text/csv');
      res.attachment('warehouse_inventory_report.csv');
      return res.send(csvContent);
    } catch (err) {
      next(err);
    }
  },

  exportHistoryCSV: async (req, res, next) => {
    try {
      const history = await StockHistory.findAll();
      const headers = ['Log ID', 'Product SKU', 'Product Name', 'Transaction', 'Qty Chg', 'Prev Qty', 'New Qty', 'Operator', 'Date', 'Notes'];
      const keyMap = ['id', 'product_sku', 'product_name', 'transaction_type', 'quantity', 'previous_quantity', 'new_quantity', 'username', 'transaction_date', 'notes'];
      
      const csvContent = exportCSV(headers, history, keyMap);
      
      res.header('Content-Type', 'text/csv');
      res.attachment('warehouse_transaction_history.csv');
      return res.send(csvContent);
    } catch (err) {
      next(err);
    }
  },

  exportInventoryPDF: async (req, res, next) => {
    try {
      const stock = await Stock.findAll();
      const headers = ['Product SKU', 'Product Name', 'Category', 'Quantity', 'Location', 'Status', 'Supplier'];
      const keyMap = ['product_sku', 'product_name', 'product_category', 'quantity', 'location', 'status', 'vendor_name'];
      
      const pdfHtml = generatePDF('Warehouse Stock Level Status Inventory Report', headers, stock, keyMap);
      
      res.header('Content-Type', 'text/html');
      return res.send(pdfHtml);
    } catch (err) {
      next(err);
    }
  },

  exportHistoryPDF: async (req, res, next) => {
    try {
      const history = await StockHistory.findAll();
      const headers = ['SKU', 'Product', 'Transaction', 'Qty', 'Prev', 'New', 'Operator', 'Timestamp', 'Notes'];
      const keyMap = ['product_sku', 'product_name', 'transaction_type', 'quantity', 'previous_quantity', 'new_quantity', 'username', 'transaction_date', 'notes'];
      
      const pdfHtml = generatePDF('Warehouse Stock Transaction History Log Audit Report', headers, history, keyMap);
      
      res.header('Content-Type', 'text/html');
      return res.send(pdfHtml);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reportController;
