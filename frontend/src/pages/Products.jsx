import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import AlertToast from '../components/Alerts';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // null means adding new
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    min_stock_level: 10,
    description: ''
  });

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError('Failed to retrieve products catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      min_stock_level: 10,
      description: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      min_stock_level: product.min_stock_level,
      description: product.description || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.category) {
      setError('Please fill in Name, SKU, and Category.');
      return;
    }

    const skuRegex = /^sku\d{3}$/i;
    if (!skuRegex.test(formData.sku)) {
      setError('SKU must start with "sku" followed by exactly 3 numbers (e.g., sku001).');
      return;
    }

    try {
      if (editId) {
        await productService.update(editId, formData);
        setSuccess('Product details updated successfully.');
      } else {
        await productService.create(formData);
        setSuccess('Product definition added to catalog.');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the product.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This will also remove any related stock history.')) {
      try {
        await productService.delete(id);
        setSuccess('Product successfully deleted.');
        fetchProducts();
      } catch (err) {
        setError(err.message || 'Failed to delete product.');
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
          <h1 className="page-title">Products Catalog</h1>
          <p className="page-subtitle">Define and update catalog specifications and safety margins.</p>
        </div>
        
        {user && (user.role === 'admin' || user.role === 'manager') && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Define Product
          </button>
        )}
      </div>

      {/* Toast Feedbacks */}
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

      {/* Catalog Table */}
      <DataTable
        headers={['SKU', 'Product Name', 'Category', 'Unit Price', 'Min Stock Level']}
        keys={['sku', 'name', 'category', 'price', 'min_stock_level']}
        data={products}
        actions={(product) => (
          <>
            {user && (user.role === 'admin' || user.role === 'manager') && (
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => handleOpenEdit(product)}
                title="Edit Product"
              >
                <Edit2 size={12} />
              </button>
            )}
            {user && user.role === 'admin' && (
              <button 
                className="btn btn-danger btn-small"
                onClick={() => handleDelete(product.id)}
                title="Delete Product"
              >
                <Trash2 size={12} />
              </button>
            )}
          </>
        )}
      />

      {/* Edit / Add Modal Popup */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={modalBodyStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>
                {editId ? 'Modify Product Specifications' : 'Define New Product'}
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
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">SKU (Unique Code)*</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="form-control"
                  placeholder="e.g. sku001"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Wireless Headset"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category*</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Electronics"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-control"
                    placeholder="e.g. 29.99"
                  />
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Min Stock Level</label>
                  <input
                    type="number"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                    className="form-control"
                    placeholder="e.g. 15"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                  placeholder="Product notes or catalog specs..."
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
                Save Specifications
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
