import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/breakdown': 'Cost Breakdown',
  '/recommendations': 'Recommendations',
  '/budgets': 'Budgets',
  '/alerts': 'Alerts'
};

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const title = PAGE_TITLES[location.pathname] || 'Azure Cost Monitor';

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <header style={{
      height: 64, background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', gap: 16, flexShrink: 0
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
          borderRadius: 8, padding: '7px 12px', width: 220
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            placeholder="Search resources..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 13, width: '100%'
            }}
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost" style={{ position: 'relative' }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, background: 'var(--accent-red)',
            borderRadius: '50%', border: '2px solid var(--bg-secondary)'
          }} />
        </button>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              borderRadius: 8, padding: '6px 12px', color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </span>
            <ChevronDown size={12} color="var(--text-muted)" />
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', zIndex: 100,
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 10, padding: 6, minWidth: 180, boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                <div style={{ fontSize: 10, color: 'var(--accent-blue)', textTransform: 'uppercase', marginTop: 2 }}>{user?.role}</div>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '8px 12px', borderRadius: 6, background: 'none', border: 'none',
                  color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13
                }}
              >
                <User size={14} /> Profile
              </button>
              <button
                onClick={() => { setShowUserMenu(false); handleLogout(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '8px 12px', borderRadius: 6, background: 'none', border: 'none',
                  color: 'var(--accent-red)', cursor: 'pointer', fontSize: 13
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
