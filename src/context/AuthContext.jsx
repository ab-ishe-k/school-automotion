import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Helper to hash password using browser-native SHA-256 (Web Crypto API)
export const hashPassword = async (password) => {
  if (!password) return '';
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Initial roster of temporary credentials issued by the school admin
export const INITIAL_USERS = [
  {
    id: 'usr-principal-90281',
    name: 'Dr. Adrian Vance',
    role: 'Principal',
    email: 'vance.principal@school.edu',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    tempId: 'TEMP-PRN-90281',
    tempPassword: 'Principal2026!',
    permanentUsername: '',
    passwordHash: '',
    isSetupCompleted: false,
    description: 'Executive principal of Beacon High School. Manages calendars, escalations, and audits.'
  },
  {
    id: 'usr-teacher-20192',
    name: 'Mr. Marcus Davis',
    role: 'Teacher',
    email: 'davis.math@school.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    tempId: 'TEMP-TCH-20192',
    tempPassword: 'MathDavis2026!',
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
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    tempId: 'TEMP-STD-88201',
    tempPassword: 'LiamChen2026!',
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
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    tempId: 'TEMP-PAR-30821',
    tempPassword: 'SarahSmith2026!',
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
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    tempId: 'TEMP-ADM-10822',
    tempPassword: 'AdminFinch2026!',
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
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    tempId: 'TEMP-REC-00192',
    tempPassword: 'AlanFront2026!',
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
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150',
    tempId: 'TEMP-VPS-10291',
    tempPassword: 'ClaraVp2026!',
    permanentUsername: '',
    passwordHash: '',
    isSetupCompleted: false,
    description: 'Vice Principal. Oversees disciplinary routes, transport alerts, and staff payroll.'
  }
];

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const data = localStorage.getItem('school_users');
    return data ? JSON.parse(data) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [sessionExpiredAlert, setSessionExpiredAlert] = useState(false);

  // Sync users database
  useEffect(() => {
    localStorage.setItem('school_users', JSON.stringify(users));
  }, [users]);

  // Session expiry sweep on load/refresh
  useEffect(() => {
    const activeSession = localStorage.getItem('school_auth_session');
    if (activeSession) {
      try {
        const session = JSON.parse(activeSession);
        if (session.expiresAt < Date.now()) {
          // Session has expired!
          logout();
          setSessionExpiredAlert(true);
        } else {
          // Session is valid, restore session and refresh expiration (+2 hours)
          setCurrentUser(session.user);
          const updatedSession = {
            ...session,
            expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
          };
          localStorage.setItem('school_auth_session', JSON.stringify(updatedSession));
        }
      } catch (err) {
        logout();
      }
    }
  }, []);

  // 1. SECURE LOGIN ROUTE
  const login = async (usernameOrId, password) => {
    setSessionExpiredAlert(false);
    const hashed = await hashPassword(password);
    
    // Find matching profile
    const foundUser = users.find(u => {
      // Case A: Setup not completed, verify temporary ID and raw password
      if (!u.isSetupCompleted) {
        return u.tempId === usernameOrId && u.tempPassword === password;
      }
      // Case B: Setup completed, verify permanent username and password hash
      return u.permanentUsername.toLowerCase() === usernameOrId.toLowerCase() && u.passwordHash === hashed;
    });

    if (foundUser) {
      setCurrentUser(foundUser);
      // Establish active session (expires in 2 hours)
      const session = {
        user: foundUser,
        loginTime: Date.now(),
        expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
      };
      localStorage.setItem('school_auth_session', JSON.stringify(session));
      return { success: true, isSetupCompleted: foundUser.isSetupCompleted, user: foundUser };
    }
    
    return { success: false, message: 'Invalid ID/Username or Password. Please double check credentials.' };
  };

  // 2. LOGOUT ROUTE
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('school_auth_session');
  };

  // 3. COMPLETE ACCOUNT ONBOARDING
  const completeOnboarding = async (userId, permanentName, password) => {
    // A. Check permanent Username uniqueness
    const usernameTaken = users.some(u => 
      u.permanentUsername.toLowerCase() === permanentName.toLowerCase() ||
      u.tempId?.toLowerCase() === permanentName.toLowerCase()
    );

    if (usernameTaken) {
      return { success: false, message: `Username "${permanentName}" is already taken. Please choose another.` };
    }

    const hashed = await hashPassword(password);
    let updatedProfile = null;

    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          updatedProfile = {
            ...u,
            permanentUsername: permanentName,
            passwordHash: hashed,
            isSetupCompleted: true,
            tempId: '', // nullify temporary ID
            tempPassword: '' // nullify temporary password
          };
          return updatedProfile;
        }
        return u;
      })
    );

    // Refresh active session with completed profile
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

  // 4. FORGOT PASSWORD LOOP (Integrated with virtual webmail)
  const forgotPassword = (email) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Email address not registered in school records.' };
    }

    // Generate simulated recovery token
    const recoveryToken = `rst_tok_${Math.floor(100000 + Math.random() * 900000)}`;
    localStorage.setItem(`recovery_${email}`, recoveryToken);

    // Append reset instruction directly to virtual Gmail logger (school_emails)
    const rawEmails = localStorage.getItem('school_emails');
    const emailList = rawEmails ? JSON.parse(rawEmails) : [];
    
    const recoveryEmail = {
      id: `eml-${Math.floor(100000 + Math.random() * 900000)}`,
      to: email,
      subject: '🔒 Beacon Security Desk: Password Reset Link',
      body: `Dear ${user.name},\n\nWe received a request to securely reset the password for your Beacon ERP account.\n\nPlease click the link below to overwrite your credentials and create a new secure password:\n\nhttp://localhost:5173/reset-password?token=${recoveryToken}&email=${email}\n\nThis token is valid for 1 hour. If you did not request this, please notify the IT Administration office immediately.\n\nWarm regards,\nIT Security Desk\nBeacon High School`,
      sender: 'IT Security Desk <security@beacon.edu>',
      date: new Date().toISOString(),
      isRead: false
    };

    emailList.unshift(recoveryEmail);
    localStorage.setItem('school_emails', JSON.stringify(emailList));

    return { success: true, message: 'Password recovery instructions have been successfully dispatched to your inbox!' };
  };

  // 5. SECURE RESET PASSWORD OVERWRITE
  const resetPassword = async (email, token, newPassword) => {
    const savedToken = localStorage.getItem(`recovery_${email}`);
    if (!savedToken || savedToken !== token) {
      return { success: false, message: 'Invalid or expired password reset authorization token.' };
    }

    const hashed = await hashPassword(newPassword);

    setUsers(prev =>
      prev.map(u => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          return {
            ...u,
            passwordHash: hashed,
            isSetupCompleted: true // Ensure setup is marked completed if resetting
          };
        }
        return u;
      })
    );

    localStorage.removeItem(`recovery_${email}`);
    return { success: true };
  };

  // 6. FORCE EXPIRE ACTIVE SESSION FOR TESTING
  const forceSessionExpire = () => {
    const activeSession = localStorage.getItem('school_auth_session');
    if (activeSession) {
      const session = JSON.parse(activeSession);
      const expiredSession = {
        ...session,
        expiresAt: Date.now() - 1000 // force set to 1 second ago
      };
      localStorage.setItem('school_auth_session', JSON.stringify(expiredSession));
      // Reload page to trigger active sweep checker
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      users,
      sessionExpiredAlert,
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
