import React, { useState, useEffect } from 'react';
import stockService from '../services/stockService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import AlertToast from '../components/Alerts';

const StockHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await stockService.getHistory();
        setHistory(data);
      } catch (err) {
        setError('Failed to load transaction logs ledger.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Transaction Audit Ledger</h1>
        <p className="page-subtitle">Full system chronological history of stock adjustments, entries, and dispatches.</p>
      </div>

      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertToast type="danger" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Audit Logs Table */}
      <DataTable
        headers={['Timestamp', 'Product SKU', 'Product Name', 'Operation', 'Qty Change', 'Previous Qty', 'New Qty', 'Operator ID', 'Notes / Remarks']}
        keys={['transaction_date', 'product_sku', 'product_name', 'status', 'quantity', 'previous_quantity', 'new_quantity', 'username', 'notes']}
        data={history.map(item => ({
          ...item,
          status: item.transaction_type // Mapping transaction_type to status field for DataTable status color mapping
        }))}
        searchPlaceholder="Search logs by SKU, operator, transaction type..."
      />
    </div>
  );
};

export default StockHistory;
