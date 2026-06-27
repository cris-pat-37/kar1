import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User, AlertTriangle } from 'lucide-react';
import stockService from '../services/stockService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await stockService.getAlerts();
        setAlerts(data);
      } catch (err) {
        console.error('Failed to fetch stock alerts:', err);
      }
    };

    fetchAlerts();
    // Poll alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => {
    setShowAlertDropdown(!showAlertDropdown);
  };

  const navbarStyle = {
    height: 'var(--navbar-height)',
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border-glass)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 900
  };

  const actionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    position: 'relative'
  };

  const bellContainerStyle = {
    position: 'relative',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    transition: 'var(--transition-fast)',
    background: showAlertDropdown ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
  };

  const badgeStyle = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: 'var(--danger)',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--danger-glow)'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: '0',
    marginTop: '10px',
    width: '320px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    padding: '1rem',
    zIndex: 1000
  };

  const userContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderLeft: '1px solid var(--border-glass)',
    paddingLeft: '1.5rem'
  };

  return (
    <header style={navbarStyle}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600 }}>
          STOCK CONTROL CENTER
        </h2>
      </div>

      <div style={actionsStyle}>
        {/* Notifications Bell */}
        <div style={bellContainerStyle} onClick={toggleDropdown}>
          <Bell size={20} color={alerts.length > 0 ? 'var(--warning)' : 'var(--text-secondary)'} />
          {alerts.length > 0 && <span style={badgeStyle}>{alerts.length}</span>}
        </div>

        {/* Notifications Dropdown */}
        {showAlertDropdown && (
          <div style={dropdownStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Active Alerts</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{alerts.length} Warnings</span>
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alerts.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>
                  No active stock alerts.
                </p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: `3px solid ${alert.type === 'danger' ? 'var(--danger)' : 'var(--warning)'}` }}>
                    <AlertTriangle size={16} color={alert.type === 'danger' ? 'var(--danger)' : 'var(--warning)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: '600' }}>{alert.title}</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.2' }}>{alert.message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* User Info & Logout */}
        {user && (
          <div style={userContainerStyle}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.username}</div>
              <span className={`badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'manager' ? 'badge-warning' : 'badge-blue'}`} style={{ fontSize: '0.65rem', marginTop: '2px' }}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <button 
              className="btn btn-secondary btn-small" 
              onClick={logout} 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
