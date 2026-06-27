const Stock = require('../models/Stock');
const StockHistory = require('../models/StockHistory');

const inventoryService = {
  /**
   * Add stock to the warehouse
   */
  addStock: async ({ product_id, vendor_id, quantity, location, unit, user_id, notes }) => {
    let stockItem = await Stock.findByProductAndStatus(product_id, 'available');
    let previous_quantity = 0;
    let new_quantity = quantity;
    let stockId = null;

    if (stockItem) {
      previous_quantity = stockItem.quantity;
      new_quantity = previous_quantity + quantity;
      stockId = stockItem.id;
      await Stock.updateQuantity(stockId, new_quantity);
      if (location || vendor_id) {
        await Stock.updateLocationAndVendor(stockId, location || stockItem.location, vendor_id || stockItem.vendor_id);
      }
    } else {
      const newStock = await Stock.create({
        product_id,
        vendor_id,
        quantity,
        location: location || 'Unassigned',
        unit: unit || 'pcs',
        status: 'available'
      });
      stockId = newStock.id;
    }

    // Write history
    await StockHistory.create({
      product_id,
      transaction_type: 'stock_in',
      quantity,
      previous_quantity,
      new_quantity,
      user_id,
      notes: notes || `Stocked in from vendor.`
    });

    return { stockId, previous_quantity, new_quantity };
  },

  /**
   * Dispatch stock out of the warehouse
   */
  dispatchStock: async ({ product_id, quantity, user_id, notes }) => {
    let stockItem = await Stock.findByProductAndStatus(product_id, 'available');
    if (!stockItem || stockItem.quantity < quantity) {
      throw new Error(`Insufficient stock. Available: ${stockItem ? stockItem.quantity : 0}, Requested: ${quantity}`);
    }

    const previous_quantity = stockItem.quantity;
    const new_quantity = previous_quantity - quantity;

    await Stock.updateQuantity(stockItem.id, new_quantity);

    // Write history
    await StockHistory.create({
      product_id,
      transaction_type: 'dispatch',
      quantity,
      previous_quantity,
      new_quantity,
      user_id,
      notes: notes || `Dispatched items.`
    });

    return { stockId: stockItem.id, previous_quantity, new_quantity };
  },

  /**
   * Record returns and update inventory levels
   */
  returnStock: async ({ product_id, quantity, isRestocked, user_id, notes }) => {
    let stockItem = await Stock.findByProductAndStatus(product_id, 'available');
    let previous_quantity = 0;
    let new_quantity = 0;
    let stockId = null;

    if (isRestocked) {
      if (stockItem) {
        previous_quantity = stockItem.quantity;
        new_quantity = previous_quantity + quantity;
        stockId = stockItem.id;
        await Stock.updateQuantity(stockId, new_quantity);
      } else {
        const newStock = await Stock.create({
          product_id,
          vendor_id: null,
          quantity,
          location: 'Returns Bay',
          unit: 'pcs',
          status: 'available'
        });
        stockId = newStock.id;
        new_quantity = quantity;
      }

      // Write history
      await StockHistory.create({
        product_id,
        transaction_type: 'return',
        quantity,
        previous_quantity,
        new_quantity,
        user_id,
        notes: notes || `Stock returned and restocked.`
      });
    } else {
      // Quarantine returned stock as a different status or write it off
      let quarantinedStock = await Stock.findByProductAndStatus(product_id, 'quarantined');
      if (quarantinedStock) {
        previous_quantity = quarantinedStock.quantity;
        new_quantity = previous_quantity + quantity;
        stockId = quarantinedStock.id;
        await Stock.updateQuantity(stockId, new_quantity);
      } else {
        const newStock = await Stock.create({
          product_id,
          vendor_id: null,
          quantity,
          location: 'Quarantine Area',
          unit: 'pcs',
          status: 'quarantined'
        });
        stockId = newStock.id;
        new_quantity = quantity;
      }

      // History log
      await StockHistory.create({
        product_id,
        transaction_type: 'return',
        quantity,
        previous_quantity,
        new_quantity: stockItem ? stockItem.quantity : 0, // available quantity stays the same
        user_id,
        notes: notes || `Stock returned and quarantined.`
      });
    }

    return { stockId, previous_quantity, new_quantity };
  },

  /**
   * Log damaged goods and reduce available stock
   */
  reportDamage: async ({ product_id, quantity, action, user_id, notes }) => {
    let stockItem = await Stock.findByProductAndStatus(product_id, 'available');
    if (!stockItem || stockItem.quantity < quantity) {
      throw new Error(`Cannot report damage for ${quantity} items. Available available stock is only ${stockItem ? stockItem.quantity : 0}.`);
    }

    const previous_quantity = stockItem.quantity;
    const new_quantity = previous_quantity - quantity;

    await Stock.updateQuantity(stockItem.id, new_quantity);

    // If quarantined, we increment the quarantined stack
    if (action === 'quarantined') {
      let qStock = await Stock.findByProductAndStatus(product_id, 'quarantined');
      if (qStock) {
        await Stock.updateQuantity(qStock.id, qStock.quantity + quantity);
      } else {
        await Stock.create({
          product_id,
          vendor_id: stockItem.vendor_id,
          quantity,
          location: 'Quarantine Area',
          unit: stockItem.unit,
          status: 'quarantined'
        });
      }
    }

    // Write history
    await StockHistory.create({
      product_id,
      transaction_type: 'damaged',
      quantity,
      previous_quantity,
      new_quantity,
      user_id,
      notes: notes || `Damaged goods reported (${action}).`
    });

    return { stockId: stockItem.id, previous_quantity, new_quantity };
  },

  /**
   * Edit returned goods and sync inventory levels
   */
  editReturnStock: async ({ oldReturn, newReturn, user_id }) => {
    // 1. Revert the old return
    const wasRestocked = oldReturn.status === 'restocked' || oldReturn.status === 'inspected';
    if (wasRestocked) {
      let stockItem = await Stock.findByProductAndStatus(oldReturn.product_id, 'available');
      if (stockItem) {
        if (stockItem.quantity - oldReturn.quantity < 0) {
          throw new Error(`Insufficient available stock to revert the previous return record. (Requires at least ${oldReturn.quantity} available units).`);
        }
        await Stock.updateQuantity(stockItem.id, stockItem.quantity - oldReturn.quantity);
      }
    } else {
      let quarantinedStock = await Stock.findByProductAndStatus(oldReturn.product_id, 'quarantined');
      if (quarantinedStock) {
        if (quarantinedStock.quantity - oldReturn.quantity < 0) {
          throw new Error(`Insufficient quarantined stock to revert the previous return record. (Requires at least ${oldReturn.quantity} quarantined units).`);
        }
        await Stock.updateQuantity(quarantinedStock.id, quarantinedStock.quantity - oldReturn.quantity);
      }
    }

    // 2. Apply the new return
    const isRestocked = newReturn.status === 'restocked' || newReturn.status === 'inspected';
    let previous_quantity = 0;
    let new_quantity = 0;
    let stockId = null;

    if (isRestocked) {
      let stockItem = await Stock.findByProductAndStatus(newReturn.product_id, 'available');
      if (stockItem) {
        previous_quantity = stockItem.quantity;
        new_quantity = previous_quantity + newReturn.quantity;
        stockId = stockItem.id;
        await Stock.updateQuantity(stockId, new_quantity);
      } else {
        const newStock = await Stock.create({
          product_id: newReturn.product_id,
          vendor_id: null,
          quantity: newReturn.quantity,
          location: 'Returns Bay',
          unit: 'pcs',
          status: 'available'
        });
        stockId = newStock.id;
        new_quantity = newReturn.quantity;
      }

      // Write history
      await StockHistory.create({
        product_id: newReturn.product_id,
        transaction_type: 'return',
        quantity: newReturn.quantity,
        previous_quantity,
        new_quantity,
        user_id,
        notes: `Returned item log updated (restocked). Reason: ${newReturn.reason || 'N/A'}`
      });
    } else {
      let quarantinedStock = await Stock.findByProductAndStatus(newReturn.product_id, 'quarantined');
      if (quarantinedStock) {
        previous_quantity = quarantinedStock.quantity;
        new_quantity = previous_quantity + newReturn.quantity;
        stockId = quarantinedStock.id;
        await Stock.updateQuantity(stockId, new_quantity);
      } else {
        const newStock = await Stock.create({
          product_id: newReturn.product_id,
          vendor_id: null,
          quantity: newReturn.quantity,
          location: 'Quarantine Area',
          unit: 'pcs',
          status: 'quarantined'
        });
        stockId = newStock.id;
        new_quantity = newReturn.quantity;
      }

      let stockItem = await Stock.findByProductAndStatus(newReturn.product_id, 'available');

      // Write history
      await StockHistory.create({
        product_id: newReturn.product_id,
        transaction_type: 'return',
        quantity: newReturn.quantity,
        previous_quantity,
        new_quantity: stockItem ? stockItem.quantity : 0,
        user_id,
        notes: `Returned item log updated (quarantined). Reason: ${newReturn.reason || 'N/A'}`
      });
    }

    return { stockId, previous_quantity, new_quantity };
  },

  /**
   * Edit damaged goods and sync inventory levels
   */
  editDamageStock: async ({ oldDamage, newDamage, user_id }) => {
    // 1. Revert the old damage
    // The old damage reduced available stock, so we restore it
    let stockItem = await Stock.findByProductAndStatus(oldDamage.product_id, 'available');
    if (stockItem) {
      await Stock.updateQuantity(stockItem.id, stockItem.quantity + oldDamage.quantity);
    } else {
      await Stock.create({
        product_id: oldDamage.product_id,
        vendor_id: null,
        quantity: oldDamage.quantity,
        location: 'Unassigned',
        unit: 'pcs',
        status: 'available'
      });
    }

    // If the old damage status was quarantined, it incremented quarantined stock, so we deduct it
    const wasQuarantined = oldDamage.status === 'quarantined';
    if (wasQuarantined) {
      let quarantinedStock = await Stock.findByProductAndStatus(oldDamage.product_id, 'quarantined');
      if (quarantinedStock) {
        if (quarantinedStock.quantity - oldDamage.quantity < 0) {
          // Revert previous restore if check fails to prevent side effects
          let currentStockItem = await Stock.findByProductAndStatus(oldDamage.product_id, 'available');
          if (currentStockItem) {
            await Stock.updateQuantity(currentStockItem.id, currentStockItem.quantity - oldDamage.quantity);
          }
          throw new Error(`Insufficient quarantined stock to revert the previous damage report. (Requires at least ${oldDamage.quantity} quarantined units).`);
        }
        await Stock.updateQuantity(quarantinedStock.id, quarantinedStock.quantity - oldDamage.quantity);
      }
    }

    // 2. Apply the new damage
    // We must deduct the new quantity from available stock
    let newStockItem = await Stock.findByProductAndStatus(newDamage.product_id, 'available');
    if (!newStockItem || newStockItem.quantity < newDamage.quantity) {
      // Revert previous restore to restore consistency before throwing
      let currentStockItem = await Stock.findByProductAndStatus(oldDamage.product_id, 'available');
      if (currentStockItem) {
        await Stock.updateQuantity(currentStockItem.id, currentStockItem.quantity - oldDamage.quantity);
      }
      if (wasQuarantined) {
        let quarantinedStock = await Stock.findByProductAndStatus(oldDamage.product_id, 'quarantined');
        if (quarantinedStock) {
          await Stock.updateQuantity(quarantinedStock.id, quarantinedStock.quantity + oldDamage.quantity);
        }
      }
      throw new Error(`Cannot report edited damage for ${newDamage.quantity} items. Available stock is only ${newStockItem ? newStockItem.quantity : 0}.`);
    }

    const previous_quantity = newStockItem.quantity;
    const new_quantity = previous_quantity - newDamage.quantity;

    await Stock.updateQuantity(newStockItem.id, new_quantity);

    // If quarantined, we increment the quarantined stack
    const isQuarantined = newDamage.status === 'quarantined';
    if (isQuarantined) {
      let qStock = await Stock.findByProductAndStatus(newDamage.product_id, 'quarantined');
      if (qStock) {
        await Stock.updateQuantity(qStock.id, qStock.quantity + newDamage.quantity);
      } else {
        await Stock.create({
          product_id: newDamage.product_id,
          vendor_id: newStockItem.vendor_id,
          quantity: newDamage.quantity,
          location: 'Quarantine Area',
          unit: newStockItem.unit,
          status: 'quarantined'
        });
      }
    }

    // Write history
    await StockHistory.create({
      product_id: newDamage.product_id,
      transaction_type: 'damaged',
      quantity: newDamage.quantity,
      previous_quantity,
      new_quantity,
      user_id,
      notes: `Damaged goods report updated (${newDamage.status}). Description: ${newDamage.description || 'N/A'}`
    });

    return { stockId: newStockItem.id, previous_quantity, new_quantity };
  }
};

module.exports = inventoryService;
