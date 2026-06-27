import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import vendorService from '../services/vendorService';
import stockService from '../services/stockService';
import Loader from '../components/Loader';
import AlertToast from '../components/Alerts';
import { PlusCircle, FileText, MapPin } from 'lucide-react';

const StockEntry = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    product_id: '',
    vendor_id: '',
    quantity: '',
    unit: 'pcs',
    location: '',
    notes: ''
  });

  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Filter products based on search term
  const filteredProducts = products.filter(p => 
    p.sku.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectProduct = (p) => {
    setFormData({ ...formData, product_id: p.id });
    setProductSearch(`${p.sku} - ${p.name}`);
    setShowProductDropdown(false);
  };

  const loadData = async () => {
    try {
      const [prodData, vendData, histData] = await Promise.all([
        productService.getAll(),
        vendorService.getAll(),
        stockService.getHistory()
      ]);
      setProducts(prodData);
      setVendors(vendData);
      // Filter history to only show 'stock_in' transactions
      setHistory(histData.filter(log => log.transaction_type === 'stock_in').slice(0, 10));
    } catch (err) {
      setError('Failed to load catalog data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.quantity) {
      setError('Please select a Product and specify a Quantity.');
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await stockService.addStockEntry({
        product_id: parseInt(formData.product_id),
        vendor_id: formData.vendor_id ? parseInt(formData.vendor_id) : null,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        location: formData.location,
        notes: formData.notes
      });

      setSuccess('Stock registered successfully.');
      setFormData({
        product_id: '',
        vendor_id: '',
        quantity: '',
        unit: 'pcs',
        location: '',
        notes: ''
      });
      setProductSearch('');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to submit stock entry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Stock Incoming Entry</h1>
        <p className="page-subtitle">Register and warehouse incoming goods from suppliers.</p>
      </div>

      {success && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertToast type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}
      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertToast type="danger" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Registration Form */}
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            <PlusCircle size={18} color="var(--accent-blue)" />
            Incoming Logistics Receipt
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0, position: 'relative' }}>
              <label className="form-label">Product SKU / Model*</label>
              <input
                type="text"
                className="form-control"
                placeholder="Type to search SKU or Name..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                  if (formData.product_id) {
                    setFormData(prev => ({ ...prev, product_id: '' }));
                  }
                }}
                onFocus={() => setShowProductDropdown(true)}
                disabled={submitting}
                required
              />
              
              {showProductDropdown && (
                <>
                  <div 
                    onClick={() => setShowProductDropdown(false)} 
                    style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9 }} 
                  />
                  <div 
                    className="glass-panel" 
                    style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      right: 0, 
                      zIndex: 10, 
                      maxHeight: '200px', 
                      overflowY: 'auto', 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '4px',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    {filteredProducts.length === 0 ? (
                      <div style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No matching products found
                      </div>
                    ) : (
                      filteredProducts.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => selectProduct(p)}
                          style={{ 
                            padding: '10px', 
                            cursor: 'pointer', 
                            color: 'var(--text-primary)',
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            fontSize: '0.85rem'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          <strong>{p.sku}</strong> - {p.name}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Supplier Inc.</label>
              <select
                value={formData.vendor_id}
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                className="form-control"
                disabled={submitting}
              >
                <option value="">-- Choose Supplier --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Quantity*</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 50"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="form-control"
                  disabled={submitting}
                >
                  <option value="pcs">pcs</option>
                  <option value="packs">packs</option>
                  <option value="boxes">boxes</option>
                  <option value="pallets">pallets</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Warehouse Storage Location</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Aisle 3, Shelf B"
                  style={{ paddingLeft: '2.5rem' }}
                  disabled={submitting}
                />
                <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Log Note / Receipt Details</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-control"
                placeholder="Log details (e.g., P.O. #4567)..."
                rows={3}
                style={{ resize: 'none' }}
                disabled={submitting}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
              disabled={submitting}
            >
              {submitting ? 'Registering...' : 'Register Stock Receipt'}
            </button>
          </form>
        </div>

        {/* Recent Stock-in logs */}
        <div className="glass-panel" style={{ maxHeight: '535px', overflowY: 'auto' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            <FileText size={18} color="var(--success)" />
            Recent Stock-in Receipts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No recent stock receipts logged.
              </p>
            ) : (
              history.map(log => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'white' }}>{log.product_name}</span>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                      SKU: {log.product_sku} | Oper: {log.username || 'System'}
                    </div>
                    {log.notes && (
                      <div style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        "{log.notes}"
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--success)', fontSize: '1rem' }}>+{log.quantity}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.70rem', marginTop: '2px' }}>
                      {new Date(log.transaction_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockEntry;
