import React, { createContext, useContext, useState, useEffect } from 'react';
import { sanitize, nameToEmail, genId } from '../utils/helpers';

const DatabaseContext = createContext();

// Mock Initial Data if localStorage is empty
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
  },
  {
    id: 'APT-77291',
    userName: 'Rajesh Kumar',
    userRole: 'Parent',
    appointmentWith: 'Mrs. Janet Finch (Accounts Manager)',
    department: 'Accounts department',
    date: '2026-06-02',
    time: '01:00 PM',
    purpose: 'Inquiry regarding quarterly fee installment options.',
    status: 'APPROVED',
    calendarEventId: 'gcal_evt_77291c',
    resolutionNotes: '',
    createdAt: '2026-05-30T09:00:00Z'
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
  },
  {
    id: 'QRY-10822',
    raisedBy: 'Emily Davis',
    role: 'Student',
    category: 'Timetable',
    subject: 'Elective course overlap',
    description: 'Psychology elective and Advanced Physics overlap on Thursday 4th period.',
    assignedTo: 'Admin Staff',
    date: '2026-05-27T08:15:00Z',
    status: 'Resolved',
    resolution: 'Advanced Physics cohort B shifted to Wednesday 3rd period. Timetables updated.',
    closedDate: '2026-05-28T16:00:00Z'
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
  },
  {
    id: 'CMP-00192',
    submittedBy: 'Emily Davis',
    role: 'Student',
    complaintType: 'Student behavior',
    description: 'Persistent loud shouting and pushing in the library corridor during study hall hours by seniors.',
    assignedOfficer: 'Vice Principal (Ms. Clara Vance)',
    date: '2026-05-26T11:00:00Z',
    status: 'Resolved',
    actionTaken: 'Stationed hall monitor near the library. Seniors warned about disciplinary consequences.',
    resolvedDate: '2026-05-28T14:00:00Z',
    isEscalated: false,
    internalNotes: 'Monitor reports hallway is quiet now.'
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
  },
  {
    id: 'LOG-002',
    timestamp: '2026-05-30T11:20:00Z',
    user: 'Sarah Smith',
    role: 'Parent',
    action: 'Booked Appointment with Math Teacher (APT-10823)',
    details: 'Added rows to Appointments Google Sheet, queued confirmation email.'
  }
];

// Accounting, Recruits and enrollment sheets
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
    feeStatus: 'Outstanding', // backward compatibility
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
  },
  {
    id: 'STD-10101',
    name: 'Baby Aarav',
    email: 'aarav.nry@school.edu',
    class: 'Nursery',
    rollNumber: '01',
    parentName: 'Mrs. Priya Sharma',
    parentEmail: 'priya.sharma@gmail.com',
    parentContact: '555-010-3344',
    admissionDate: '2026-06-01',
    monthlyTuitionFee: 1200,
    busFee: 300,
    monthlyExtraCurricularFee: 100,
    totalMonthlyFee: 1600,
    paidAmount: 1600,
    pendingAmount: 0,
    pendingMonths: 0,
    paymentDate: '2026-06-01',
    paymentStatus: 'Paid',
    feeStatus: 'Paid',
    remindersActive: false
  },
  {
    id: 'STD-20202',
    name: 'Diya Sharma',
    email: 'diya.grade5@school.edu',
    class: 'Grade 5',
    rollNumber: '08',
    parentName: 'Mrs. Priya Sharma',
    parentEmail: 'priya.sharma@gmail.com',
    parentContact: '555-010-3344',
    admissionDate: '2026-06-01',
    monthlyTuitionFee: 1500,
    busFee: 400,
    monthlyExtraCurricularFee: 120,
    totalMonthlyFee: 2020,
    paidAmount: 0,
    pendingAmount: 2020,
    pendingMonths: 1,
    paymentDate: '',
    paymentStatus: 'Pending',
    feeStatus: 'Outstanding',
    remindersActive: true
  },
  {
    id: 'STD-30303',
    name: 'John Doe',
    email: 'john.doe@school.edu',
    class: 'Grade 12-A',
    rollNumber: '15',
    parentName: 'Mr. Richard Doe',
    parentEmail: 'richard.doe@gmail.com',
    parentContact: '555-019-8877',
    admissionDate: '2026-06-01',
    monthlyTuitionFee: 2500,
    busFee: 500,
    monthlyExtraCurricularFee: 200,
    totalMonthlyFee: 3200,
    paidAmount: 3200,
    pendingAmount: 0,
    pendingMonths: 0,
    paymentDate: '2026-06-01',
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
    joiningDate: '2021-08-15',
    monthlySalary: 4500,
    salary: '4500', // backward compatibility
    paidSalary: 0,
    remainingSalary: 4500,
    paymentDate: '',
    paymentStatus: 'Pending'
  },
  {
    id: 'STF-30301',
    name: 'Dr. Sarah Jenkins',
    role: 'Teacher',
    email: 'jenkins.physics@school.edu',
    phone: '555-018-7788',
    designation: 'Physics Instructor',
    department: 'Physics Dept',
    joiningDate: '2022-09-01',
    monthlySalary: 4800,
    salary: '4800',
    paidSalary: 0,
    remainingSalary: 4800,
    paymentDate: '',
    paymentStatus: 'Pending'
  },
  {
    id: 'STF-30302',
    name: 'Dr. Robert Boyle',
    role: 'Teacher',
    email: 'boyle.chem@school.edu',
    phone: '555-018-9922',
    designation: 'Chemistry Instructor',
    department: 'Chemistry Dept',
    joiningDate: '2023-01-10',
    monthlySalary: 4700,
    salary: '4700',
    paidSalary: 0,
    remainingSalary: 4700,
    paymentDate: '',
    paymentStatus: 'Pending'
  },
  {
    id: 'STF-30303',
    name: 'Mrs. Rosalind Franklin',
    role: 'Teacher',
    email: 'franklin.bio@school.edu',
    phone: '555-018-8833',
    designation: 'Biology Instructor',
    department: 'Biology Dept',
    joiningDate: '2020-06-15',
    monthlySalary: 4900,
    salary: '4900',
    paidSalary: 0,
    remainingSalary: 4900,
    paymentDate: '',
    paymentStatus: 'Pending'
  },
  {
    id: 'STF-30304',
    name: 'Ms. Emily Dickinson',
    role: 'Teacher',
    email: 'dickinson.english@school.edu',
    phone: '555-018-1144',
    designation: 'English Literature Instructor',
    department: 'English Dept',
    joiningDate: '2021-11-20',
    monthlySalary: 4400,
    salary: '4400',
    paidSalary: 0,
    remainingSalary: 4400,
    paymentDate: '',
    paymentStatus: 'Pending'
  },
  {
    id: 'STF-30305',
    name: 'Mr. Alan Turing',
    role: 'Teacher',
    email: 'turing.cs@school.edu',
    phone: '555-018-2255',
    designation: 'Computer Science Instructor',
    department: 'Computer Science Dept',
    joiningDate: '2019-08-01',
    monthlySalary: 5200,
    salary: '5200',
    paidSalary: 0,
    remainingSalary: 5200,
    paymentDate: '',
    paymentStatus: 'Pending'
  },
  {
    id: 'STF-30306',
    name: 'Mr. Vincent van Gogh',
    role: 'Teacher',
    email: 'gogh.art@school.edu',
    phone: '555-018-3366',
    designation: 'Fine Arts Instructor',
    department: 'Art Dept',
    joiningDate: '2023-08-15',
    monthlySalary: 4200,
    salary: '4200',
    paidSalary: 0,
    remainingSalary: 4200,
    paymentDate: '',
    paymentStatus: 'Pending'
  },
  {
    id: 'STF-30307',
    name: 'Mrs. Eleanor Roosevelt',
    role: 'Teacher',
    email: 'roosevelt.hist@school.edu',
    phone: '555-018-4477',
    designation: 'Social Sciences Advisor',
    department: 'History Dept',
    joiningDate: '2020-01-15',
    monthlySalary: 4600,
    salary: '4600',
    paidSalary: 0,
    remainingSalary: 4600,
    paymentDate: '',
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
    salary: '7500',
    paidSalary: 0,
    remainingSalary: 7500,
    paymentDate: '',
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
    salary: '6000',
    paidSalary: 0,
    remainingSalary: 6000,
    paymentDate: '',
    paymentStatus: 'Pending'
  }
];

export const DatabaseProvider = ({ children }) => {
  const [appointments, setAppointments] = useState(() => {
    const data = localStorage.getItem('school_appointments');
    return data ? JSON.parse(data) : INITIAL_APPOINTMENTS;
  });

  const [queries, setQueries] = useState(() => {
    const data = localStorage.getItem('school_queries');
    return data ? JSON.parse(data) : INITIAL_QUERIES;
  });

  const [complaints, setComplaints] = useState(() => {
    const data = localStorage.getItem('school_complaints');
    return data ? JSON.parse(data) : INITIAL_COMPLAINTS;
  });

  const [virtualEmails, setVirtualEmails] = useState(() => {
    const data = localStorage.getItem('school_emails');
    return data ? JSON.parse(data) : INITIAL_EMAILS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const data = localStorage.getItem('school_audit_logs');
    return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
  });

  // Expanded tables
  const [payments, setPayments] = useState(() => {
    const data = localStorage.getItem('school_payments');
    return data ? JSON.parse(data) : INITIAL_PAYMENTS;
  });

  const [students, setStudents] = useState(() => {
    const data = localStorage.getItem('school_students');
    return data ? JSON.parse(data) : INITIAL_STUDENTS;
  });

  const [staff, setStaff] = useState(() => {
    const data = localStorage.getItem('school_staff');
    return data ? JSON.parse(data) : INITIAL_STAFF;
  });

  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(() => {
    return localStorage.getItem('school_google_sheets_url') || '';
  });

  const [apiLogs, setApiLogs] = useState([]);

  // Sync googleSheetsUrl to localStorage
  useEffect(() => {
    localStorage.setItem('school_google_sheets_url', googleSheetsUrl);
  }, [googleSheetsUrl]);

  const [notifications, setNotifications] = useState([]);

  // Sync to localStorage
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

  // Log action helper
  const addAuditLog = (user, role, action, details = '') => {
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

  // Mark all notifications as read (FIX: was mutating state directly in Header)
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Push notification helper
  const pushNotification = (message, type = 'info') => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Simulated Email Dispatcher
  const sendEmail = (to, subject, body, sender = 'School Automation <no-reply@school.edu>') => {
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

  // Helper mapping department categories to responsible staff
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

  // 1. APPOINTMENT ACTIONS
  const bookAppointment = (booking, currentUser) => {
    const bookingId = genId('APT');
    const emailTo = nameToEmail(currentUser.name);
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

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Booked Appointment with ${booking.appointmentWith} (${bookingId})`,
      `Logged row in Appointments Sheet. Status: ${newBooking.status}.`
    );

    sendEmail(
      emailTo,
      `Appointment Booked - ${newBooking.status} - ID: ${bookingId}`,
      `Hi ${currentUser.name},\n\nYour appointment with ${booking.appointmentWith} has been logged in the system.\n\nBooking ID: ${bookingId}\nDate: ${booking.date}\nTime: ${booking.time}\nPurpose: ${booking.purpose}\n\nStatus: ${newBooking.status}.\n${
        isPrincipal 
          ? 'Since this is with the Principal, it is currently PENDING approval. You will receive an update shortly.' 
          : `This has been AUTO-APPROVED. Google Calendar Event ID: ${newBooking.calendarEventId} has been added.`
      }`
    );

    pushNotification(`New appointment booking logged: ${bookingId}`, 'success');
  };

  const approveAppointment = (id, resolutionNotes, approverUser) => {
    const calendarEvtId = `gcal_evt_${Math.floor(100000 + Math.random() * 900000)}`;
    let clientName = '';
    let clientRole = '';
    let appointmentWith = '';

    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === id) {
          clientName = apt.userName;
          clientRole = apt.userRole;
          appointmentWith = apt.appointmentWith;
          return {
            ...apt,
            status: 'APPROVED',
            calendarEventId: calendarEvtId,
            resolutionNotes: resolutionNotes || apt.resolutionNotes
          };
        }
        return apt;
      })
    );

    addAuditLog(
      approverUser.name,
      approverUser.role,
      `Approved Appointment ${id}`,
      `Set status to APPROVED in Google Sheets. Created Google Calendar Event: ${calendarEvtId}`
    );

    const clientEmail = nameToEmail(clientName);
    sendEmail(
      clientEmail,
      `Appointment APPROVED & Calendar Event Added - ID: ${id}`,
      `Hi ${clientName},\n\nYour appointment with ${appointmentWith} has been APPROVED.\n\nBooking ID: ${id}\nGoogle Calendar Event ID: ${calendarEvtId}\n\nNotes from Approver:\n${resolutionNotes || 'No notes provided.'}\n\nSee you then!`
    );

    pushNotification(`Appointment ${id} has been approved.`, 'info');
  };

  const rejectAppointment = (id, remarks, approverUser) => {
    let clientName = '';
    let clientRole = '';
    let appointmentWith = '';

    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === id) {
          clientName = apt.userName;
          clientRole = apt.userRole;
          appointmentWith = apt.appointmentWith;
          return {
            ...apt,
            status: 'REJECTED',
            resolutionNotes: remarks || 'Rejected by authority'
          };
        }
        return apt;
      })
    );

    addAuditLog(
      approverUser.name,
      approverUser.role,
      `Rejected Appointment ${id}`,
      `Set status to REJECTED in Google Sheets. Reason: ${remarks}`
    );

    const clientEmail = nameToEmail(clientName);
    sendEmail(
      clientEmail,
      `Appointment REJECTED - ID: ${id}`,
      `Hi ${clientName},\n\nWe regret to inform you that your appointment request with ${appointmentWith} has been REJECTED.\n\nBooking ID: ${id}\nReason for Rejection:\n${remarks || 'No reason provided by the administrator.'}\n\nPlease reschedule using a different slot.`
    );

    pushNotification(`Appointment ${id} was rejected.`, 'warning');
  };

  const rescheduleAppointment = (id, newDate, newTime, currentUser) => {
    let clientName = '';
    let appointmentWith = '';
    const calendarEvtId = `gcal_evt_${Math.floor(100000 + Math.random() * 900000)}`;

    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === id) {
          clientName = apt.userName;
          appointmentWith = apt.appointmentWith;
          return {
            ...apt,
            date: newDate,
            time: newTime,
            status: 'APPROVED',
            calendarEventId: calendarEvtId,
            resolutionNotes: `Rescheduled by ${currentUser.name} on ${new Date().toLocaleDateString()}`
          };
        }
        return apt;
      })
    );

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Rescheduled Appointment ${id}`,
      `Updated Date to ${newDate} and Time to ${newTime} in Appointments Sheet.`
    );

    const clientEmail = nameToEmail(clientName);
    sendEmail(
      clientEmail,
      `Appointment RESCHEDULED - ID: ${id}`,
      `Hi ${clientName},\n\nYour appointment with ${appointmentWith} has been rescheduled successfully.\n\nBooking ID: ${id}\nNew Date: ${newDate}\nNew Time: ${newTime}\nNew Google Calendar Event ID: ${calendarEvtId}\n\nYour Google Calendar has been updated accordingly.`
    );

    pushNotification(`Appointment ${id} has been rescheduled to ${newDate} at ${newTime}.`, 'info');
  };

  const cancelAppointment = (id, currentUser) => {
    let clientName = '';
    let appointmentWith = '';

    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === id) {
          clientName = apt.userName;
          appointmentWith = apt.appointmentWith;
          return {
            ...apt,
            status: 'CANCELLED',
            calendarEventId: ''
          };
        }
        return apt;
      })
    );

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Cancelled Appointment ${id}`,
      `Set status to CANCELLED in Google Sheets. Removed calendar event.`
    );

    const clientEmail = nameToEmail(clientName);
    sendEmail(
      clientEmail,
      `Appointment CANCELLED - ID: ${id}`,
      `Hi ${clientName},\n\nYour appointment with ${appointmentWith} has been CANCELLED.\n\nBooking ID: ${id}\nThe Google Calendar event has been deleted. If you need to meet, please log in and book a fresh appointment.`
    );

    pushNotification(`Appointment ${id} has been cancelled.`, 'warning');
  };

  // 2. QUERY ACTIONS
  const raiseQuery = (query, currentUser) => {
    const queryId = genId('QRY');
    const assigned = getAssignedOfficer(query.category, 'query');
    const userEmail = nameToEmail(currentUser.name);

    const newQuery = {
      id: queryId,
      raisedBy: currentUser.name,
      role: currentUser.role,
      category: query.category,
      subject: sanitize(query.subject),
      description: sanitize(query.description),
      assignedTo: assigned,
      date: new Date().toISOString(),
      status: 'Pending',
      resolution: '',
      closedDate: ''
    };

    setQueries(prev => [newQuery, ...prev]);

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Raised Query: ${queryId}`,
      `Logged row in Queries Sheet. Auto-assigned to: ${assigned}`
    );

    sendEmail(
      userEmail,
      `Query Received & Ticket Generated - ID: ${queryId}`,
      `Dear ${currentUser.name},\n\nWe have received your query regarding "${query.category}".\n\nTicket ID: ${queryId}\nSubject: ${query.subject}\nCategory: ${query.category}\nDescription: ${query.description}\n\nThis has been automatically assigned to: ${assigned}.\nExpected Resolution Time: 24-48 business hours.\n\nYou will receive a notification when the status is updated.`
    );

    pushNotification(`New academic/admin query raised: ${queryId}`, 'success');
  };

  const updateQueryStatus = (id, newStatus, remarks, officerUser) => {
    let clientName = '';
    let category = '';
    let subject = '';

    setQueries(prev =>
      prev.map(q => {
        if (q.id === id) {
          clientName = q.raisedBy;
          category = q.category;
          subject = q.subject;
          return {
            ...q,
            status: newStatus,
            resolution: remarks || q.resolution,
            closedDate: newStatus === 'Resolved' || newStatus === 'Closed' ? new Date().toISOString() : q.closedDate
          };
        }
        return q;
      })
    );

    addAuditLog(
      officerUser.name,
      officerUser.role,
      `Updated Query ${id} Status to ${newStatus}`,
      `Spreadsheet logged. Resolution remarks added: ${remarks}`
    );

    const clientEmail = nameToEmail(clientName);
    sendEmail(
      clientEmail,
      `Query Update Notification - ID: ${id} [${newStatus.toUpperCase()}]`,
      `Dear ${clientName},\n\nYour query ticket regarding "${category}" has been updated.\n\nTicket ID: ${id}\nSubject: ${subject}\nStatus: ${newStatus}\n\nOfficer Remarks:\n"${remarks || 'No comments provided.'}"\n\n${
        newStatus === 'Resolved' 
          ? 'If you are satisfied with this resolution, please mark the ticket closed. If you have further issues, feel free to raise another query.' 
          : 'The officer is actively investigating your request.'
      }`
    );

    pushNotification(`Query ${id} status updated to ${newStatus}.`, 'info');
  };

  // 3. COMPLAINT ACTIONS
  const submitComplaint = (complaint, currentUser) => {
    const complaintId = genId('CMP');
    const assigned = getAssignedOfficer(complaint.complaintType, 'complaint');
    const userEmail = nameToEmail(currentUser.name);

    const newComplaint = {
      id: complaintId,
      submittedBy: currentUser.name,
      role: currentUser.role,
      complaintType: complaint.complaintType,
      description: sanitize(complaint.description),
      assignedOfficer: assigned,
      date: new Date().toISOString(),
      status: 'Pending',
      actionTaken: '',
      resolvedDate: '',
      isEscalated: false,
      internalNotes: ''
    };

    setComplaints(prev => [newComplaint, ...prev]);

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Submitted Complaint: ${complaintId}`,
      `Logged row in Complaints Sheet. Category: ${complaint.complaintType}. Assigned to: ${assigned}`
    );

    sendEmail(
      userEmail,
      `Complaint Registered - Ticket: ${complaintId}`,
      `Dear ${currentUser.name},\n\nYour complaint has been formally registered in our system.\n\nTicket ID: ${complaintId}\nComplaint Type: ${complaint.complaintType}\nDescription: ${complaint.description}\n\nAssigned Officer: ${assigned}\nExpected Resolution Window: 48-72 business hours.\n\nWe take all complaints very seriously. You will be kept informed throughout the investigation.`
    );

    pushNotification(`New complaint ticket registered: ${complaintId}`, 'warning');
  };

  const updateComplaintStatus = (id, fields, officerUser) => {
    let clientName = '';
    let complaintType = '';

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          clientName = c.submittedBy;
          complaintType = c.complaintType;
          return {
            ...c,
            status: fields.status || c.status,
            actionTaken: fields.actionTaken || c.actionTaken,
            internalNotes: fields.internalNotes || c.internalNotes,
            resolvedDate: fields.status === 'Resolved' ? new Date().toISOString() : c.resolvedDate
          };
        }
        return c;
      })
    );

    addAuditLog(
      officerUser.name,
      officerUser.role,
      `Updated Complaint ${id} (${fields.status})`,
      `Action taken: ${fields.actionTaken}. Internal Notes updated.`
    );

    const clientEmail = nameToEmail(clientName);
    sendEmail(
      clientEmail,
      `Complaint Ticket Update - ID: ${id} [${fields.status}]`,
      `Dear ${clientName},\n\nWe are writing to provide an update regarding complaint ticket ${id} (${complaintType}).\n\nTicket Status: ${fields.status}\n\nAction Taken / Investigation Summary:\n"${fields.actionTaken || 'The investigation is currently underway.'}"\n\nThank you for your patience as we maintain a safe, functional, and supportive school environment.`
    );

    pushNotification(`Complaint ${id} status updated to ${fields.status}.`, 'info');
  };

  const escalateComplaint = (id, currentUser) => {
    let clientName = '';
    let complaintType = '';

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          clientName = c.submittedBy;
          complaintType = c.complaintType;
          return {
            ...c,
            isEscalated: true,
            assignedOfficer: 'Principal (Dr. Adrian Vance)',
            internalNotes: `${c.internalNotes}\n[ESCALATED by ${currentUser.name} on ${new Date().toLocaleDateString()}: Requires Principal oversight due to critical delay or severity.]`
          };
        }
        return c;
      })
    );

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Escalated Complaint ${id} to Principal`,
      `Re-assigned Officer to Principal. Escalation flag activated.`
    );

    const principalEmail = 'vance.principal@school.edu';
    sendEmail(
      principalEmail,
      `CRITICAL ESCALATION: Complaint Ticket ${id}`,
      `Dear Principal Vance,\n\nA complaint ticket has been escalated directly to you for executive intervention.\n\nTicket ID: ${id}\nComplaint Type: ${complaintType}\nSubmitted By: ${clientName}\n\nPlease check your executive dashboard under the Escalations panel immediately.`
    );

    const clientEmail = nameToEmail(clientName);
    sendEmail(
      clientEmail,
      `Complaint Ticket ESCALATED - ID: ${id}`,
      `Dear ${clientName},\n\nYour complaint ticket ${id} has been escalated directly to the Principal's Office (Dr. Adrian Vance) for direct review. We are treating this with the highest priority.`
    );

    pushNotification(`Complaint ${id} escalated to Principal Vance.`, 'danger');
  };

  // Cloud Sync Layer
  const syncCloudSheet = async (action, sheetName, payload) => {
    if (!googleSheetsUrl) {
      const simLog = {
        id: `sim-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        action,
        sheet: sheetName,
        payload,
        status: 'SUCCESS (LOCAL SIM)',
        responseText: 'Synchronized with local simulated database spreadsheet.'
      };
      setApiLogs(prev => [simLog, ...prev]);
      return { success: true };
    }

    try {
      const pendingLog = {
        id: `api-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        action,
        sheet: sheetName,
        payload,
        status: 'PENDING',
        responseText: ''
      };
      setApiLogs(prev => [pendingLog, ...prev]);

      const response = await fetch(googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          sheet: sheetName,
          ...payload
        })
      });

      setApiLogs(prev =>
        prev.map(l =>
          l.action === action && l.sheet === sheetName && l.status === 'PENDING'
            ? { ...l, status: 'SUCCESS (OK)', responseText: 'Opaque response dispatched.' }
            : l
        )
      );
      return { success: true };
    } catch (err) {
      setApiLogs(prev =>
        prev.map(l =>
          l.action === action && l.sheet === sheetName && l.status === 'PENDING'
            ? { ...l, status: 'ERROR', responseText: err.message }
            : l
        )
      );
      return { success: false, error: err.message };
    }
  };

  // 7-Day Student Fee Reminder Dispatch Loop
  const runDuesReminderLoop = (currentUser) => {
    let sentCount = 0;
    students.forEach(std => {
      if (std.remindersActive && std.pendingAmount > 0) {
        sentCount++;
        sendEmail(
          std.parentEmail || 'parent@school.edu',
          `⚠️ ACTION REQUIRED: Outstanding Student Fees Reminder - ${std.name}`,
          `Dear ${std.parentName},\n\nThis is an automated 7-day security reminder regarding outstanding student accounts for ${std.name} (${std.class}).\n\nFee Breakdown:\n========================\n- Tuition Fee Dues: $${std.monthlyTuitionFee}\n- Transport Fee Dues: $${std.busFee}\n- Extra-Curricular Fee Dues: $${std.monthlyExtraCurricularFee || 0}\n- Total Outstanding Dues: $${std.pendingAmount}\n- Overdue Account Months: ${std.pendingMonths} Month(s)\n========================\n\nPlease click the link below to resolve outstanding fees:\nhttp://localhost:5173/parent-billing\n\nIf you have already processed your payments, please disregard this alert. Thank you.`
        );
      }
    });

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Executed 7-Day Fee Reminder Sweep`,
      `Scanned student roster. Dispatched simulated reminder emails to ${sentCount} parents.`
    );

    pushNotification(`Completed 7-day reminder sweep. ${sentCount} alerts sent to parents.`, 'success');
  };

  // 4. ACCOUNTING & TRANSACTION ACTIONS
  const payFee = (payerName, type, amount, cardDetails, currentUser) => {
    const payId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = `tx_gate_${Math.floor(100000 + Math.random() * 900000)}`;

    const amtPaid = Number(amount);
    
    // FIX: was hardcoded to 'Liam Chen' regardless of who was logged in.
    // Now uses the explicit linkedStudentName from AuthContext user profile.
    const studentToUpdate = currentUser.linkedStudentName || currentUser.name;
    
    let updatedStd = null;
    setStudents(prev => 
      prev.map(std => {
        if (std.name === studentToUpdate) {
          const newPaid = Number(std.paidAmount || 0) + amtPaid;
          const newPending = Math.max(0, Number(std.totalMonthlyFee) - newPaid);
          
          let status = 'Pending';
          if (newPending <= 0) {
            status = 'Paid';
          } else if (newPaid > 0) {
            status = 'Partial';
          }
          
          updatedStd = {
            ...std,
            paidAmount: newPaid,
            pendingAmount: newPending,
            pendingMonths: newPending <= 0 ? 0 : std.pendingMonths,
            paymentStatus: status,
            feeStatus: status === 'Paid' ? 'Paid' : 'Outstanding',
            remindersActive: newPending > 0,
            paymentDate: new Date().toISOString().split('T')[0]
          };
          return updatedStd;
        }
        return std;
      })
    );

    const newPayment = {
      id: payId,
      userName: payerName,
      role: currentUser.role,
      paymentType: type,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      status: 'PAID',
      transactionId: txId
    };

    setPayments(prev => [newPayment, ...prev]);

    // Send confirmation email
    const emailTo = nameToEmail(currentUser.name);
    sendEmail(
      emailTo,
      `💳 Beacon Fee Payment Confirmation - ID: ${payId}`,
      `Dear Parent / Student,\n\nWe have successfully received your payment of $${amount} for "${type}".\n\nTransaction Receipt:\n========================\nPayment ID: ${payId}\nAmount Paid: $${amount}\nGateway Ref ID: ${txId}\nBilling Date: ${new Date().toLocaleDateString()}\nStatus: SUCCESSFUL\n========================\n\nYour student fee account has been updated automatically. Reminders have been stopped for cleared invoices.`
    );

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Completed Online Payment [${type}] ($${amount})`,
      `Updated Students table (Paid: $${updatedStd ? updatedStd.paidAmount : 0}, Pending: $${updatedStd ? updatedStd.pendingAmount : 0}). Recalculated balance status.`
    );

    pushNotification(`Payment of $${amount} for ${type} processed successfully!`, 'success');
    
    // Sync to Cloud Sheet
    if (updatedStd) {
      syncCloudSheet('update', 'students', {
        id: updatedStd.id,
        updates: {
          paidAmount: updatedStd.paidAmount,
          pendingAmount: updatedStd.pendingAmount,
          pendingMonths: updatedStd.pendingMonths,
          paymentStatus: updatedStd.paymentStatus,
          feeStatus: updatedStd.feeStatus,
          remindersActive: updatedStd.remindersActive,
          paymentDate: updatedStd.paymentDate
        }
      });
      
      syncCloudSheet('append', 'payments', {
        row: [payId, payerName, currentUser.role, type, amount, newPayment.date, 'PAID', txId]
      });
    }
  };

  const payTeacherSalary = (teacherId, amount, currentUser) => {
    const payId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = `tx_salary_${Math.floor(100000 + Math.random() * 900000)}`;
    
    const amtPaid = Number(amount);
    let updatedTch = null;
    
    setStaff(prev =>
      prev.map(member => {
        if (member.id === teacherId) {
          const newPaid = Number(member.paidSalary || 0) + amtPaid;
          const newRemaining = Math.max(0, Number(member.monthlySalary) - newPaid);
          
          let status = 'Pending';
          if (newRemaining <= 0) {
            status = 'Paid';
          } else if (newPaid > 0) {
            status = 'Partial';
          }
          
          updatedTch = {
            ...member,
            paidSalary: newPaid,
            remainingSalary: newRemaining,
            paymentStatus: status,
            paymentDate: new Date().toISOString().split('T')[0]
          };
          return updatedTch;
        }
        return member;
      })
    );

    const newPayment = {
      id: payId,
      userName: updatedTch ? updatedTch.name : 'Faculty Member',
      role: 'Teacher',
      paymentType: 'Teacher Salary',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      status: 'PAID',
      transactionId: txId
    };

    setPayments(prev => [newPayment, ...prev]);

    if (updatedTch) {
      sendEmail(
        updatedTch.email,
        `💸 Salary Slip & Credit Advice - PAID - ID: ${payId}`,
        `Dear ${updatedTch.name},\n\nWe are pleased to inform you that your monthly salary payout of $${amount} has been successfully processed.\n\nSalary Slip Details:\n========================\nReference Payout ID: ${payId}\nAmount Paid: $${amount}\nRemaining Salary: $${updatedTch.remainingSalary}\nCredit Date: ${new Date().toLocaleDateString()}\nBank Reference ID: ${txId}\n========================\n\nPlease check your bank statement. Thank you for your continued dedication to High School.`
      );

      addAuditLog(
        currentUser.name,
        currentUser.role,
        `Disbursed Teacher Salary Payout to Mr./Mrs. ${updatedTch.name}`,
        `Disbursed $${amount}. Remaining salary: $${updatedTch.remainingSalary}. Ref Transaction: ${txId}.`
      );

      pushNotification(`Salary payout of $${amount} successfully transferred to ${updatedTch.name}.`, 'success');
      
      // Cloud Sync
      syncCloudSheet('update', 'staff', {
        id: updatedTch.id,
        updates: {
          paidSalary: updatedTch.paidSalary,
          remainingSalary: updatedTch.remainingSalary,
          paymentStatus: updatedTch.paymentStatus,
          paymentDate: updatedTch.paymentDate
        }
      });

      syncCloudSheet('append', 'payments', {
        row: [payId, updatedTch.name, 'Teacher', 'Teacher Salary', amount, newPayment.date, 'PAID', txId]
      });
    }
  };

  // 5. REGISTRATION ENROLLMENT
  const registerStudent = (studentData, currentUser) => {
    const stdId = `STD-${Math.floor(10000 + Math.random() * 90000)}`;

    const tuition = Number(studentData.monthlyTuitionFee || 2000);
    const bus = Number(studentData.busFee || 0);
    const extra = Number(studentData.monthlyExtraCurricularFee || 150);
    const total = tuition + bus + extra;

    const newStudent = {
      id: stdId,
      name: studentData.name,
      email: studentData.email,
      class: studentData.class || 'Grade 11-A',
      rollNumber: studentData.rollNumber || String(Math.floor(1 + Math.random() * 40)).padStart(2, '0'),
      parentName: studentData.parentName || 'Mr./Mrs. Parent',
      parentEmail: studentData.parentEmail || 'parent@school.edu',
      parentContact: studentData.parentContact || '555-019-0000',
      admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
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

    setStudents(prev => [...prev, newStudent]);

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Enrolled New Student: ${studentData.name} (${stdId})`,
      `Logged row in Students spreadsheet. Total monthly fee set to $${total}.`
    );

    sendEmail(
      studentData.parentEmail || 'parent@school.edu',
      `🔔 High School: Student Admission & Dues Setup - ID: ${stdId}`,
      `Dear ${studentData.parentName || 'Parent'},\n\nWelcome! Your child's (${studentData.name}) admission enrollment is complete.\n\nEnrollment Summary:\n========================\nStudent ID: ${stdId}\nClass Room: ${newStudent.class}\nAdmission Date: ${newStudent.admissionDate}\n\nOutstanding Billing Accounts:\n- Tuition Dues: $${tuition}/month\n- Transportation Dues: $${bus}/month\n- Monthly Total Fee Dues: $${total}\n========================\n\nPlease log into the Parent Billing Portal to clear your outstanding dues. Automated weekly reminders have been activated.`
    );

    pushNotification(`Successfully enrolled student: ${studentData.name}`, 'success');

    // Cloud Sync
    syncCloudSheet('append', 'students', {
      row: [
        stdId, newStudent.name, newStudent.email, newStudent.class, newStudent.rollNumber,
        newStudent.parentName, newStudent.parentEmail, newStudent.parentContact, newStudent.admissionDate,
        tuition, bus, total, 0, total, 1, '', 'Pending', 'Outstanding', true
      ]
    });
  };

  const registerTeacher = (teacherData, currentUser) => {
    const staffId = `STF-${Math.floor(10000 + Math.random() * 90000)}`;
    const baseSalary = Number(teacherData.salary || 4500);

    const newStaff = {
      id: staffId,
      name: teacherData.name,
      role: teacherData.role || 'Teacher',
      email: teacherData.email,
      phone: teacherData.phone || '555-019-0000',
      designation: teacherData.designation || 'Academic Staff',
      department: teacherData.department || 'Advisory',
      joiningDate: teacherData.joiningDate || new Date().toISOString().split('T')[0],
      monthlySalary: baseSalary,
      salary: String(baseSalary), // backward compatibility
      paidSalary: 0,
      remainingSalary: baseSalary,
      paymentDate: '',
      paymentStatus: 'Pending'
    };

    setStaff(prev => [...prev, newStaff]);

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Hired New Staff: ${teacherData.name} (${staffId})`,
      `Logged row in Staff spreadsheet. Monthly salary set to $${baseSalary}.`
    );

    sendEmail(
      teacherData.email,
      `🤝 Welcome to the Faculty: Offer of Appointment - ID: ${staffId}`,
      `Dear ${teacherData.name},\n\nWe are pleased to formally welcome you to the advisory team at High School!\n\nEmployment Summary:\n========================\nStaff ID: ${staffId}\nAdvisory Role: ${newStaff.role}\nDepartment: ${newStaff.department}\nContract Salary: $${baseSalary}/month\nJoining Date: ${newStaff.joiningDate}\n========================\n\nPlease log into the staff portal using your unique temporary onboarding ID to set up your permanent credentials.`
    );

    pushNotification(`Successfully hired staff member: ${teacherData.name}`, 'success');

    // Cloud Sync
    syncCloudSheet('append', 'staff', {
      row: [
        staffId, newStaff.name, newStaff.role, newStaff.email, newStaff.phone,
        newStaff.designation, newStaff.department, newStaff.joiningDate,
        baseSalary, 0, baseSalary, '', 'Pending'
      ]
    });
  };

  // Direct sheets editor (simulates manual database alterations by Admins)
  const updateSheetRow = (sheetName, rowId, updatedFields, adminUser) => {
    if (sheetName === 'appointments') {
      setAppointments(prev =>
        prev.map(row => (row.id === rowId ? { ...row, ...updatedFields } : row))
      );
    } else if (sheetName === 'queries') {
      setQueries(prev =>
        prev.map(row => (row.id === rowId ? { ...row, ...updatedFields } : row))
      );
    } else if (sheetName === 'complaints') {
      setComplaints(prev =>
        prev.map(row => (row.id === rowId ? { ...row, ...updatedFields } : row))
      );
    } else if (sheetName === 'payments') {
      setPayments(prev =>
        prev.map(row => (row.id === rowId ? { ...row, ...updatedFields } : row))
      );
    } else if (sheetName === 'students') {
      setStudents(prev =>
        prev.map(row => (row.id === rowId ? { ...row, ...updatedFields } : row))
      );
    } else if (sheetName === 'staff') {
      setStaff(prev =>
        prev.map(row => (row.id === rowId ? { ...row, ...updatedFields } : row))
      );
    }

    addAuditLog(
      adminUser.name,
      adminUser.role,
      `Manually edited Google Sheet row (${sheetName} -> ${rowId})`,
      `Altered values: ${JSON.stringify(updatedFields)}`
    );

    pushNotification(`Google Sheets: Row ${rowId} manually updated.`, 'info');

    // Cloud Sync
    syncCloudSheet('update', sheetName, {
      id: rowId,
      updates: updatedFields
    });
  };

  const deleteSheetRow = (sheetName, rowId, adminUser) => {
    if (sheetName === 'appointments') {
      setAppointments(prev => prev.filter(row => row.id !== rowId));
    } else if (sheetName === 'queries') {
      setQueries(prev => prev.filter(row => row.id !== rowId));
    } else if (sheetName === 'complaints') {
      setComplaints(prev => prev.filter(row => row.id !== rowId));
    } else if (sheetName === 'payments') {
      setPayments(prev => prev.filter(row => row.id !== rowId));
    } else if (sheetName === 'students') {
      setStudents(prev => prev.filter(row => row.id !== rowId));
    } else if (sheetName === 'staff') {
      setStaff(prev => prev.filter(row => row.id !== rowId));
    }

    addAuditLog(
      adminUser.name,
      adminUser.role,
      `Deleted Google Sheet row (${sheetName} -> ${rowId})`,
      `Permanently removed record from online spreadsheet.`
    );

    pushNotification(`Google Sheets: Row ${rowId} deleted.`, 'warning');

    // Cloud Sync
    syncCloudSheet('delete', sheetName, {
      id: rowId
    });
  };

  const resetAllData = (adminUser) => {
    setAppointments(INITIAL_APPOINTMENTS);
    setQueries(INITIAL_QUERIES);
    setComplaints(INITIAL_COMPLAINTS);
    setVirtualEmails(INITIAL_EMAILS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setPayments(INITIAL_PAYMENTS);
    setStudents(INITIAL_STUDENTS);
    setStaff(INITIAL_STAFF);

    addAuditLog(
      adminUser.name,
      adminUser.role,
      'System Database Reset',
      'Flushed local storage databases and restored initial mock entries.'
    );

    pushNotification('System databases reset to default state.', 'warning');
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
        pushNotification
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
