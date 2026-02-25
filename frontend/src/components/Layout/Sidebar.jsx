import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdAttachMoney, MdCloud, MdLightbulb,
  MdNotifications, MdAccountBalanceWallet, MdAssessment,
  MdLogout, MdCloud as AzureIcon,
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'react-query';
import api from '../../services/api';

const navItems = [
  { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  { to: '/costs', icon: <MdAttachMoney />, label: 'Cost Breakdown' },
  { to: '/recommendations', icon: <MdLightbulb />, label: 'Recommendations' },
  { to: '/alerts', icon: <MdNotifications />, label: 'Alerts', badge: 'alerts' },
  { to: '/budgets', icon: <MdAccountBalanceWallet />, label: 'Budgets' },
  { to: '/reports', icon: <MdAssessment />, label: 'Reports' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: alertSummary } = useQuery('alertSummary', () =>
    api.get('/alerts/summary').then(r => r.data).catch(() => null),
    { refetchInterval: 60000 }
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <AzureIcon size={28} color="#0078d4" />
        <div className="sidebar-logo-text">
          Azure Cost Monitor
          <span>Cloud FinOps Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Navigation</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
              {item.badge === 'alerts' && alertSummary?.active > 0 && (
                <span className="nav-badge">{alertSummary.active}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <strong>{user?.name || 'User'}</strong>
            {user?.role}
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', marginLeft: 'auto', cursor: 'pointer', fontSize: 18 }}
            title="Logout"
          >
            <MdLogout />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
