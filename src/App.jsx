import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';

// Import CSS Design system
import './styles/index.css';
import './styles/dashboards.css';
import './styles/components.css';

// Layout & Core components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import IntegrationTab from './components/IntegrationTab';
import IDGenerator from './components/IDGenerator';
import OnboardingSetup from './components/OnboardingSetup';
import ErrorBoundary from './components/ErrorBoundary';

// Role Dashboards
import PrincipalDashboard from './dashboards/PrincipalDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import ParentDashboard from './dashboards/ParentDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import ReceptionDashboard from './dashboards/ReceptionDashboard';
import VicePrincipalDashboard from './dashboards/VicePrincipalDashboard';

const MainAppLayout = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('school_theme') || 'light';
  });

  // Apply dark/light theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('school_theme', theme);
  }, [theme]);

  // If user log out, reset active view
  useEffect(() => {
    if (!currentUser) {
      setActiveSection('dashboard');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Login />;
  }

  // Force onboarding setup if it's the user's first login
  if (!currentUser.isSetupCompleted) {
    return <OnboardingSetup />;
  }

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // Dynamic Dashboard Loader based on logged-in role
  const renderDashboardByRole = (activeSection, setActiveSection) => {
    const props = { activeSection, setActiveSection };
    switch (currentUser.role) {
      case 'Principal':
        return <PrincipalDashboard {...props} />;
      case 'Teacher':
        return <TeacherDashboard {...props} />;
      case 'Student':
        return <StudentDashboard {...props} />;
      case 'Parent':
        return <ParentDashboard {...props} />;
      case 'Admin Staff':
        return <AdminDashboard {...props} />;
      case 'Reception / Office Staff':
        return <ReceptionDashboard {...props} />;
      case 'Vice Principal':
        return <VicePrincipalDashboard {...props} />;
      default:
        return (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <h2>Welcome, {currentUser.name}</h2>
            <p>Accessing base automation services.</p>
          </div>
        );
    }
  };

  // Section Routing Grid
  const renderContent = () => {
    if (activeSection === 'dashboard') {
      return renderDashboardByRole(activeSection, setActiveSection);
    } else if (activeSection === 'integrations') {
      return <IntegrationTab />;
    } else if (activeSection === 'id-generator') {
      return <IDGenerator activeSection={activeSection} setActiveSection={setActiveSection} />;
    } else {
      return renderDashboardByRole(activeSection, setActiveSection);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Pane */}
      <div className="main-content">
        <Header 
          toggleSidebar={toggleSidebar} 
          theme={theme}
          setTheme={setTheme}
        />
        
        {/* Core Dashboard Viewport */}
        <main className="dashboard-viewport">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <MainAppLayout />
      </DatabaseProvider>
    </AuthProvider>
  );
};

export default App;
