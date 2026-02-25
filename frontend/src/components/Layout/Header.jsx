import React from 'react';
import { useLocation } from 'react-router-dom';
import { MdLightMode, MdDarkMode, MdRefresh, MdDownload } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/costs': 'Cost Breakdown',
  '/recommendations': 'Optimization Recommendations',
  '/alerts': 'Cost Alerts',
  '/budgets': 'Budgets',
  '/reports': 'Reports',
};

const Header = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] || 'Azure Cost Monitor';

  return (
    <header className="header">
      <div>
        <span className="header-title">{title}</span>
      </div>
      <div className="header-actions">
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>

        <button className="header-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
          background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)',
          fontSize: 12, color: 'var(--text-secondary)',
        }}>
          <span style={{
            width: 8, height: 8, background: 'var(--accent-green)',
            borderRadius: '50%', display: 'inline-block',
          }} />
          {user?.email}
        </div>
      </div>
    </header>
  );
};

export default Header;
