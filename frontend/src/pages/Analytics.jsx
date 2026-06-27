import React, { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import Loader from '../components/Loader';
import AlertToast from '../components/Alerts';
import { 
  StockMovementChart, 
  CategoryPieChart, 
  TopProductsChart 
} from '../components/Charts';
import { BarChart, PieChart as PieIcon, Activity } from 'lucide-react';

const Analytics = () => {
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const data = await reportService.getChartsData();
        setChartsData(data);
      } catch (err) {
        setError('Failed to fetch analytics metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharts();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Charts & Analytics</h1>
        <p className="page-subtitle">Visual performance statistics, trends, and category distribution.</p>
      </div>

      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AlertToast type="danger" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Top Row Grid: Movements & Category share */}
      <div className="chart-grid">
        {/* Movements Area Chart */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '1rem' }}>
            <Activity size={18} color="var(--success)" />
            Stock In vs Dispatches Volume
          </h3>
          <div className="chart-container" style={{ flexGrow: 1 }}>
            <StockMovementChart data={chartsData?.movements} />
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '1rem' }}>
            <PieIcon size={18} color="var(--accent-blue)" />
            Category Stock Share
          </h3>
          <div className="chart-container" style={{ flexGrow: 1 }}>
            <CategoryPieChart data={chartsData?.categoryDistribution} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Dispatched Products */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '1rem' }}>
          <BarChart size={18} color="var(--accent-purple)" />
          Top 5 Shipped Product Models
        </h3>
        <div className="chart-container" style={{ height: '300px' }}>
          <TopProductsChart data={chartsData?.topProducts} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
