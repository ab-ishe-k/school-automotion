import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  ShieldCheck, 
  Lock, 
  User, 
  AlertTriangle, 
  Mail, 
  CheckCircle,
  ArrowLeft,
  X,
  Sparkles,
  ClipboardCopy
} from 'lucide-react';

const Login = () => {
  const { 
    login, 
    users, 
    sessionExpiredAlert, 
    forgotPassword, 
    resetPassword 
  } = useAuth();

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot Password States
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Reset Password States (Triggered by URL params from simulated email link)
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // Developer Demo Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Parse URL recovery parameters on boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    if (token && email) {
      setResetMode(true);
      setResetToken(token);
      setResetEmail(email);
    }
  }, []);

  // 1. SUBMIT ACTIONS
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoginError('');
    setSubmitting(true);

    const result = await login(username, password);

    if (result.success) {
      // Land on setup or dashboard (page redirects based on setup status)
      if (result.isSetupCompleted) {
        window.location.reload();
      } else {
        // Redirect will happen in App.jsx switch case
      }
    } else {
      setLoginError(result.message);
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotError('');
    setForgotSuccess('');

    const result = forgotPassword(forgotEmail);
    if (result.success) {
      setForgotSuccess(result.message);
      setForgotEmail('');
    } else {
      setForgotError(result.message);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    setResetError('');
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setResetError('Password must contain at least one numeric digit (0-9).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    const result = await resetPassword(resetEmail, resetToken, newPassword);
    if (result.success) {
      setResetSuccess(true);
      // Remove query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setResetError(result.message);
    }
  };

  // 2. COPY CREDENTIALS TO CLIPBOARD HELPER
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${type}: "${text}" to clipboard!`);
  };

  return (
    <div className="login-viewport" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* 🔑 DEV ONBOARDING HUB LAUNCHER BUTTON */}
      <button 
        onClick={() => setDrawerOpen(true)}
        className="btn btn-primary"
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontSize: '12px',
          padding: '8px 14px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 90
        }}
      >
        <Sparkles size={14} />
        Developer Onboarding Hub
      </button>

      {/* Main Authentication Card */}
      <div className="login-card">
        
        {/* Left Branding Side */}
        <div className="login-brand-side">
          <div className="login-brand-logo">
            <div className="logo-icon">
              <BookOpen size={20} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              BEACON HIGH
            </span>
          </div>

          <div className="login-brand-content">
            <h1>School ERP Portal</h1>
            <p>
              Access your personalized student learning desks, faculty monthly payrolls, administrative rosters, visitor logs, and consultation scheduling engines safely.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
            <span>SHA-256 Passwords Hashing & Session Guards Active</span>
          </div>
        </div>

        {/* Right Authentication Pane */}
        <div className="login-form-side">
          
          {/* A. RECOVERY PASSWORD MODE (URL TRIGGERED) */}
          {resetMode ? (
            <div>
              {resetSuccess ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', margin: '0 auto 16px auto', border: '1px solid var(--success)' }}>
                    <CheckCircle size={24} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--success)', marginBottom: '8px' }}>Password Overwritten Successfully!</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Your new credentials are now active. You may now log in.
                  </p>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => {
                      setResetMode(false);
                      setResetSuccess(false);
                      setUsername('');
                      setPassword('');
                    }}
                  >
                    Back to System Gate
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px', color: 'var(--primary)' }}>Reset Security Password</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Overwriting credentials for <strong>{resetEmail}</strong>.
                  </p>

                  {resetError && (
                    <div style={{ display: 'flex', gap: '8px', padding: '10px', backgroundColor: 'var(--danger-bg)', borderRadius: '4px', borderLeft: '3px solid var(--danger)', marginBottom: '16px', fontSize: '12px', color: 'var(--text-primary)' }}>
                      <AlertTriangle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>New Secure Password</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 10px' }}>
                      <Lock size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <input 
                        type="password" 
                        className="form-input" 
                        style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '13px', width: '100%', outline: 'none' }}
                        placeholder="Min 6 chars, 1 number"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label>Confirm New Password</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 10px' }}>
                      <Lock size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <input 
                        type="password" 
                        className="form-input" 
                        style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '13px', width: '100%', outline: 'none' }}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
                    Apply Password Reset
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ width: '100%', border: 'none' }}
                    onClick={() => {
                      setResetMode(false);
                      window.history.replaceState({}, document.title, window.location.pathname);
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          ) : forgotMode ? (
            /* B. FORGOT PASSWORD REQUEST MODE */
            <form onSubmit={handleForgotSubmit}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--primary)' }}>Recover Account</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Enter your registered school email address. We will dispatch a recovery link to your simulated webmail inbox.
              </p>

              {forgotError && (
                <div style={{ display: 'flex', gap: '8px', padding: '10px', backgroundColor: 'var(--danger-bg)', borderRadius: '4px', borderLeft: '3px solid var(--danger)', marginBottom: '16px', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <AlertTriangle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: 'var(--success-bg)', borderRadius: '4px', borderLeft: '3px solid var(--success)', marginBottom: '16px', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Registered School Email</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 10px' }}>
                  <Mail size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '13px', width: '100%', outline: 'none' }}
                    placeholder="e.g. liam.chen@school.edu"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
                Send Recovery Email
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => { setForgotMode(false); setForgotSuccess(''); setForgotError(''); }}
              >
                <ArrowLeft size={12} />
                Back to System Gate
              </button>
            </form>
          ) : (
            /* C. STANDARD LOGIN PANEL */
            <form onSubmit={handleLoginSubmit}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: 'var(--primary)' }}>
                System Gate
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Log in using school-issued Temporary IDs or your activated Permanent Username.
              </p>

              {/* Inactivity Session Expiry Warn */}
              {sessionExpiredAlert && (
                <div style={{ display: 'flex', gap: '8px', padding: '10px', backgroundColor: 'var(--warning-bg)', borderRadius: '4px', borderLeft: '3px solid var(--warning)', marginBottom: '16px', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                  <span><strong>Session Expired:</strong> Inactivity limit reached. Please re-authenticate.</span>
                </div>
              )}

              {/* Login Errors */}
              {loginError && (
                <div style={{ display: 'flex', gap: '8px', padding: '10px', backgroundColor: 'var(--danger-bg)', borderRadius: '4px', borderLeft: '3px solid var(--danger)', marginBottom: '16px', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <AlertTriangle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              {/* User ID Input */}
              <div className="form-group">
                <label>User ID / Username</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 10px' }}>
                  <User size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '13px', width: '100%', outline: 'none', color: 'var(--text-primary)' }}
                    placeholder="Temporary ID or Permanent Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ margin: 0 }}>Security Password</label>
                  <button 
                    type="button" 
                    style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontSize: '11px', cursor: 'pointer', fontWeight: '700', padding: 0 }}
                    onClick={() => setForgotMode(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 10px' }}>
                  <Lock size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <input 
                    type="password" 
                    className="form-input" 
                    style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '13px', width: '100%', outline: 'none', color: 'var(--text-primary)' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', height: '40px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}
                disabled={submitting}
              >
                {submitting ? 'Authenticating Gateway...' : 'Secure Login'}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* 🔑 SLIDE-OUT DEVELOPER ONBOARDING DESK DRAWER */}
      <div 
        className={`sidebar-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        style={{ zIndex: 110 }}
      />
      <div 
        className={`glass-panel`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 120,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            Developer Onboarding Demo Hub
          </h3>
          <button 
            onClick={() => setDrawerOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Use these administrator-issued temporary credentials to test first-time account setups. Click a row to auto-copy details, enter them in the form, and complete activation!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map(u => (
            <div 
              key={u.id}
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '11px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <img src={u.avatar} alt={u.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: '700', fontSize: '12px' }}>{u.name}</h4>
                  <span className={`status-badge ${u.isSetupCompleted ? 'approved' : 'pending'}`} style={{ fontSize: '8px', padding: '1px 5px' }}>
                    {u.isSetupCompleted ? 'Onboarding Active' : 'Setup Required'}
                  </span>
                </div>
              </div>

              {!u.isSetupCompleted ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--bg-secondary)', padding: '6px 8px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Temp ID: <strong style={{ color: 'var(--primary-light)' }}>{u.tempId}</strong></span>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                      onClick={() => handleCopy(u.tempId, 'Temporary ID')}
                      title="Copy ID"
                    >
                      <ClipboardCopy size={11} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Temp Password: <strong style={{ color: 'var(--success)' }}>{u.tempPassword}</strong></span>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                      onClick={() => handleCopy(u.tempPassword, 'Temporary Password')}
                      title="Copy Password"
                    >
                      <ClipboardCopy size={11} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '4px 0' }}>
                  Activated. Login with permanent username: <strong>"{u.permanentUsername}"</strong>.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Login;
