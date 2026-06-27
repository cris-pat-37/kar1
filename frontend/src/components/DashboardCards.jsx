import React from 'react';
import { Package, IndianRupee, List, AlertOctagon, ShieldAlert, Truck } from 'lucide-react';

const DashboardCards = ({ summary }) => {
  const cards = [
    {
      title: 'Active Stock Volume',
      value: summary?.totalStockVolume || 0,
      icon: Package,
      color: 'var(--accent-blue)',
      desc: 'Total items in stock'
    },
    {
      title: 'Inventory Valuation',
      value: `₹${(summary?.totalStockValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: IndianRupee,
      color: 'var(--success)',
      desc: 'Active inventory value'
    },
    {
      title: 'Catalog Items',
      value: summary?.totalProducts || 0,
      icon: List,
      color: 'var(--accent-purple)',
      desc: 'Unique product definitions'
    },
    {
      title: 'Low Stock Deficits',
      value: summary?.lowStockCount || 0,
      icon: AlertOctagon,
      color: 'var(--danger)',
      desc: 'Items below threshold',
      alert: (summary?.lowStockCount || 0) > 0
    },
    {
      title: 'Shipments Volume',
      value: summary?.totalDispatches || 0,
      icon: Truck,
      color: 'rgba(245, 158, 11, 1)',
      desc: 'Total items dispatched'
    },
    {
      title: 'Quarantined Items',
      value: summary?.quarantinedCount || 0,
      icon: ShieldAlert,
      color: 'rgba(239, 68, 68, 0.8)',
      desc: 'Quarantined stock items'
    }
  ];

  return (
    <div className="dashboard-grid">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div 
            key={i} 
            className="glass-panel hover-scale" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              borderLeft: `4px solid ${card.color}`
            }}
          >
            {/* Background Glow */}
            <div style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '100px',
              height: '100px',
              background: card.color,
              filter: 'blur(50px)',
              opacity: 0.15,
              pointerEvents: 'none'
            }} />

            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.title}
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, margin: '0.4rem 0 0.2rem 0' }}>
                {card.value}
              </h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {card.desc}
              </span>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={24} color={card.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
