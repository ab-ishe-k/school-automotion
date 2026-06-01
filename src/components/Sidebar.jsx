import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  AlertTriangle, 
  Database, 
  Mail, 
  Users, 
  User,
  LogOut,
  Sparkles,
  BookOpen,
  CreditCard
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, activeSection, setActiveSection }) => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  // Base navigation based on user roles
  const getNavLinks = () => {
    const base = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];

    switch (currentUser.role) {
      case 'Principal':
        return [
          ...base,
          { id: 'appointments', label: 'Principal Appointments', icon: Calendar },
          { id: 'queries', label: 'Queries Overseer', icon: MessageSquare },
          { id: 'complaints', label: 'Disciplinary Escalations', icon: AlertTriangle },
          { id: 'integrations', label: 'Cloud Integrations Sync', icon: Database }
        ];
      case 'Teacher':
        return [
          ...base,
          { id: 'appointments', label: 'My Consultations', icon: Calendar },
          { id: 'queries', label: 'Student Academic Queries', icon: MessageSquare },
          { id: 'complaints', label: 'Class Complaints', icon: AlertTriangle },
          { id: 'integrations', label: 'Google Integrations', icon: Database }
        ];
      case 'Student':
        return [
          ...base,
          { id: 'appointments', label: 'Book Appointment', icon: Calendar },
          { id: 'queries', label: 'Raise Query / Tickets', icon: MessageSquare },
          { id: 'complaints', label: 'Infrastructure Grievance', icon: AlertTriangle },
          { id: 'integrations', label: 'Sync Simulator', icon: Database }
        ];
      case 'Parent':
        return [
          ...base,
          { id: 'appointments', label: 'Teacher Consultations', icon: Calendar },
          { id: 'queries', label: 'My Child\'s Queries', icon: MessageSquare },
          { id: 'complaints', label: 'Lodge Bus/Infra Grievance', icon: AlertTriangle },
          { id: 'integrations', label: 'Google Integrations', icon: Database }
        ];
      case 'Admin Staff':
        return [
          ...base,
          { id: 'appointments', label: 'Schedules Manager', icon: Calendar },
          { id: 'queries', label: 'Queries Routing', icon: MessageSquare },
          { id: 'complaints', label: 'Complaints Resolution', icon: AlertTriangle },
          { id: 'id-generator', label: 'ID Card Generator', icon: CreditCard },
          { id: 'integrations', label: 'Live Database Sheets', icon: Database }
        ];
      case 'Reception / Office Staff':
        return [
          ...base,
          { id: 'appointments', label: 'Visitor Booking Queue', icon: Calendar },
          { id: 'queries', label: 'Reception Queries Desk', icon: MessageSquare },
          { id: 'complaints', label: 'Submit Incidents', icon: AlertTriangle },
          { id: 'id-generator', label: 'ID Card Generator', icon: CreditCard },
          { id: 'integrations', label: 'Simulators Sync', icon: Database }
        ];
      case 'Vice Principal':
        return [
          ...base,
          { id: 'appointments', label: 'Vice Principal Meetings', icon: Calendar },
          { id: 'queries', label: 'Operations & Routing', icon: MessageSquare },
          { id: 'complaints', label: 'Discipline & Transport', icon: AlertTriangle },
          { id: 'integrations', label: 'Simulators Sync', icon: Database }
        ];
      default:
        return base;
    }
  };

  const navLinks = getNavLinks();

  const handleLinkClick = (id) => {
    setActiveSection(id);
    if (window.innerWidth <= 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Responsive Overlay Backround */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={toggleSidebar} 
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo Banner Area */}
        <div className="sidebar-logo-area">
          <div className="logo-icon">
            <BookOpen size={20} />
          </div>
          <div className="logo-text">
            <h2>Beacon High</h2>
            <p>Automation Suite</p>
          </div>
        </div>

        {/* User Card */}
        <div className="sidebar-user-block">
          <div className="user-avatar-icon-box" style={{ borderColor: 'rgba(255, 255, 255, 0.15)', color: 'var(--accent)' }}>
            <User size={20} />
          </div>
          <div className="user-meta-info" style={{ color: 'white' }}>
            <span className="user-meta-role" style={{ color: 'var(--accent)', fontWeight: '700' }}>
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav-links">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Logout Footer */}
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <LogOut size={16} />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
