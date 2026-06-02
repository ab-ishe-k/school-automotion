import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useAuth } from './AuthContext';
import { sanitize, nameToEmail, genId } from '../utils/helpers';

const DatabaseContext = createContext();

// Mock Initial Data if localStorage is empty (Local Fallbacks)
const INITIAL_APPOINTMENTS = [
  {
    id: 'APT-98271',
    userName: 'Liam Chen',
    userRole: 'Student',
    appointmentWith: 'Principal (Dr. Adrian Vance)',
    department: 'Principal',
    date: '2026-06-02',
    time: '10:00 AM',
    purpose: 'Discussing Academic Scholarship requirements and progress review.',
    status: 'APPROVED',
    calendarEventId: 'gcal_evt_98271a',
    resolutionNotes: 'Scholarship reviewed. Guidelines signed off.',
    createdAt: '2026-05-29T10:15:00Z'
  },
  {
    id: 'APT-10823',
    userName: 'Sarah Smith',
    userRole: 'Parent',
    appointmentWith: 'Mr. Marcus Davis (Math Teacher)',
    department: 'Teachers',
    date: '2026-06-03',
    time: '02:30 PM',
    purpose: 'Discussing mid-term exam performance and remedial support.',
    status: 'APPROVED',
    calendarEventId: 'gcal_evt_10823b',
    resolutionNotes: '',
    createdAt: '2026-05-30T11:20:00Z'
  },
  {
    id: 'APT-44290',
    userName: 'Emily Davis',
    userRole: 'Student',
    appointmentWith: 'Ms. Clara Thorne (Counselor)',
    department: 'Counselor',
    date: '2026-06-04',
    time: '11:30 AM',
    purpose: 'Anxiety management and career counseling session.',
    status: 'PENDING',
    calendarEventId: '',
    resolutionNotes: '',
    createdAt: '2026-05-30T16:45:00Z'
  }
];

const INITIAL_QUERIES = [
  {
    id: 'QRY-38910',
    raisedBy: 'Liam Chen',
    role: 'Student',
    category: 'Exams',
    subject: 'Math Midterm schedule conflict',
    description: 'The Math midterm clashes with my state level debating competition. Can I reschedule my exam date?',
    assignedTo: 'Mr. Marcus Davis (Math Teacher)',
    date: '2026-05-28T09:30:00Z',
    status: 'In Progress',
    resolution: '',
    closedDate: ''
  },
  {
    id: 'QRY-88291',
    raisedBy: 'Sarah Smith',
    role: 'Parent',
    category: 'Fee issues',
    subject: 'Double billing on transport fee',
    description: 'I noticed an extra charges of $150 on this month fee invoice for transportation. My son does not use the school bus.',
    assignedTo: 'Accounts department',
    date: '2026-05-29T14:22:00Z',
    status: 'Pending',
    resolution: '',
    closedDate: ''
  }
];

const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-78291',
    submittedBy: 'Sarah Smith',
    role: 'Parent',
    complaintType: 'Transport',
    description: 'Bus Route 12 is consistently arriving 25 minutes late at our stop, causing students to miss morning assembly.',
    assignedOfficer: 'Transport Supervisor (Mr. Greg)',
    date: '2026-05-29T07:45:00Z',
    status: 'In Progress',
    actionTaken: 'Spoke with Route 12 driver. Investigated traffic bottleneck at Main Avenue.',
    resolvedDate: '',
    isEscalated: false,
    internalNotes: 'Driver claims bridge construction is the cause. Considering alternative route.'
  },
  {
    id: 'CMP-29182',
    submittedBy: 'Liam Chen',
    role: 'Student',
    complaintType: 'Infrastructure',
    description: 'The science laboratory ceiling has a slow water leak near the electronics desk. Highly dangerous during practical classes.',
    assignedOfficer: 'Facilities Head (Mr. Thomas)',
    date: '2026-05-30T10:00:00Z',
    status: 'Pending',
    actionTaken: '',
    resolvedDate: '',
    isEscalated: false,
    internalNotes: ''
  }
];

const INITIAL_EMAILS = [
  {
    id: 'eml-1',
    to: 'liam.chen@school.edu',
    subject: 'Appointment Booked - PENDING approval - APT-98271',
    body: `Hi Liam Chen,\n\nYour appointment with Principal (Dr. Adrian Vance) has been booked successfully.\n\nBooking ID: APT-98271\nDate: 2026-06-02\nTime: 10:00 AM\nPurpose: Discussing Academic Scholarship requirements.\n\nStatus: PENDING PRINCIPAL APPROVAL.\n\nYou will receive a calendar invite once approved.`,
    sender: 'School Automation <no-reply@school.edu>',
    date: '2026-05-29T10:15:00Z',
    isRead: false
  },
  {
    id: 'eml-2',
    to: 'liam.chen@school.edu',
    subject: 'Appointment APPROVED & Google Calendar Invite - APT-98271',
    body: `Hi Liam Chen,\n\nWe are pleased to inform you that your appointment with Principal (Dr. Adrian Vance) has been APPROVED.\n\nBooking ID: APT-98271\nDate: 2026-06-02\nTime: 10:00 AM\nGoogle Calendar Event ID: gcal_evt_98271a\n\nA Google Calendar invitation has been automatically added to your calendar at liam.chen@school.edu. Please accept the invitation.`,
    sender: 'Google Calendar Sync <calendar-notification@school.edu>',
    date: '2026-05-29T11:30:00Z',
    isRead: false
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-001',
    timestamp: '2026-05-30T10:00:00Z',
    user: 'Liam Chen',
    role: 'Student',
    action: 'Logged in to Student Dashboard',
    details: 'Browser: Chrome, OS: Windows, IP: 192.168.1.45'
  }
];

const INITIAL_PAYMENTS = [
  {
    id: 'PAY-10029',
    userName: 'Sarah Smith',
    role: 'Parent',
    paymentType: 'Bus Fee',
    amount: '150',
    date: '2026-05-28',
    status: 'PAID',
    transactionId: 'tx_pay_10029a'
  },
  {
    id: 'PAY-30812',
    userName: 'Mr. Marcus Davis',
    role: 'Teacher',
    paymentType: 'Teacher Salary',
    amount: '4500',
    date: '2026-05-25',
    status: 'PAID',
    transactionId: 'tx_salary_30812b'
  }
];

const INITIAL_STUDENTS = [
  {
    id: 'STD-88201',
    name: 'Liam Chen',
    email: 'liam.chen@school.edu',
    class: 'Grade 11-A',
    rollNumber: '12',
    parentName: 'Sarah Smith',
    parentEmail: 'sarah.smith@school.edu',
    parentContact: '555-012-9988',
    admissionDate: '2026-06-01',
    monthlyTuitionFee: 2000,
    busFee: 500,
    monthlyExtraCurricularFee: 150,
    totalMonthlyFee: 2650,
    paidAmount: 0,
    pendingAmount: 2650,
    pendingMonths: 1,
    paymentDate: '',
    paymentStatus: 'Pending',
    feeStatus: 'Outstanding',
    remindersActive: true
  },
  {
    id: 'STD-10928',
    name: 'Emily Davis',
    email: 'emily.davis@school.edu',
    class: 'Grade 10-B',
    rollNumber: '05',
    parentName: 'Mr. John Davis',
    parentEmail: 'john.davis@gmail.com',
    parentContact: '555-019-9021',
    admissionDate: '2026-05-15',
    monthlyTuitionFee: 2000,
    busFee: 0,
    monthlyExtraCurricularFee: 150,
    totalMonthlyFee: 2150,
    paidAmount: 2150,
    pendingAmount: 0,
    pendingMonths: 0,
    paymentDate: '2026-05-28',
    paymentStatus: 'Paid',
    feeStatus: 'Paid',
    remindersActive: false
  }
];

const INITIAL_STAFF = [
  {
    id: 'STF-20192',
    name: 'Mr. Marcus Davis',
    role: 'Teacher',
    email: 'davis.math@school.edu',
    phone: '555-018-4431',
    designation: 'Mathematics Instructor',
    department: 'Math Dept',
    classTeacherOf: 'Grade 11-A',
    joiningDate: '2021-08-15',
    monthlySalary: 4500,
    paidSalary: 0,
    remainingSalary: 4500,
    paymentStatus: 'Pending'
  },
  {
    id: 'STF-90281',
    name: 'Dr. Adrian Vance',
    role: 'Principal',
    email: 'vance.principal@school.edu',
    phone: '555-019-1002',
    designation: 'Executive Principal',
    department: 'Principal Office',
    joiningDate: '2018-05-10',
    monthlySalary: 7500,
    paidSalary: 0,
    remainingSalary: 7500,
    paymentStatus: 'Pending'
  },
  {
    id: 'STF-10291',
    name: 'Ms. Clara Vance',
    role: 'Vice Principal',
    email: 'vance.vp@school.edu',
    phone: '555-012-3841',
    designation: 'Academic Vice Principal',
    department: 'VP Office',
    joiningDate: '2019-10-01',
    monthlySalary: 6000,
    paidSalary: 0,
    remainingSalary: 6000,
    paymentStatus: 'Pending'
  }
];

const INITIAL_LEAVES = [
  {
    id: 'LV-78291',
    applicantName: 'Liam Chen',
    applicantRole: 'Student',
    applicantClass: 'Grade 11-A',
    startDate: '2026-06-05',
    endDate: '2026-06-06',
    leaveType: 'Sick Leave',
    reason: 'Severe dental surgery and recovery.',
    assignedTo: 'Mr. Marcus Davis',
    status: 'Approved',
    remarks: 'Get well soon, Liam. Stay hydrated.',
    createdAt: '2026-06-01T10:00:00Z'
  }
];

const getLocalStorageItem = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.warn(`Error parsing localStorage key "${key}", falling back to initial data:`, e);
    return fallback;
  }
};

export const DatabaseProvider = ({ children }) => {
  const { currentUser, isServerMode } = useAuth();

  // Local state initialized with fallback data safely
  const [appointments, setAppointments] = useState(() => getLocalStorageItem('school_appointments', INITIAL_APPOINTMENTS));
  const [queries, setQueries] = useState(() => getLocalStorageItem('school_queries', INITIAL_QUERIES));
  const [complaints, setComplaints] = useState(() => getLocalStorageItem('school_complaints', INITIAL_COMPLAINTS));
  const [virtualEmails, setVirtualEmails] = useState(() => getLocalStorageItem('school_emails', INITIAL_EMAILS));
  const [auditLogs, setAuditLogs] = useState(() => getLocalStorageItem('school_audit_logs', INITIAL_AUDIT_LOGS));
  const [payments, setPayments] = useState(() => getLocalStorageItem('school_payments', INITIAL_PAYMENTS));
  const [students, setStudents] = useState(() => getLocalStorageItem('school_students', INITIAL_STUDENTS));
  const [staff, setStaff] = useState(() => getLocalStorageItem('school_staff', INITIAL_STAFF));
  const [leaves, setLeaves] = useState(() => getLocalStorageItem('school_leaves', INITIAL_LEAVES));
  const [notifications, setNotifications] = useState([]);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(() => {
    return localStorage.getItem('school_google_sheets_url') || '';
  });
  const [apiLogs, setApiLogs] = useState([]);

  // Local state persistence
  useEffect(() => {
    localStorage.setItem('school_appointments', JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem('school_queries', JSON.stringify(queries));
  }, [queries]);
  useEffect(() => {
    localStorage.setItem('school_complaints', JSON.stringify(complaints));
  }, [complaints]);
  useEffect(() => {
    localStorage.setItem('school_emails', JSON.stringify(virtualEmails));
  }, [virtualEmails]);
  useEffect(() => {
    localStorage.setItem('school_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('school_payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem('school_students', JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem('school_staff', JSON.stringify(staff));
  }, [staff]);
  useEffect(() => {
    localStorage.setItem('school_leaves', JSON.stringify(leaves));
  }, [leaves]);

  // Load all records when user logs in (If Server mode is active)
  const loadAllData = async () => {
    if (!currentUser || !isServerMode) return;
    try {
      const res = await apiRequest('/dashboard/bundle', 'GET');
      if (res.success) {
        setAppointments(res.data.appointments || []);
        setQueries(res.data.queries || []);
        setComplaints(res.data.complaints || []);
        setVirtualEmails(res.data.virtualEmails || []);
        setAuditLogs(res.data.auditLogs || []);
        setPayments(res.data.payments || []);
        setStudents(res.data.students || []);
        setStaff(res.data.staff || []);
        setLeaves(res.data.leaves || []);
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.warn('Failed to load database bundle from backend, staying in local storage simulation mode.', err);
    }
  };

  useEffect(() => {
    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isServerMode]);

  // General helpers
  const addAuditLogLocal = (user, role, action, details = '') => {
    const newLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const pushNotificationLocal = (message, type = 'info') => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const sendEmailLocal = (to, subject, body, sender = 'School Automation <no-reply@school.edu>') => {
    const newEmail = {
      id: `eml-${Math.floor(100000 + Math.random() * 900000)}`,
      to,
      subject,
      body,
      sender,
      date: new Date().toISOString(),
      isRead: false
    };
    setVirtualEmails(prev => [newEmail, ...prev]);
  };

  const getAssignedOfficer = (category, type) => {
    if (type === 'query') {
      switch (category) {
        case 'Academics': return 'Mr. Marcus Davis (Math Teacher)';
        case 'Fee issues': return 'Mrs. Janet Finch (Accounts Manager)';
        case 'Attendance': return 'Registrar (Office Staff)';
        case 'Exams': return 'Exam Cell Head (Mr. Peter)';
        case 'Timetable': return 'Admin Coordinator (Ms. Lee)';
        case 'Certificates': return 'Office Desk (Mr. Alan)';
        case 'Transport': return 'Transport Supervisor (Mr. Greg)';
        case 'Technical support': return 'IT Helpdesk (Alex)';
        default: return 'Office Desk (Mr. Alan)';
      }
    } else {
      switch (category) {
        case 'Teacher issue': return 'Principal (Dr. Adrian Vance)';
        case 'Student behavior': return 'Dean of Discipline (Mr. Miller)';
        case 'Infrastructure': return 'Facilities Head (Mr. Thomas)';
        case 'Administration': return 'Vice Principal (Ms. Clara Vance)';
        case 'Transport': return 'Transport Supervisor (Mr. Greg)';
        case 'Harassment / disciplinary issue': return 'Principal (Dr. Adrian Vance)';
        default: return 'Vice Principal (Ms. Clara Vance)';
      }
    }
  };

  // 1. APPOINTMENTS
  const bookAppointment = async (booking) => {
    if (isServerMode) {
      try {
        const res = await apiRequest('/dashboard/appointment', 'POST', booking);
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    const bookingId = genId('APT');
    const isPrincipal = booking.department === 'Principal';
    const newBooking = {
      id: bookingId,
      userName: currentUser.name,
      userRole: currentUser.role,
      appointmentWith: booking.appointmentWith,
      department: booking.department,
      date: booking.date,
      time: booking.time,
      purpose: sanitize(booking.purpose),
      status: isPrincipal ? 'PENDING' : 'APPROVED',
      calendarEventId: isPrincipal ? '' : `gcal_evt_${Math.floor(100000 + Math.random() * 900000)}`,
      resolutionNotes: '',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newBooking, ...prev]);
    addAuditLogLocal(currentUser.name, currentUser.role, `Booked Appointment with ${booking.appointmentWith} (${bookingId})`);
    sendEmailLocal(currentUser.email, `Appointment Booked - ${newBooking.status} - ID: ${bookingId}`, `Your appointment with ${booking.appointmentWith} is logged.`);
    pushNotificationLocal(`New appointment booking logged: ${bookingId}`, 'success');
  };

  const approveAppointment = async (id, resolutionNotes) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/appointment/${id}`, 'PATCH', { action: 'approve', resolutionNotes });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    const calendarEvtId = `gcal_evt_${Math.floor(100000 + Math.random() * 900000)}`;
    let clientName = '';
    let appointmentWith = '';

    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === id) {
          clientName = apt.userName;
          appointmentWith = apt.appointmentWith;
          return { ...apt, status: 'APPROVED', calendarEventId: calendarEvtId, resolutionNotes: resolutionNotes || apt.resolutionNotes };
        }
        return apt;
      })
    );

    addAuditLogLocal(currentUser.name, currentUser.role, `Approved Appointment ${id}`);
    sendEmailLocal(nameToEmail(clientName), `Appointment APPROVED & Calendar Event Added - ID: ${id}`, `Approved consultation with ${appointmentWith}.`);
    pushNotificationLocal(`Appointment ${id} approved.`, 'info');
  };

  const rejectAppointment = async (id, remarks) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/appointment/${id}`, 'PATCH', { action: 'reject', resolutionNotes: remarks });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    let clientName = '';
    let appointmentWith = '';

    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === id) {
          clientName = apt.userName;
          appointmentWith = apt.appointmentWith;
          return { ...apt, status: 'REJECTED', resolutionNotes: remarks || 'Rejected by authority' };
        }
        return apt;
      })
    );

    addAuditLogLocal(currentUser.name, currentUser.role, `Rejected Appointment ${id}`);
    sendEmailLocal(nameToEmail(clientName), `Appointment REJECTED - ID: ${id}`, `Your appointment with ${appointmentWith} was rejected.`);
    pushNotificationLocal(`Appointment ${id} rejected.`, 'info');
  };

  const rescheduleAppointment = async (id, newDate, newTime) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/appointment/${id}`, 'PATCH', { action: 'reschedule', newDate, newTime });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === id) {
          return { ...apt, date: newDate, time: newTime, status: 'PENDING', calendarEventId: '' };
        }
        return apt;
      })
    );
    addAuditLogLocal(currentUser.name, currentUser.role, `Rescheduled Appointment ${id}`);
    pushNotificationLocal(`Rescheduled Appointment ${id}`, 'info');
  };

  const cancelAppointment = async (id) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/appointment/${id}`, 'PATCH', { action: 'cancel' });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === id) {
          return { ...apt, status: 'REJECTED', resolutionNotes: 'Cancelled by applicant' };
        }
        return apt;
      })
    );
    addAuditLogLocal(currentUser.name, currentUser.role, `Cancelled Appointment ${id}`);
    pushNotificationLocal(`Cancelled Appointment ${id}`, 'info');
  };

  // 2. QUERIES
  const raiseQuery = async (query) => {
    const assignedTo = getAssignedOfficer(query.category, 'query');
    if (isServerMode) {
      try {
        const res = await apiRequest('/dashboard/query', 'POST', { ...query, assignedTo });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    const queryId = genId('QRY');
    const newQuery = {
      id: queryId,
      raisedBy: currentUser.name,
      role: currentUser.role,
      category: query.category,
      subject: sanitize(query.subject),
      description: sanitize(query.description),
      assignedTo,
      date: new Date().toISOString(),
      status: 'Pending',
      resolution: '',
      closedDate: ''
    };

    setQueries(prev => [newQuery, ...prev]);
    addAuditLogLocal(currentUser.name, currentUser.role, `Raised Query Ticket ${queryId}`);
    pushNotificationLocal(`Query raised successfully: ${queryId}`, 'success');
  };

  const updateQueryStatus = async (id, newStatus, resolution) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/query/${id}`, 'PATCH', { status: newStatus, resolution });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    setQueries(prev =>
      prev.map(q => {
        if (q.id === id) {
          return {
            ...q,
            status: newStatus,
            resolution: resolution || q.resolution,
            closedDate: newStatus === 'Resolved' ? new Date().toISOString() : q.closedDate
          };
        }
        return q;
      })
    );
    addAuditLogLocal(currentUser.name, currentUser.role, `Updated Query status ${id}`);
    pushNotificationLocal(`Query ${id} status set to ${newStatus}.`, 'info');
  };

  // 3. COMPLAINTS
  const submitComplaint = async (complaint) => {
    const assignedOfficer = getAssignedOfficer(complaint.complaintType, 'complaint');
    if (isServerMode) {
      try {
        const res = await apiRequest('/dashboard/complaint', 'POST', { ...complaint, assignedOfficer });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    const complaintId = genId('CMP');
    const newComplaint = {
      id: complaintId,
      submittedBy: currentUser.name,
      role: currentUser.role,
      complaintType: complaint.complaintType,
      description: sanitize(complaint.description),
      assignedOfficer,
      date: new Date().toISOString(),
      status: 'Pending',
      actionTaken: '',
      resolvedDate: '',
      isEscalated: false,
      internalNotes: ''
    };

    setComplaints(prev => [newComplaint, ...prev]);
    addAuditLogLocal(currentUser.name, currentUser.role, `Lodged Grievance Ticket ${complaintId}`);
    pushNotificationLocal(`Complaint logged successfully: ${complaintId}`, 'warning');
  };

  const updateComplaintStatus = async (id, status, actionTaken) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/complaint/${id}`, 'PATCH', { status, actionTaken });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: status || c.status,
            actionTaken: actionTaken || c.actionTaken,
            resolvedDate: status === 'Resolved' ? new Date().toISOString() : c.resolvedDate
          };
        }
        return c;
      })
    );
    addAuditLogLocal(currentUser.name, currentUser.role, `Updated Complaint Status ${id}`);
    pushNotificationLocal(`Complaint ${id} status updated to ${status}.`, 'info');
  };

  const escalateComplaint = async (id, notes) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/complaint/${id}`, 'PATCH', { isEscalated: true, internalNotes: notes });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return { ...c, isEscalated: true, internalNotes: notes || c.internalNotes };
        }
        return c;
      })
    );
    addAuditLogLocal(currentUser.name, currentUser.role, `Escalated Complaint ${id} to Vice Principal`);
    pushNotificationLocal(`Complaint ${id} escalated to Principal office.`, 'danger');
  };

  // 4. LEAVES
  const applyLeave = async (leave) => {
    if (isServerMode) {
      try {
        const classTeacher = 'Mr. Marcus Davis';
        const res = await apiRequest('/dashboard/leave', 'POST', { ...leave, assignedTo: classTeacher });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    const leaveId = genId('LV');
    const newLeave = {
      id: leaveId,
      applicantName: currentUser.name,
      applicantRole: currentUser.role,
      applicantClass: currentUser.linkedStudentName || 'Faculty',
      startDate: leave.startDate,
      endDate: leave.endDate,
      leaveType: leave.leaveType,
      reason: sanitize(leave.reason),
      assignedTo: 'Mr. Marcus Davis',
      status: 'Pending',
      remarks: '',
      createdAt: new Date().toISOString()
    };

    setLeaves(prev => [newLeave, ...prev]);
    addAuditLogLocal(currentUser.name, currentUser.role, `Submitted Leave Request ${leaveId}`);
    pushNotificationLocal(`Leave request logged: ${leaveId}`, 'info');
  };

  const updateLeaveStatus = async (id, status, remarks) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/leave/${id}`, 'PATCH', { status, remarks });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    setLeaves(prev =>
      prev.map(lv => {
        if (lv.id === id) {
          return { ...lv, status, remarks: remarks || lv.remarks };
        }
        return lv;
      })
    );
    addAuditLogLocal(currentUser.name, currentUser.role, `Reviewed Leave Request ${id}`);
    pushNotificationLocal(`Leave request ${id} ${status.toLowerCase()}.`, 'success');
  };

  // 5. FINANCES
  const payFee = async (studentId, amount, paymentType) => {
    if (isServerMode) {
      try {
        const res = await apiRequest('/dashboard/pay/fee', 'POST', { studentId, amount, paymentType });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    const payAmt = Number(amount);
    const txId = `tx_pay_${Math.floor(10000 + Math.random() * 90000)}a`;

    setPayments(prev => [
      {
        id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
        userName: currentUser.name,
        role: 'Parent',
        paymentType,
        amount: payAmt.toString(),
        date: new Date().toISOString().split('T')[0],
        status: 'PAID',
        transactionId: txId
      },
      ...prev
    ]);

    setStudents(prev =>
      prev.map(std => {
        if (std.id === studentId) {
          const newPending = Math.max(0, std.pendingAmount - payAmt);
          return {
            ...std,
            paidAmount: std.paidAmount + payAmt,
            pendingAmount: newPending,
            paymentStatus: newPending === 0 ? 'Paid' : 'Pending',
            feeStatus: newPending === 0 ? 'Paid' : 'Outstanding',
            paymentDate: new Date().toISOString().split('T')[0],
            remindersActive: newPending > 0
          };
        }
        return std;
      })
    );

    addAuditLogLocal(currentUser.name, currentUser.role, `Paid student fee dues $${payAmt}`);
    pushNotificationLocal(`Payment of $${payAmt} recorded.`, 'success');
  };

  const payTeacherSalary = async (teacherId, amount) => {
    if (isServerMode) {
      try {
        const res = await apiRequest('/dashboard/pay/salary', 'POST', { teacherId, amount });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    const payAmt = Number(amount);
    const txId = `tx_salary_${Math.floor(10000 + Math.random() * 90000)}b`;
    let facultyName = '';

    setPayments(prev => [
      {
        id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
        userName: staff.find(s => s.id === teacherId)?.name || 'Faculty',
        role: 'Teacher',
        paymentType: 'Teacher Salary',
        amount: payAmt.toString(),
        date: new Date().toISOString().split('T')[0],
        status: 'PAID',
        transactionId: txId
      },
      ...prev
    ]);

    setStaff(prev =>
      prev.map(tch => {
        if (tch.id === teacherId) {
          facultyName = tch.name;
          const newRem = Math.max(0, tch.remainingSalary - payAmt);
          return {
            ...tch,
            paidSalary: tch.paidSalary + payAmt,
            remainingSalary: newRem,
            paymentStatus: newRem === 0 ? 'Paid' : 'Pending',
            paymentDate: new Date().toISOString().split('T')[0]
          };
        }
        return tch;
      })
    );

    addAuditLogLocal(currentUser.name, currentUser.role, `Disbursed Salary of $${payAmt} to ${facultyName}`);
    pushNotificationLocal(`Disbursed $${payAmt} to faculty.`, 'success');
  };

  // 6. ENROLLMENTS
  const registerStudent = async (student) => {
    if (isServerMode) {
      try {
        const res = await apiRequest('/dashboard/student', 'POST', {
          name: student.name,
          email: student.email,
          className: student.class,
          rollNumber: student.rollNumber,
          parentName: student.parentName,
          parentEmail: student.parentEmail,
          parentContact: student.parentContact,
          monthlyTuitionFee: student.monthlyTuitionFee,
          busFee: student.busFee,
          monthlyExtraCurricularFee: student.monthlyExtraCurricularFee
        });
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    const studentId = genId('STD');
    const tuition = Number(student.monthlyTuitionFee) || 0;
    const bus = Number(student.busFee) || 0;
    const extra = Number(student.monthlyExtraCurricularFee) || 150;
    const total = tuition + bus + extra;

    const newStd = {
      id: studentId,
      name: student.name,
      email: student.email,
      class: student.class,
      rollNumber: student.rollNumber,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentContact: student.parentContact,
      admissionDate: new Date().toISOString().split('T')[0],
      monthlyTuitionFee: tuition,
      busFee: bus,
      monthlyExtraCurricularFee: extra,
      totalMonthlyFee: total,
      paidAmount: 0,
      pendingAmount: total,
      pendingMonths: 1,
      paymentDate: '',
      paymentStatus: 'Pending',
      feeStatus: 'Outstanding',
      remindersActive: true
    };

    setStudents(prev => [...prev, newStd]);
    addAuditLogLocal(currentUser.name, currentUser.role, `Admitted Student Roster: ${student.name}`);
    pushNotificationLocal(`Student registered: ${student.name}`, 'success');
  };

  const registerTeacher = async (teacher) => {
    if (isServerMode) {
      try {
        const res = await apiRequest('/dashboard/teacher', 'POST', teacher);
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    const teacherId = genId('STF');
    const sal = Number(teacher.monthlySalary) || 4500;
    const newTch = {
      id: teacherId,
      name: teacher.name,
      role: 'Teacher',
      email: teacher.email,
      phone: teacher.phone,
      designation: teacher.designation,
      department: teacher.department,
      classTeacherOf: teacher.classTeacherOf || '',
      joiningDate: new Date().toISOString().split('T')[0],
      monthlySalary: sal,
      paidSalary: 0,
      remainingSalary: sal,
      paymentStatus: 'Pending'
    };

    setStaff(prev => [...prev, newTch]);
    addAuditLogLocal(currentUser.name, currentUser.role, `Registered Faculty Member: ${teacher.name}`);
    pushNotificationLocal(`Faculty registered: ${teacher.name}`, 'success');
  };

  // 7. SHEET GENERAL CRUD
  const updateSheetRow = async (sheetName, id, updates) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/sheet/${sheetName}/${id}`, 'PUT', updates);
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    if (sheetName === 'students') {
      setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    } else if (sheetName === 'staff') {
      setStaff(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    } else if (sheetName === 'appointments') {
      setAppointments(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    } else if (sheetName === 'queries') {
      setQueries(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    } else if (sheetName === 'complaints') {
      setComplaints(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    } else if (sheetName === 'leaves') {
      setLeaves(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    }
    addAuditLogLocal(currentUser.name, currentUser.role, `Modified Row in ${sheetName} for ${id}`);
  };

  const deleteSheetRow = async (sheetName, id) => {
    if (isServerMode) {
      try {
        const res = await apiRequest(`/dashboard/sheet/${sheetName}/${id}`, 'DELETE');
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }

    // Local Logic
    if (sheetName === 'students') {
      setStudents(prev => prev.filter(s => s.id !== id));
    } else if (sheetName === 'staff') {
      setStaff(prev => prev.filter(s => s.id !== id));
    } else if (sheetName === 'appointments') {
      setAppointments(prev => prev.filter(s => s.id !== id));
    } else if (sheetName === 'queries') {
      setQueries(prev => prev.filter(s => s.id !== id));
    } else if (sheetName === 'complaints') {
      setComplaints(prev => prev.filter(s => s.id !== id));
    } else if (sheetName === 'leaves') {
      setLeaves(prev => prev.filter(s => s.id !== id));
    }
    addAuditLogLocal(currentUser.name, currentUser.role, `Purged Record ID: ${id} from ${sheetName}`);
    pushNotificationLocal(`Purged record from sheet: ${sheetName}`, 'warning');
  };

  const markAllNotificationsRead = async () => {
    if (isServerMode) {
      try {
        const res = await apiRequest('/dashboard/notifications/clear', 'POST');
        if (res.success) { return loadAllData(); }
      } catch (err) { console.warn('API Err, falling back'); }
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const runDuesReminderLoop = async (currentUser) => {
    let sentCount = 0;
    if (isServerMode) {
      try {
        for (const std of students) {
          if (std.remindersActive && std.pendingAmount > 0) {
            sentCount++;
            await apiRequest('/dashboard/email/send', 'POST', {
              to: std.parentEmail || 'parent@school.edu',
              subject: `⚠️ ACTION REQUIRED: Outstanding Student Fees Reminder - ${std.name}`,
              body: `Dear ${std.parentName},\n\nThis is an automated reminder regarding outstanding student accounts for ${std.name} (${std.class}).`
            });
          }
        }
        await loadAllData();
        return;
      } catch (err) {
        console.warn('API Err, falling back');
      }
    }

    // Local Logic
    students.forEach(std => {
      if (std.remindersActive && std.pendingAmount > 0) {
        sentCount++;
        sendEmailLocal(
          std.parentEmail || 'parent@school.edu',
          `⚠️ ACTION REQUIRED: Outstanding Student Fees Reminder - ${std.name}`,
          `Dear ${std.parentName},\n\nOutstanding fee reminder for ${std.name}. Dues: $${std.pendingAmount}.`
        );
      }
    });
    addAuditLogLocal(currentUser.name, currentUser.role, `Executed 7-Day Fee Reminder Sweep`);
    pushNotificationLocal(`Completed 7-day reminder sweep. ${sentCount} alerts sent to parents.`, 'success');
  };

  const resetAllData = () => {
    if (window.confirm("Restore default simulated sheets?")) {
      setAppointments(INITIAL_APPOINTMENTS);
      setQueries(INITIAL_QUERIES);
      setComplaints(INITIAL_COMPLAINTS);
      setVirtualEmails(INITIAL_EMAILS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setPayments(INITIAL_PAYMENTS);
      setStudents(INITIAL_STUDENTS);
      setStaff(INITIAL_STAFF);
      setLeaves(INITIAL_LEAVES);
      setNotifications([]);
      setGoogleSheetsUrl('');
      setApiLogs([]);
      pushNotificationLocal("Simulated sheets reset completed.", 'success');
    }
  };

  const pushNotification = (message, type = 'info') => {
    pushNotificationLocal(message, type);
  };

  return (
    <DatabaseContext.Provider
      value={{
        appointments,
        queries,
        complaints,
        virtualEmails,
        auditLogs,
        payments,
        students,
        staff,
        notifications,
        googleSheetsUrl,
        setGoogleSheetsUrl,
        apiLogs,
        markAllNotificationsRead,
        runDuesReminderLoop,
        bookAppointment,
        approveAppointment,
        rejectAppointment,
        rescheduleAppointment,
        cancelAppointment,
        raiseQuery,
        updateQueryStatus,
        submitComplaint,
        updateComplaintStatus,
        escalateComplaint,
        payFee,
        payTeacherSalary,
        registerStudent,
        registerTeacher,
        updateSheetRow,
        deleteSheetRow,
        resetAllData,
        pushNotification,
        leaves,
        applyLeave,
        updateLeaveStatus
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
