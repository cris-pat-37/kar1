import React, { useState, useEffect } from 'react';
import DashboardCards from '../components/DashboardCards';
import reportService from '../services/reportService';
import stockService from '../services/stockService';
import Loader from '../components/Loader';
import { AlertCircle, ArrowUpRight, ShieldAlert, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumData, histData, alertData] = await Promise.all([
          reportService.getSummary(),
          stockService.getHistory(),
          stockService.getAlerts()
        ]);
        setSummary(sumData);
        setHistory(histData.slice(0, 5)); // Show only top 5 recent history
        setAlerts(alertData);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Warehouse Dashboard</h1>
          <p className="page-subtitle">Real-time status metrics and transaction ledger overview.</p>
        </div>
      </div>

      {/* Metric Widgets Grid */}
      <DashboardCards summary={summary} />

      {/* Main Grid: History and Alerts Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Recent Audit Ledger */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
              <History size={18} color="var(--accent-blue)" />
              Recent Operations Log
            </h3>
            <Link to="/history" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              View Audit Ledger <ArrowUpRight size={14} />
            </Link>
          </div>
          
          <div className="table-wrapper" style={{ flexGrow: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Transaction</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No recent operations.
                    </td>
                  </tr>
                ) : (
                  history.map((log) => {
                    let badgeClass = 'badge-blue';
                    if (log.transaction_type === 'stock_in') badgeClass = 'badge-success';
                    if (log.transaction_type === 'return') badgeClass = 'badge-success';
                    if (log.transaction_type === 'dispatch') badgeClass = 'badge-blue';
                    if (log.transaction_type === 'damaged') badgeClass = 'badge-danger';
                    
                    return (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.8rem' }}>{new Date(log.transaction_date).toLocaleDateString()} {new Date(log.transaction_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td style={{ fontWeight: 600 }}>{log.product_sku}</td>
                        <td>{log.product_name}</td>
                        <td>
                          <span className={`badge ${badgeClass}`}>{log.transaction_type.toUpperCase().replace('_', ' ')}</span>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{log.quantity}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warning Alerts List */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} color="var(--warning)" />
            Stock Deficits & Warnings
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '350px', flexGrow: 1 }}>
            {alerts.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--text-muted)', padding: '2rem 0' }}>
                <p style={{ fontSize: '0.85rem' }}>All inventory matches healthy thresholds.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  style={{ 
                    padding: '10px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--border-glass)', 
                    borderRadius: '8px',
                    borderLeft: `3px solid ${alert.type === 'danger' ? 'var(--danger)' : 'var(--warning)'}`,
                    display: 'flex',
                    gap: '10px'
                  }}
                >
                  <AlertCircle size={18} color={alert.type === 'danger' ? 'var(--danger)' : 'var(--warning)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{alert.title}</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                      {alert.message}
                    </p>
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

export default Dashboard;
