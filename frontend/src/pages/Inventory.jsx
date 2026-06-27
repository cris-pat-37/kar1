import React, { useState, useEffect } from 'react';
import stockService from '../services/stockService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import AlertToast from '../components/Alerts';
import { Package, AlertOctagon, CheckCircle, Eye } from 'lucide-react';

const Inventory = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'quarantined'

  const fetchStock = async () => {
    try {
      const data = await stockService.getAllStock();
      setStock(data);
    } catch (err) {
      setError('Failed to retrieve inventory levels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredStock = stock.filter(item => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  if (loading) {
    return <Loader />;
  }

  const filterButtonStyle = (active) => ({
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    background: active ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.03)',
    border: '1px solid',
    borderColor: active ? 'var(--accent-blue)' : 'var(--border-glass)',
    color: 'white',
    fontWeight: active ? 'bold' : 'normal',
    transition: 'var(--transition-fast)'
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className="page-title">Warehouse Inventory Stock</h1>
          <p className="page-subtitle">Real-time tracking of active warehouse storage balances.</p>
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            style={filterButtonStyle(statusFilter === 'all')}
            onClick={() => setStatusFilter('all')}
          >
            All Stock
          </button>
          <button 
            style={filterButtonStyle(statusFilter === 'available')}
            onClick={() => setStatusFilter('available')}
          >
            Available
          </button>
          <button 
            style={filterButtonStyle(statusFilter === 'quarantined')}
            onClick={() => setStatusFilter('quarantined')}
          >
            Quarantined
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertToast type="danger" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Main Stock Levels Table */}
      <DataTable
        headers={['SKU', 'Product Name', 'Category', 'Quantity', 'Unit', 'Storage Location', 'Supplier Name', 'Status']}
        keys={['product_sku', 'product_name', 'product_category', 'quantity', 'unit', 'location', 'vendor_name', 'status']}
        data={filteredStock}
        searchPlaceholder="Filter items by name/SKU/location..."
        actions={(item) => (
          <>
            {item.status === 'available' && item.quantity < item.min_stock_level && (
              <span 
                className="badge badge-danger" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '24px', padding: '0 8px' }}
                title={`Below min stock level threshold: ${item.min_stock_level}`}
              >
                <AlertOctagon size={12} /> Low Stock
              </span>
            )}
            {item.status === 'available' && item.quantity >= item.min_stock_level && (
              <span 
                className="badge badge-success" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '24px', padding: '0 8px' }}
                title="Healthy Stock Threshold"
              >
                <CheckCircle size={12} /> Healthy
              </span>
            )}
          </>
        )}
      />
    </div>
  );
};

export default Inventory;
