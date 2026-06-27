import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import AlertToast from '../components/Alerts';
import { UserPlus, Users, AlertTriangle, Key } from 'lucide-react';
import DataTable from '../components/DataTable';
import apiRequest from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'operator'
  });

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest('/api/auth/users');
      setUsersList(data);
    } catch (err) {
      setError('Failed to fetch user accounts directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setError('');
    setSuccess('');
    setPasswordSubmitting(true);

    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword
        })
      });

      setSuccess('Your password has been changed successfully.');
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setSuccess(`Account "${formData.username}" created successfully.`);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'operator'
      });
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to register new account.');
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
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Configure system users, profiles, and access authorization.</p>
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

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: (user?.role === 'admin' || user?.role === 'manager') ? '1fr 1.5fr' : '1fr', 
        gap: '1.5rem', 
        alignItems: 'start',
        maxWidth: (user?.role === 'admin' || user?.role === 'manager') ? 'none' : '600px',
        margin: (user?.role === 'admin' || user?.role === 'manager') ? '0' : '0 auto'
      }}>
        
        {/* Left Column wrapper for admin (multiple panels) or manager (single change password panel) */}
        { (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'operator') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* User Creation Form (Admin Only) */}
            {user?.role === 'admin' && (
              <div className="glass-panel">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                  <UserPlus size={18} color="var(--accent-blue)" />
                  Create Operator Account
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Username*</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="form-control"
                      placeholder="e.g. jsmith"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address*</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-control"
                      placeholder="e.g. jsmith@warehouse.com"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Temporary Password*</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Access Authorization Role*</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="form-control"
                      required
                      disabled={submitting}
                    >
                      <option value="operator">Operator (Basic Entry & Outbound Logging)</option>
                      <option value="manager">Manager (Manage Suppliers & Products)</option>
                      <option value="admin">Administrator (Full Access & User Control)</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Registering Account...' : 'Register User'}
                  </button>
                </form>
              </div>
            )}

            {/* Change Password Form (All Users) */}
            <div className="glass-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <Key size={18} color="var(--accent-purple)" />
                Change Your Password
              </h3>

              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Current Password*</label>
                  <input
                    type="password"
                    value={passwordFormData.currentPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                    className="form-control"
                    placeholder="Enter current password"
                    required
                    disabled={passwordSubmitting}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">New Password*</label>
                  <input
                    type="password"
                    value={passwordFormData.newPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    required
                    disabled={passwordSubmitting}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Confirm New Password*</label>
                  <input
                    type="password"
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                    className="form-control"
                    placeholder="Retype new password"
                    required
                    disabled={passwordSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Users Directory Table */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="glass-panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              <Users size={18} color="var(--accent-purple)" />
              Users & Operators Directory
            </h3>

            <DataTable
              headers={['Username', 'Email Address', 'Role Badge', 'Registered Date']}
              keys={['username', 'email', 'role', 'created_at']}
              data={usersList}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
