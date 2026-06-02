import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext();

// Helper to hash password using browser-native SHA-256 (Web Crypto API)
export const hashPassword = async (password) => {
  if (!password) return '';
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const INITIAL_USERS = [
  {
    id: 'usr-principal-90281',
    name: 'Dr. Adrian Vance',
    role: 'Principal',
    email: 'vance.principal@school.edu',
    linkedStudentName: null,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    tempId: 'TEMP-PRN-90281',
    tempPassword: 'Demo-PRN-2026',
    permanentUsername: '',
    passwordHash: '',
    isSetupCompleted: false,
    description: 'Executive principal of High School. Manages calendars, escalations, and audits.'
  },
  {
    id: 'usr-teacher-20192',
    name: 'Mr. Marcus Davis',
    role: 'Teacher',
    email: 'davis.math@school.edu',
    linkedStudentName: null,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    tempId: 'TEMP-TCH-20192',
    tempPassword: 'Demo-TCH-2026',
    permanentUsername: '',
    passwordHash: '',
    isSetupCompleted: false,
    description: 'Advisory mathematics instructor. Resolves academic queries and guides consultations.'
  },
  {
    id: 'usr-student-88201',
    name: 'Liam Chen',
    role: 'Student',
    email: 'liam.chen@school.edu',
    linkedStudentName: 'Liam Chen',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    tempId: 'TEMP-STD-88201',
    tempPassword: 'Demo-STD-2026',
    permanentUsername: '',
    passwordHash: '',
    isSetupCompleted: false,
    description: 'Student Grade 11-A. Manages academic queries, consultation bookings, and billing alerts.'
  },
  {
    id: 'usr-parent-30821',
    name: 'Sarah Smith',
    role: 'Parent',
    email: 'sarah.smith@school.edu',
    linkedStudentName: 'Liam Chen',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    tempId: 'TEMP-PAR-30821',
    tempPassword: 'Demo-PAR-2026',
    permanentUsername: '',
    passwordHash: '',
    isSetupCompleted: false,
    description: 'Parent of Liam Chen. Manages school fees checkouts and teacher consultation schedules.'
  },
  {
    id: 'usr-admin-10822',
    name: 'Mrs. Janet Finch',
    role: 'Admin Staff',
    email: 'finch.admin@school.edu',
    linkedStudentName: null,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    tempId: 'TEMP-ADM-10822',
    tempPassword: 'Demo-ADM-2026',
    permanentUsername: '',
    passwordHash: '',
    isSetupCompleted: false,
    description: 'System administrator. Coordinates spreadsheets, admissions, and ID card generation.'
  },
  {
    id: 'usr-reception-00192',
    name: 'Officer Alan',
    role: 'Reception / Office Staff',
    email: 'alan.frontdesk@school.edu',
    linkedStudentName: null,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    tempId: 'TEMP-REC-00192',
    tempPassword: 'Demo-REC-2026',
    permanentUsername: '',
    passwordHash: '',
    isSetupCompleted: false,
    description: 'Office receptionist desk. Handles walk-in registries, caller queries, and safety logs.'
  },
  {
    id: 'usr-vp-10291',
    name: 'Ms. Clara Vance',
    role: 'Vice Principal',
    email: 'vance.vp@school.edu',
    linkedStudentName: null,
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150',
    tempId: 'TEMP-VPS-10291',
    tempPassword: 'Demo-VPS-2026',
    permanentUsername: '',
    passwordHash: '',
    isSetupCompleted: false,
    description: 'Vice Principal. Oversees disciplinary routes, transport alerts, and staff payroll.'
  }
];

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    try {
      const data = localStorage.getItem('school_users');
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch (e) {
      console.warn('Error parsing school_users from localStorage, resetting to default.', e);
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [sessionExpiredAlert, setSessionExpiredAlert] = useState(false);
  const [isServerMode, setIsServerMode] = useState(false);

  // Sync users database locally as fallback
  useEffect(() => {
    localStorage.setItem('school_users', JSON.stringify(users));
  }, [users]);

  // Fetch temp users from API or fallback
  const fetchTempUsers = async () => {
    try {
      const data = await apiRequest('/auth/temp-users', 'GET');
      if (data.success && data.users && data.users.length > 0) {
        setUsers(data.users);
        setIsServerMode(true);
      } else {
        // Fallback to local storage if API is running but returned empty
        setIsServerMode(true);
      }
    } catch (err) {
      console.warn('API down, using local simulation mode for temporary onboarding users.');
      setIsServerMode(false);
    }
  };

  // Session check on boot
  useEffect(() => {
    fetchTempUsers();
    
    const activeSession = localStorage.getItem('school_auth_session');
    if (activeSession) {
      try {
        const session = JSON.parse(activeSession);
        if (session.expiresAt < Date.now()) {
          logout();
          setSessionExpiredAlert(true);
        } else {
          // Look up user from fresh list
          const freshUser = users.find(u => u.id === session.user?.id || u._id === session.user?.id);
          setCurrentUser(freshUser || session.user);
        }
      } catch (err) {
        logout();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SECURE LOGIN ROUTE
  const login = async (username, password) => {
    setSessionExpiredAlert(false);

    // Try API Login first
    try {
      const data = await apiRequest('/auth/login', 'POST', { username, password });
      if (data.success) {
        const session = {
          user: data.user,
          token: data.token,
          loginTime: Date.now(),
          expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
        };
        localStorage.setItem('school_auth_session', JSON.stringify(session));
        setCurrentUser(data.user);
        setIsServerMode(true);
        fetchTempUsers();
        return { success: true, isSetupCompleted: data.user.isSetupCompleted, user: data.user };
      }
    } catch (err) {
      console.warn('Backend login query failed, falling back to local simulation engine.', err);
    }

    // Fallback to Local Simulation Login
    const hashed = await hashPassword(password);
    const foundUser = users.find(u => {
      if (!u.isSetupCompleted) {
        return u.tempId === username && u.tempPassword === password;
      }
      return u.permanentUsername?.toLowerCase() === username.toLowerCase() && u.passwordHash === hashed;
    });

    if (foundUser) {
      setCurrentUser(foundUser);
      setIsServerMode(false);
      const session = {
        user: foundUser,
        loginTime: Date.now(),
        expiresAt: Date.now() + 2 * 60 * 60 * 1000
      };
      localStorage.setItem('school_auth_session', JSON.stringify(session));
      return { success: true, isSetupCompleted: foundUser.isSetupCompleted, user: foundUser };
    }

    return { success: false, message: 'Invalid credentials. If running backend, check if MongoDB is active.' };
  };

  // LOGOUT ROUTE
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('school_auth_session');
  };

  // COMPLETE ACCOUNT ONBOARDING
  const completeOnboarding = async (userId, permanentName, password) => {
    // Try API Onboarding first
    if (isServerMode) {
      try {
        const data = await apiRequest('/auth/onboarding', 'POST', { 
          permanentUsername: permanentName, 
          newPassword: password 
        });
        if (data.success) {
          const session = {
            user: data.user,
            token: data.token,
            loginTime: Date.now(),
            expiresAt: Date.now() + 2 * 60 * 60 * 1000
          };
          localStorage.setItem('school_auth_session', JSON.stringify(session));
          setCurrentUser(data.user);
          return { success: true };
        }
      } catch (err) {
        console.warn('API Onboarding failed, using local fallback.');
      }
    }

    // Fallback Local Setup
    const usernameTaken = users.some(u => 
      u.permanentUsername?.toLowerCase() === permanentName.toLowerCase() ||
      u.tempId?.toLowerCase() === permanentName.toLowerCase()
    );

    if (usernameTaken) {
      return { success: false, message: `Username "${permanentName}" is already taken.` };
    }

    const hashed = await hashPassword(password);
    let updatedProfile = null;

    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId || u._id === userId) {
          updatedProfile = {
            ...u,
            permanentUsername: permanentName,
            passwordHash: hashed,
            isSetupCompleted: true,
            tempId: '',
            tempPassword: ''
          };
          return updatedProfile;
        }
        return u;
      })
    );

    if (updatedProfile) {
      setCurrentUser(updatedProfile);
      const session = {
        user: updatedProfile,
        loginTime: Date.now(),
        expiresAt: Date.now() + 2 * 60 * 60 * 1000
      };
      localStorage.setItem('school_auth_session', JSON.stringify(session));
    }

    return { success: true };
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email) => {
    if (isServerMode) {
      try {
        const data = await apiRequest('/auth/forgotpassword', 'POST', { email });
        if (data.success) {
          return { success: true, message: data.message };
        }
      } catch (err) {
        console.warn('API ForgotPassword failed, using local fallback.');
      }
    }

    // Local Fallback
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Email address not registered in school records.' };
    }

    const recoveryToken = `rst_tok_${Math.floor(100000 + Math.random() * 900000)}`;
    localStorage.setItem(`recovery_${email}`, recoveryToken);

    // Append to local email log
    const rawEmails = localStorage.getItem('school_emails');
    const emailList = rawEmails ? JSON.parse(rawEmails) : [];
    
    const recoveryEmail = {
      id: `eml-${Math.floor(100000 + Math.random() * 900000)}`,
      to: email,
      subject: '🔒 Security Desk: Password Reset Link',
      body: `Dear ${user.name},\n\nWe received a request to securely reset the password for your ERP account.\n\nPlease click the link below to overwrite your credentials and create a new secure password:\n\nhttp://localhost:5173/reset-password?token=${recoveryToken}&email=${email}\n\nThis token is valid for 1 hour. If you did not request this, please notify the IT Administration office immediately.`,
      sender: 'IT Security Desk <security@highschool.edu>',
      date: new Date().toISOString(),
      isRead: false
    };

    emailList.unshift(recoveryEmail);
    localStorage.setItem('school_emails', JSON.stringify(emailList));

    return { success: true, message: 'Password recovery instructions dispatched to local simulated inbox!' };
  };

  // RESET PASSWORD
  const resetPassword = async (email, token, newPassword) => {
    if (isServerMode) {
      try {
        const data = await apiRequest('/auth/resetpassword', 'POST', { email, token, newPassword });
        if (data.success) {
          return { success: true };
        }
      } catch (err) {
        console.warn('API resetPassword failed, using local fallback.');
      }
    }

    // Local Fallback
    const savedToken = localStorage.getItem(`recovery_${email}`);
    if (!savedToken || savedToken !== token) {
      return { success: false, message: 'Invalid or expired password reset token.' };
    }

    const hashed = await hashPassword(newPassword);

    setUsers(prev =>
      prev.map(u => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          return {
            ...u,
            passwordHash: hashed,
            isSetupCompleted: true,
            permanentUsername: u.permanentUsername || email.split('@')[0],
          };
        }
        return u;
      })
    );

    localStorage.removeItem(`recovery_${email}`);
    return { success: true };
  };

  // FORCE EXPIRE ACTIVE SESSION
  const forceSessionExpire = () => {
    const activeSession = localStorage.getItem('school_auth_session');
    if (activeSession) {
      const session = JSON.parse(activeSession);
      const expiredSession = {
        ...session,
        expiresAt: Date.now() - 1000
      };
      localStorage.setItem('school_auth_session', JSON.stringify(expiredSession));
      window.location.reload();
    }
  };

  const quickProfiles = users.map(u => ({
    id: u.id || u._id,
    name: u.name,
    role: u.role,
    email: u.email
  }));

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      users,
      quickProfiles,
      sessionExpiredAlert,
      isServerMode,
      login, 
      logout, 
      completeOnboarding,
      forgotPassword,
      resetPassword,
      forceSessionExpire
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
