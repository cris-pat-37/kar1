import React, { useEffect } from 'react';
import { X, CheckCircle, AlertOctagon, Info, AlertTriangle } from 'lucide-react';

const AlertToast = ({ id, type = 'info', message, title, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const typeConfig = {
    success: {
      color: 'var(--success)',
      bg: 'rgba(16, 185, 129, 0.08)',
      icon: CheckCircle
    },
    danger: {
      color: 'var(--danger)',
      bg: 'rgba(239, 68, 68, 0.08)',
      icon: AlertOctagon
    },
    warning: {
      color: 'var(--warning)',
      bg: 'rgba(245, 158, 11, 0.08)',
      icon: AlertTriangle
    },
    info: {
      color: 'var(--accent-blue)',
      bg: 'rgba(59, 130, 246, 0.08)',
      icon: Info
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  const toastStyle = {
    display: 'flex',
    gap: '12px',
    padding: '1rem',
    background: 'var(--bg-secondary)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--border-glass)',
    borderLeft: `4px solid ${config.color}`,
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    alignItems: 'flex-start',
    width: '100%',
    animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  if (!document.getElementById('toast-animation-style')) {
    const style = document.createElement('style');
    style.id = 'toast-animation-style';
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <div style={toastStyle}>
      <Icon size={20} color={config.color} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flexGrow: 1 }}>
        {title && <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{title}</h4>}
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{message}</p>
      </div>
      <button 
        onClick={() => onClose(id)} 
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const AlertsContainer = ({ alerts = [], removeAlert }) => {
  return (
    <div className="alerts-list-floating">
      {alerts.map(alert => (
        <AlertToast
          key={alert.id}
          id={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={removeAlert}
          duration={alert.duration}
        />
      ))}
    </div>
  );
};

export default AlertToast;
