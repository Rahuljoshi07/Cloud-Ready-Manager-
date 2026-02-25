import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCloud, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@azurecost.io', password: 'admin123' });
    else setForm({ email: 'viewer@azurecost.io', password: 'viewer123' });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <MdCloud size={48} color="#0078d4" />
          <h1>Azure Cost Monitor</h1>
          <p>Cloud FinOps &amp; Optimization Platform</p>
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <MdEmail style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 32 }}
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <MdLock style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 32, paddingRight: 36 }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPass ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14, marginTop: 4 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>Demo Accounts</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => fillDemo('admin')} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
              👑 Admin Demo
            </button>
            <button onClick={() => fillDemo('viewer')} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
              👁️ Viewer Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
