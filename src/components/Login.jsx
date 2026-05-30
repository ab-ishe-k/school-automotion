import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ShieldCheck, Key, User } from 'lucide-react';

const Login = () => {
  const { login, quickProfiles } = useAuth();
  const [selectedRole, setSelectedRole] = useState('Student');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loginMode, setLoginMode] = useState('quick'); // quick, custom

  const handleQuickLogin = (role) => {
    login(role);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName || !customEmail) return;
    login(selectedRole, { name: customName, email: customEmail });
  };

  return (
    <div className="login-viewport">
      <div className="login-card">
        {/* Left Branding Side */}
        <div className="login-brand-side">
          <div className="login-brand-logo">
            <div className="logo-icon">
              <BookOpen size={22} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              BEACON HIGH
            </span>
          </div>

          <div className="login-brand-content">
            <h1>School Automation</h1>
            <p>
              Welcome to the Beacon High School Automation Portal. Schedule consultation appointments with instructors, submit academic requests, manage query logs, and access administrative dashboard metrics securely.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
            <span>Role-Based Access Control Active</span>
          </div>
        </div>

        {/* Right Authentication Form Side */}
        <div className="login-form-side">
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: 'var(--primary)' }}>
            System Gate
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Choose a profile below to log into their customized role dashboard.
          </p>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <button 
              className="btn"
              style={{
                background: 'none',
                border: 'none',
                borderBottom: loginMode === 'quick' ? '2.5px solid var(--primary-light)' : 'none',
                color: loginMode === 'quick' ? 'var(--primary-light)' : 'var(--text-secondary)',
                borderRadius: '0',
                padding: '8px 16px',
                fontWeight: '700',
                fontSize: '13px'
              }}
              onClick={() => setLoginMode('quick')}
            >
              Quick Profiles (All 6 Roles)
            </button>
            <button 
              className="btn"
              style={{
                background: 'none',
                border: 'none',
                borderBottom: loginMode === 'custom' ? '2.5px solid var(--primary-light)' : 'none',
                color: loginMode === 'custom' ? 'var(--primary-light)' : 'var(--text-secondary)',
                borderRadius: '0',
                padding: '8px 16px',
                fontWeight: '700',
                fontSize: '13px'
              }}
              onClick={() => setLoginMode('custom')}
            >
              Custom Auth Access
            </button>
          </div>

          {loginMode === 'quick' ? (
            <div>
              <div className="quick-profiles-grid">
                {quickProfiles.map(profile => (
                  <button 
                    key={profile.id}
                    className="quick-profile-card"
                    onClick={() => handleQuickLogin(profile.role)}
                    title={profile.description}
                  >
                    <img 
                      className="quick-profile-avatar" 
                      src={profile.avatar} 
                      alt={profile.name} 
                    />
                    <div className="quick-profile-info">
                      <span className="quick-profile-name">{profile.name}</span>
                      <span className="quick-profile-role">{profile.role}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                💡 Hover over quick login cards to view their responsibilities.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit}>
              <div className="form-group">
                <label>Select Workspace Role</label>
                <select 
                  className="filter-input"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                >
                  <option value="Student">Student Dashboard</option>
                  <option value="Parent">Parent Dashboard</option>
                  <option value="Teacher">Teacher / Advisor</option>
                  <option value="Principal">Executive Principal</option>
                  <option value="Admin Staff">Admin Controller</option>
                  <option value="Reception / Office Staff">Office Receptionist</option>
                </select>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Liam Chen"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. liam@beacon.edu"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
              >
                Authenticate Dashboard
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
