import React, { useState, useEffect } from 'react';
import stockService from '../services/stockService';
import productService from '../services/productService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import AlertToast from '../components/Alerts';
import { Plus, X, RotateCcw, AlertTriangle, Edit2 } from 'lucide-react';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    reason: '',
    status: 'restocked' // 'restocked' or 'damaged' (damaged means quarantined)
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
      const [retData, prodData] = await Promise.all([
        stockService.getAllReturns(),
        productService.getAll()
      ]);
      setReturns(retData);
      setProducts(prodData);
    } catch (err) {
      setError('Failed to load returns registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      product_id: '',
      quantity: '',
      reason: '',
      status: 'restocked'
    });
    setProductSearch('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (ret) => {
    setEditId(ret.id);
    setFormData({
      product_id: ret.product_id,
      quantity: ret.quantity.toString(),
      reason: ret.reason || '',
      status: ret.status
    });
    setProductSearch(`${ret.product_sku} - ${ret.product_name}`);
    setError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.quantity || !formData.status) {
      setError('Please fill in Product, Quantity, and Disposition status.');
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      if (editId) {
        await stockService.updateReturn(editId, {
          product_id: parseInt(formData.product_id),
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
          status: formData.status
        });
        setSuccess('Returned goods entry modified successfully.');
      } else {
        await stockService.createReturn({
          product_id: parseInt(formData.product_id),
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
          status: formData.status
        });
        setSuccess('Returned goods logged successfully.');
      }

      setShowModal(false);
      setProductSearch('');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to record return.');
    } finally {
      setSubmitting(false);
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
          <h1 className="page-title">Returns Logistics Bay</h1>
          <p className="page-subtitle">Track returned stock items, processing logs, and restock paths.</p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Log Returns
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

      {/* Returns Table */}
      <DataTable
        headers={['Return Date', 'SKU', 'Product Name', 'Quantity', 'Return Reason', 'Disposition Status']}
        keys={['return_date', 'product_sku', 'product_name', 'quantity', 'reason', 'status']}
        data={returns}
        actions={(ret) => (
          <button 
            className="btn btn-secondary btn-small"
            onClick={() => handleOpenEdit(ret)}
            title="Edit Return Log"
          >
            <Edit2 size={12} />
          </button>
        )}
      />

      {/* Log Return Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={modalBodyStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.2rem' }}>
                <RotateCcw size={20} color="var(--accent-blue)" /> {editId ? 'Modify Returned Stock Log' : 'Log Returned Stock'}
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
                <label className="form-label">Returned Quantity*</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 5"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Reason for Return</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Wrong shipment, minor scuffing"
                  disabled={submitting}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Disposition Destination*</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="form-control"
                  required
                  disabled={submitting}
                >
                  <option value="restocked">Restock Directly (Add back to Available Stock)</option>
                  <option value="damaged">Quarantine / Inspect (Flag as Damaged/Quarantined)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }} disabled={submitting}>
                {submitting ? 'Saving...' : editId ? 'Save Changes' : 'Submit Returns Log'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;
