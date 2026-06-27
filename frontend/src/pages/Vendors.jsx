import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import vendorService from '../services/vendorService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import AlertToast from '../components/Alerts';

const Vendors = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchVendors = async () => {
    try {
      const data = await vendorService.getAll();
      setVendors(data);
    } catch (err) {
      setError('Failed to retrieve suppliers catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditId(vendor.id);
    setFormData({
      name: vendor.name,
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Please fill in Supplier Name.');
      return;
    }

    try {
      if (editId) {
        await vendorService.update(editId, formData);
        setSuccess('Supplier profile updated successfully.');
      } else {
        await vendorService.create(formData);
        setSuccess('Supplier registered successfully.');
      }
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      setError(err.message || 'An error occurred while saving supplier profile.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier? This will not affect existing stock logs.')) {
      try {
        await vendorService.delete(id);
        setSuccess('Supplier profile deleted.');
        fetchVendors();
      } catch (err) {
        setError(err.message || 'Failed to delete supplier profile.');
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
          <h1 className="page-title">Suppliers Directory</h1>
          <p className="page-subtitle">Manage supplier accounts and contact specifications.</p>
        </div>
        
        {user && (user.role === 'admin' || user.role === 'manager') && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Supplier
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

      {/* Vendors Table */}
      <DataTable
        headers={['Supplier Name', 'Contact Person', 'Email', 'Phone', 'Address']}
        keys={['name', 'contact_person', 'email', 'phone', 'address']}
        data={vendors}
        actions={(vendor) => (
          <>
            {user && (user.role === 'admin' || user.role === 'manager') && (
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => handleOpenEdit(vendor)}
                title="Edit Supplier"
              >
                <Edit2 size={12} />
              </button>
            )}
            {user && user.role === 'admin' && (
              <button 
                className="btn btn-danger btn-small"
                onClick={() => handleDelete(vendor.id)}
                title="Delete Supplier"
              >
                <Trash2 size={12} />
              </button>
            )}
          </>
        )}
      />

      {/* Edit / Add Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={modalBodyStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>
                {editId ? 'Modify Supplier Profile' : 'Register Supplier Account'}
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
                <label className="form-label">Supplier Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Apex Manufacturing Inc."
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-control"
                  placeholder="e.g. sales@apexmfg.com"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-control"
                  placeholder="e.g. +1-555-0155"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-control"
                  placeholder="e.g. 12 Depot Rd, Industrial City"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
                Save Supplier Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
