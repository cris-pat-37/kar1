import React, { useState } from 'react';
import reportService from '../services/reportService';
import AlertToast from '../components/Alerts';
import { FileSpreadsheet, FileText, Download, ExternalLink } from 'lucide-react';

const Reports = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloading, setDownloading] = useState({
    inventoryCSV: false,
    inventoryPDF: false,
    historyCSV: false,
    historyPDF: false
  });

  const handleCSVExport = async (type, label) => {
    setError('');
    setSuccess('');
    setDownloading(prev => ({ ...prev, [`${type}CSV`]: true }));

    try {
      await reportService.downloadCSV(type);
      setSuccess(`Exported ${label} to CSV successfully.`);
    } catch (err) {
      setError(`Failed to download ${label} CSV.`);
    } finally {
      setDownloading(prev => ({ ...prev, [`${type}CSV`]: false }));
    }
  };

  const handlePDFExport = async (type, label) => {
    setError('');
    setSuccess('');
    setDownloading(prev => ({ ...prev, [`${type}PDF`]: true }));

    try {
      await reportService.openPDF(type);
      setSuccess(`Opened ${label} printable PDF report in a new tab.`);
    } catch (err) {
      setError(`Failed to compile ${label} PDF report.`);
    } finally {
      setDownloading(prev => ({ ...prev, [`${type}PDF`]: false }));
    }
  };

  const reportCards = [
    {
      title: 'Active Stock Balance Ledger',
      description: 'Generates detailed sheets of active inventory balances, item details, locations, and vendors.',
      icon: FileSpreadsheet,
      color: 'var(--accent-blue)',
      type: 'inventory'
    },
    {
      title: 'Operations Transaction History Log',
      description: 'Generates the audit ledger log detailing chronological stock entries, dispatches, and quarantine adjustments.',
      icon: FileText,
      color: 'var(--accent-purple)',
      type: 'history'
    }
  ];

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '1.5rem',
    minHeight: '220px'
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Reports Management</h1>
        <p className="page-subtitle">Export official warehouse spreadsheets and generate printable PDF logs.</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {reportCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-panel" style={cardStyle}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                  <Icon size={24} color={card.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.4rem' }}>{card.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{card.description}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                  onClick={() => handleCSVExport(card.type, card.title)}
                  disabled={downloading[`${card.type}CSV`]}
                >
                  <Download size={14} /> 
                  {downloading[`${card.type}CSV`] ? 'Exporting...' : 'Export CSV'}
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                  onClick={() => handlePDFExport(card.type, card.title)}
                  disabled={downloading[`${card.type}PDF`]}
                >
                  <ExternalLink size={14} /> 
                  {downloading[`${card.type}PDF`] ? 'Compiling...' : 'Print PDF'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
