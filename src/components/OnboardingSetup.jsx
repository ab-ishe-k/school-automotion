import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Check, 
  X, 
  Lock, 
  User, 
  Loader2, 
  Sparkles,
  BookOpen
} from 'lucide-react';

const OnboardingSetup = () => {
  const { currentUser, users, completeOnboarding } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation States
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  
  // Progress & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = Form, 2 = Animating, 3 = Success
  const [loadingState, setLoadingState] = useState('');

  if (!currentUser) return null;

  // Real-time Username Uniqueness Checker
  useEffect(() => {
    if (!username) {
      setUsernameError('');
      return;
    }

    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long.');
      return;
    }

    const taken = users.some(u => 
      u.permanentUsername?.toLowerCase() === username.toLowerCase() ||
      u.tempId?.toLowerCase() === username.toLowerCase()
    );

    if (taken) {
      setUsernameError(`Username "${username}" is already taken. Please choose another.`);
    } else {
      setUsernameError('');
    }
  }, [username, users]);

  // Real-time Password Strength Checker
  useEffect(() => {
    if (!password) {
      setPasswordError('');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
    } else if (!/\d/.test(password)) {
      setPasswordError('Password must contain at least one numeric digit (0-9).');
    } else {
      setPasswordError('');
    }
  }, [password]);

  // Real-time Confirm Password Checker
  useEffect(() => {
    if (!confirmPassword) {
      setConfirmError('');
      return;
    }

    if (confirmPassword !== password) {
      setConfirmError('Passwords do not match.');
    } else {
      setConfirmError('');
    }
  }, [confirmPassword, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final Validation Checks
    if (usernameError || passwordError || confirmError) return;
    if (!username || !password || !confirmPassword) return;

    setSubmitting(true);
    setStep(2);

    // Dynamic Hashing Loading Animation Sequence
    setLoadingState('Securing password via SHA-256...');
    await new Promise(r => setTimeout(r, 1200));

    setLoadingState('Updating school database spreadsheet rows...');
    await new Promise(r => setTimeout(r, 1000));

    setLoadingState('Activating permanent credentials...');
    const result = await completeOnboarding(currentUser.id, username, password);
    await new Promise(r => setTimeout(r, 800));

    if (result.success) {
      setStep(3);
    } else {
      // Revert if error
      setStep(1);
      setUsernameError(result.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-viewport">
      <div className="login-card" style={{ maxWidth: '550px', gridTemplateColumns: '1fr' }}>
        
        {/* Onboarding Header */}
        <div className="login-brand-side" style={{ padding: '30px', background: 'var(--primary)' }}>
          <div className="login-brand-logo">
            <BookOpen size={24} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1px' }}>HIGH SCHOOL</span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <h1 style={{ fontSize: '20px', margin: 0 }}>Onboarding Security Portal</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Activate your permanent school credentials.</p>
          </div>
        </div>

        {/* Step 1: Account Activation Setup Form */}
        {step === 1 && (
          <div className="login-form-side" style={{ padding: '30px' }}>
            
            {/* User Profile Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div className="user-avatar-icon-box" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'var(--info-bg)', color: 'var(--info)', border: '2px solid var(--primary-light)' }}>
                <User size={20} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--primary-light)', margin: 0, fontWeight: '700', textTransform: 'uppercase' }}>{currentUser.role}</p>
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              Set Permanent Credentials
            </h3>

            <form onSubmit={handleSubmit}>
              
              {/* Permanent Username */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Create Permanent Username / ID</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: `1px solid ${usernameError ? 'var(--danger)' : 'var(--border-color)'}`, borderRadius: '4px', padding: '0 10px' }}>
                  <User size={14} style={{ color: usernameError ? 'var(--danger)' : 'var(--text-tertiary)' }} />
                  <input 
                    type="text" 
                    placeholder="e.g. liamchen12"
                    style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '13px', width: '100%', outline: 'none', color: 'var(--text-primary)' }}
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/\s+/g, ''))} // strip spaces
                    disabled={submitting}
                    required
                  />
                  {username && !usernameError && <Check size={14} style={{ color: 'var(--success)' }} />}
                </div>
                {usernameError && (
                  <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', display: 'block', fontWeight: '600' }}>
                    ⚠️ {usernameError}
                  </span>
                )}
              </div>

              {/* Secure Password */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Create Secure Password</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: `1px solid ${passwordError ? 'var(--danger)' : 'var(--border-color)'}`, borderRadius: '4px', padding: '0 10px' }}>
                  <Lock size={14} style={{ color: passwordError ? 'var(--danger)' : 'var(--text-tertiary)' }} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '13px', width: '100%', outline: 'none', color: 'var(--text-primary)' }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                  {password && !passwordError && <Check size={14} style={{ color: 'var(--success)' }} />}
                </div>
                {passwordError ? (
                  <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', display: 'block', fontWeight: '600' }}>
                    ⚠️ {passwordError}
                  </span>
                ) : (
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                    Password criteria: Min 6 characters & at least 1 number.
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Confirm Password</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: `1px solid ${confirmError ? 'var(--danger)' : 'var(--border-color)'}`, borderRadius: '4px', padding: '0 10px' }}>
                  <Lock size={14} style={{ color: confirmError ? 'var(--danger)' : 'var(--text-tertiary)' }} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '13px', width: '100%', outline: 'none', color: 'var(--text-primary)' }}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                  {confirmPassword && !confirmError && <Check size={14} style={{ color: 'var(--success)' }} />}
                </div>
                {confirmError && (
                  <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', display: 'block', fontWeight: '600' }}>
                    ⚠️ {confirmError}
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', height: '42px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={!!usernameError || !!passwordError || !!confirmError || !username || !password || !confirmPassword || submitting}
              >
                Activate Permanent Account
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Hashing & Database Setup Progress Screen */}
        {step === 2 && (
          <div className="login-form-side" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <Loader2 size={40} className="spinner" style={{ color: 'var(--primary-light)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Encrypting Credentials</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
              {loadingState}
            </p>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div className="login-form-side" style={{ padding: '50px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyRight: 'center', justifyContent: 'center', color: 'var(--success)', marginBottom: '20px', border: '2px solid var(--success)' }}>
              <Check size={28} />
            </div>
            
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--success)' }}>Onboarding Activation Complete!</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              Your permanent username <strong>"{username}"</strong> is now active. Temporary administrator credentials have been securely deactivated.
            </p>

            <button 
              className="btn btn-primary" 
              style={{ padding: '10px 24px', fontSize: '13px' }}
              onClick={() => {
                // Land on dashboard
                window.location.reload();
              }}
            >
              Enter ERP Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default OnboardingSetup;
