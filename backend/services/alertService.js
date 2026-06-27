const Stock = require('../models/Stock');

const alertService = {
  /**
   * Get all active stock alerts (low stock & quarantined stock)
   */
  getActiveAlerts: async () => {
    const lowStockItems = await Stock.getLowStock();
    
    // We can also check for quarantined stock items
    const allStock = await Stock.findAll();
    const quarantinedItems = allStock.filter(item => item.status === 'quarantined' && item.quantity > 0);

    const alerts = [];

    // Format low stock alerts
    lowStockItems.forEach(item => {
      alerts.push({
        id: `low_${item.product_id}`,
        type: 'danger',
        title: 'Low Stock Warning',
        message: `Product "${item.product_name}" (${item.product_sku}) is low on stock. Current: ${item.quantity}, Minimum: ${item.min_stock_level}.`,
        product_id: item.product_id,
        quantity: item.quantity,
        min_stock_level: item.min_stock_level
      });
    });

    // Format quarantine alerts
    quarantinedItems.forEach(item => {
      alerts.push({
        id: `quarantine_${item.id}`,
        type: 'warning',
        title: 'Items Quarantined',
        message: `Product "${item.product_name}" has ${item.quantity} ${item.unit} currently in Quarantine.`,
        product_id: item.product_id,
        quantity: item.quantity
      });
    });

    return alerts;
  }
};

module.exports = alertService;
