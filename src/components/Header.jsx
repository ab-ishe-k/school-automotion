import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  CheckCheck, 
  AlertCircle,
<<<<<<< HEAD
  Clock,
  Sparkles,
  User
=======
  Sparkles
>>>>>>> f8525f1bc74ea25ab961903583e417d29aa705bb
} from 'lucide-react';

const Header = ({ toggleSidebar, theme, setTheme }) => {
  const { currentUser } = useAuth();
  const { notifications, pushNotification, markAllNotificationsRead } = useDatabase();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="header-title-area">
          <h1>Campus Automation</h1>
          <p>School Management & Appointment Console</p>
        </div>
      </div>

      <div className="header-right">
        {/* Dark/Light mode toggler */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* System Notifications dropdown */}
        <div className="notification-bell-container" ref={dropdownRef}>
          <button 
            className="theme-toggle-btn"
            onClick={() => setShowNotifications(prev => !prev)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="glass-panel notifications-dropdown">
              <div 
                style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-tertiary)'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Recent Alerts</span>
                {unreadCount > 0 && (
                  <button 
                    style={{ 
                      fontSize: '11px', 
                      color: 'var(--primary-light)', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => markAllNotificationsRead()}
                  >
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <AlertCircle size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <span style={{ fontSize: '12px' }}>No system notifications</span>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                        cursor: 'default',
                        transition: 'var(--transition)'
                      }}
                    >
                      <p style={{ fontSize: '12px', fontWeight: notif.read ? '400' : '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} />
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity profile tab */}
        {currentUser && (
          <div className="user-profile-badge">
            <div className="user-avatar-icon-box">
              <User size={18} />
            </div>
            <div className="user-meta-info">
              <span className="user-meta-role">{currentUser.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
