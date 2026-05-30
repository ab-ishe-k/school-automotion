import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const QUICK_PROFILES = [
  {
    id: 'usr-principal',
    name: 'Dr. Adrian Vance',
    role: 'Principal',
    email: 'vance.principal@school.edu',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    description: 'Executive head oversight, escalations, system security auditing & school-wide statistics.'
  },
  {
    id: 'usr-teacher',
    name: 'Mr. Marcus Davis',
    role: 'Teacher',
    email: 'davis.math@school.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    description: 'Academic advisor, resolves student queries, manages subject appointments.'
  },
  {
    id: 'usr-student',
    name: 'Liam Chen',
    role: 'Student',
    email: 'liam.chen@school.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    description: 'Raised queries, booked principal/teacher appointments, logs peer infrastructure grievances.'
  },
  {
    id: 'usr-parent',
    name: 'Sarah Smith',
    role: 'Parent',
    email: 'sarah.smith@school.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    description: 'Monitors child’s query history, coordinates teacher consultations, submits transport feedback.'
  },
  {
    id: 'usr-admin',
    name: 'Mrs. Janet Finch',
    role: 'Admin Staff',
    email: 'finch.admin@school.edu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    description: 'System database editor, department routing workflows, operational resolutions.'
  },
  {
    id: 'usr-reception',
    name: 'Officer Alan',
    role: 'Reception / Office Staff',
    email: 'alan.frontdesk@school.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: 'Visitor logging, schedules appointments on behalf of walk-ins, logs immediate queries.'
  },
  {
    id: 'usr-vp',
    name: 'Ms. Clara Vance',
    role: 'Vice Principal',
    email: 'vance.vp@school.edu',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150',
    description: 'Directs transport routing, discipline issues, and processes teacher monthly salary approvals.'
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('school_auth_user');
    return user ? JSON.parse(user) : null;
  });

  const login = (roleName, customCredentials = null) => {
    let profile;
    if (customCredentials) {
      profile = {
        id: `usr-custom-${Date.now()}`,
        name: customCredentials.name || 'Anonymous User',
        role: roleName,
        email: customCredentials.email || `${roleName.toLowerCase().replace(' ', '')}@school.edu`,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        description: 'Custom self-registered account.'
      };
    } else {
      profile = QUICK_PROFILES.find(p => p.role === roleName);
    }

    if (profile) {
      setCurrentUser(profile);
      localStorage.setItem('school_auth_user', JSON.stringify(profile));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('school_auth_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, quickProfiles: QUICK_PROFILES }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
