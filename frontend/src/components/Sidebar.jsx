import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  List, 
  Users, 
  PlusCircle, 
  Truck, 
  RotateCcw, 
  AlertCircle, 
  History, 
  FileText, 
  BarChart2, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const { hasRole } = useAuth();

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'operator'] },
    { to: '/inventory', label: 'Stock Levels', icon: Package, roles: ['admin', 'manager', 'operator'] },
    { to: '/products', label: 'Products Catalog', icon: List, roles: ['admin', 'manager', 'operator'] },
    { to: '/vendors', label: 'Suppliers Catalog', icon: Users, roles: ['admin', 'manager', 'operator'] },
    { to: '/stock-entry', label: 'Stock Incoming', icon: PlusCircle, roles: ['admin', 'manager', 'operator'] },
    { to: '/dispatch', label: 'Dispatches Outward', icon: Truck, roles: ['admin', 'manager', 'operator'] },
    { to: '/returns', label: 'Returns Bay', icon: RotateCcw, roles: ['admin', 'manager', 'operator'] },
    { to: '/damaged', label: 'Damaged Goods', icon: AlertCircle, roles: ['admin', 'manager', 'operator'] },
    { to: '/history', label: 'Transaction Audit', icon: History, roles: ['admin', 'manager', 'operator'] },
    { to: '/reports', label: 'Reports Download', icon: FileText, roles: ['admin', 'manager', 'operator'] },
    { to: '/analytics', label: 'Charts Analytics', icon: BarChart2, roles: ['admin', 'manager', 'operator'] },
    { to: '/settings', label: 'System Settings', icon: Settings, roles: ['admin', 'manager'] }
  ];

  const sidebarStyle = {
    width: 'var(--sidebar-width)',
    height: '100vh',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-glass)',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000
  };

  const logoStyle = {
    padding: '2rem 1.5rem',
    borderBottom: '1px solid var(--border-glass)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const navListStyle = {
    listStyle: 'none',
    padding: '1.5rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    overflowY: 'auto',
    flexGrow: 1
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.8rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent',
    transition: 'var(--transition-fast)'
  });

  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>
        <div style={{ background: 'var(--accent-gradient)', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.03em' }}>
            MANIKANTA ENTERPRISES
          </h1>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>
            STOCK MANAGEMENT
          </span>
        </div>
      </div>

      <ul style={navListStyle}>
        {links.map((link) => {
          if (!hasRole(link.roles)) return null;
          const Icon = link.icon;
          return (
            <li key={link.to}>
              <NavLink to={link.to} style={navLinkStyle}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{link.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        <span>v1.0.0 Stable</span>
      </div>
    </aside>
  );
};

export default Sidebar;
