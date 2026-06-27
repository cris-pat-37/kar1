import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

// Helper to pivot movement history data into chartable format
// Original data: { month: "2026-06", transaction_type: "stock_in", total_qty: 15 }
const parseMovementsData = (movements = []) => {
  const monthsMap = {};
  
  movements.forEach(item => {
    if (!monthsMap[item.month]) {
      monthsMap[item.month] = { month: item.month, Incoming: 0, Outgoing: 0 };
    }
    
    if (item.transaction_type === 'stock_in' || item.transaction_type === 'return') {
      monthsMap[item.month].Incoming += item.total_qty;
    } else if (item.transaction_type === 'dispatch' || item.transaction_type === 'damaged') {
      monthsMap[item.month].Outgoing += item.total_qty;
    }
  });

  return Object.values(monthsMap).sort((a, b) => a.month.localeCompare(b.month));
};

export const StockMovementChart = ({ data = [] }) => {
  const chartData = parseMovementsData(data);

  if (chartData.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No movement history records found.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
        <YAxis stroke="var(--text-muted)" fontSize={11} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        <Area type="monotone" dataKey="Incoming" name="Stock In / Restocks" stroke="var(--success)" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
        <Area type="monotone" dataKey="Outgoing" name="Dispatched / Damaged" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const CategoryPieChart = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No category stock found.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
          nameKey="category"
          label={({ x, y, cx, category, percent }) => (
            <text
              x={x}
              y={y}
              fill="var(--text-primary)"
              fontSize="10px"
              fontFamily="var(--font-sans)"
              textAnchor={x > cx ? 'start' : 'end'}
              dominantBaseline="central"
            >
              {`${category} (${(percent * 100).toFixed(0)}%)`}
            </text>
          )}
          labelLine={false}
          style={{ fontSize: '10px', fontFamily: 'var(--font-sans)' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const TopProductsChart = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No shipment dispatches logged.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value} />
        <YAxis stroke="var(--text-muted)" fontSize={11} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
        />
        <Bar dataKey="value" name="Total Units Dispatched" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
