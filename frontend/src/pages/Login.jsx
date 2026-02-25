import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Check, TrendingDown, Shield, BarChart2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const features = [
  { icon: BarChart2, text: 'Real-time cost monitoring & forecasting' },
  { icon: TrendingDown, text: 'Intelligent optimization recommendations' },
  { icon: Shield, text: 'Budget alerts & anomaly detection' },
  { icon: Check, text: 'Multi-subscription management' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Invalid credentials';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail('admin@cloudready.io');
    setPassword('Demo1234!');
  }

  const inputStyle = {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#f1f5f9',
    width: '100%',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      {/* Left – branding */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          borderRight: '1px solid #334155',
        }}
        className="login-left"
      >
        <div style={{ maxWidth: '420px', width: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px' }}>
            <div
              style={{
                width: '52px', height: '52px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              }}
            >
              <Cloud size={28} color="white" />
            </div>
            <div>
              <h1 style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '1.4rem', lineHeight: 1.1 }}>
                Azure Cost Monitor
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                CLOUD READY MANAGER
              </p>
            </div>
          </div>

          <h2 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '1.75rem', lineHeight: 1.3, marginBottom: '16px' }}>
            Optimize Your Cloud Spend
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '40px' }}>
            Monitor, analyze, and reduce Azure costs with AI-powered insights and actionable recommendations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: 'rgba(99,102,241,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Icon size={18} color="#6366f1" />
                </div>
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – form */}
      <div
        style={{
          width: '480px',
          minWidth: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          background: '#0f172a',
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '1.5rem', marginBottom: '6px' }}>
            Sign In
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '32px' }}>
            Enter your credentials to access the dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '500', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cloudready.io"
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
                onBlur={(e) => { e.target.style.borderColor = '#334155'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '500', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#334155'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px',
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#2563eb' : '#3b82f6',
                color: 'white', border: 'none', borderRadius: '10px',
                padding: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem', fontWeight: '600', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'background 0.2s',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#2563eb'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#3b82f6'; }}
            >
              {loading && <span className="spinner spinner-sm" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div
            style={{
              marginTop: '28px',
              padding: '14px 16px',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '10px',
            }}
          >
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demo credentials
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>admin@cloudready.io</p>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Demo1234!</p>
              </div>
              <button
                onClick={fillDemo}
                style={{
                  padding: '7px 14px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
                  border: '1px solid rgba(59,130,246,0.3)', borderRadius: '7px',
                  cursor: 'pointer', fontSize: '0.78rem', fontWeight: '500', fontFamily: 'inherit',
                }}
              >
                Use Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
