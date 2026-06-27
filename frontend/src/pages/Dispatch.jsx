import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import stockService from '../services/stockService';
import productService from '../services/productService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import AlertToast from '../components/Alerts';
import { Plus, X, Truck, AlertTriangle, Check } from 'lucide-react';

const Dispatch = () => {
  const { user } = useAuth();
  const [dispatches, setDispatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    destination: '',
    tracking_number: ''
  });

  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

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
      const [dispData, prodData] = await Promise.all([
        stockService.getAllDispatches(),
        productService.getAll()
      ]);
      setDispatches(dispData);
      setProducts(prodData);
    } catch (err) {
      setError('Failed to retrieve shipments register.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      product_id: '',
      quantity: '',
      destination: '',
      tracking_number: ''
    });
    setProductSearch('');
    setError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.quantity || !formData.destination) {
      setError('Please fill in Product, Quantity, and Destination.');
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await stockService.createDispatch({
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
        destination: formData.destination,
        tracking_number: formData.tracking_number
      });

      setSuccess('Shipment dispatch registered.');
      setShowModal(false);
      setProductSearch('');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to dispatch shipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    if (currentStatus === 'shipped') {
      try {
        await stockService.updateDispatchStatus(id, 'delivered');
        setSuccess('Shipment delivery recorded.');
        loadData();
      } catch (err) {
        setError('Failed to update shipment status.');
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100
  };

  const modalBodyStyle = {
    maxWidth: '500px',
    width: '100%',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="page-title">Dispatches & Shipments</h1>
          <p className="page-subtitle">Track and log outgoing product distribution logistics.</p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Create Dispatch
        </button>
      </div>

      {success && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertToast type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}
      {error && !showModal && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertToast type="danger" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Dispatches Table */}
      <DataTable
        headers={['Date', 'SKU', 'Product Name', 'Quantity', 'Destination', 'Tracking No', 'Status']}
        keys={['dispatch_date', 'product_sku', 'product_name', 'quantity', 'destination', 'tracking_number', 'status']}
        data={dispatches}
        actions={(disp) => (
          <>
            {user && (user.role === 'admin' || user.role === 'manager') && disp.status === 'shipped' && (
              <button 
                className="btn btn-primary btn-small"
                onClick={() => handleStatusUpdate(disp.id, disp.status)}
                title="Mark as Delivered"
                style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <Check size={12} /> Delivered
              </button>
            )}
          </>
        )}
      />

      {/* Dispatch Modal Form */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={modalBodyStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.2rem' }}>
                <Truck size={20} color="var(--accent-blue)" /> Register Outward Dispatch
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: 'var(--danger)', fontSize: '0.8rem', alignItems: 'center' }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0, position: 'relative' }}>
                <label className="form-label">Product SKU / Name*</label>
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
                <label className="form-label">Dispatch Quantity*</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 25"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Destination Address / Consignee*</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Retailer Outlet #10"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tracking / Shipping Reference</label>
                <input
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  className="form-control"
                  placeholder="e.g. UPS-89762410-US"
                  disabled={submitting}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }} disabled={submitting}>
                {submitting ? 'Processing Dispatch...' : 'Dispatch Shipment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;
