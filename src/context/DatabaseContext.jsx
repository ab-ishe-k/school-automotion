import React, { createContext, useContext, useState, useEffect } from 'react';

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
    feeStatus: 'Outstanding', // Outstanding, Paid, Overdue
    busRoute: 'Route 12'
  },
  {
    id: 'STD-10928',
    name: 'Emily Davis',
    email: 'emily.davis@school.edu',
    class: 'Grade 10-B',
    feeStatus: 'Paid',
    busRoute: 'None'
  }
];

const INITIAL_STAFF = [
  {
    id: 'STF-20192',
    name: 'Mr. Marcus Davis',
    role: 'Teacher',
    email: 'davis.math@school.edu',
    salary: '4500',
    department: 'Math Dept',
    dateJoined: '2021-08-15'
  },
  {
    id: 'STF-90281',
    name: 'Dr. Adrian Vance',
    role: 'Principal',
    email: 'vance.principal@school.edu',
    salary: '7500',
    department: 'Principal Office',
    dateJoined: '2018-05-10'
  },
  {
    id: 'STF-10291',
    name: 'Ms. Clara Vance',
    role: 'Vice Principal',
    email: 'vance.vp@school.edu',
    salary: '6000',
    department: 'VP Office',
    dateJoined: '2019-10-01'
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
    const bookingId = `APT-${Math.floor(10000 + Math.random() * 90000)}`;
    const emailTo = `${currentUser.name.toLowerCase().replace(' ', '.')}@school.edu`;
    const isPrincipal = booking.department === 'Principal';

    const newBooking = {
      id: bookingId,
      userName: currentUser.name,
      userRole: currentUser.role,
      appointmentWith: booking.appointmentWith,
      department: booking.department,
      date: booking.date,
      time: booking.time,
      purpose: booking.purpose,
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

    const clientEmail = `${clientName.toLowerCase().replace(' ', '.')}@school.edu`;
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

    const clientEmail = `${clientName.toLowerCase().replace(' ', '.')}@school.edu`;
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

    const clientEmail = `${clientName.toLowerCase().replace(' ', '.')}@school.edu`;
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

    const clientEmail = `${clientName.toLowerCase().replace(' ', '.')}@school.edu`;
    sendEmail(
      clientEmail,
      `Appointment CANCELLED - ID: ${id}`,
      `Hi ${clientName},\n\nYour appointment with ${appointmentWith} has been CANCELLED.\n\nBooking ID: ${id}\nThe Google Calendar event has been deleted. If you need to meet, please log in and book a fresh appointment.`
    );

    pushNotification(`Appointment ${id} has been cancelled.`, 'warning');
  };

  // 2. QUERY ACTIONS
  const raiseQuery = (query, currentUser) => {
    const queryId = `QRY-${Math.floor(10000 + Math.random() * 90000)}`;
    const assigned = getAssignedOfficer(query.category, 'query');
    const userEmail = `${currentUser.name.toLowerCase().replace(' ', '.')}@school.edu`;

    const newQuery = {
      id: queryId,
      raisedBy: currentUser.name,
      role: currentUser.role,
      category: query.category,
      subject: query.subject,
      description: query.description,
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

    const clientEmail = `${clientName.toLowerCase().replace(' ', '.')}@school.edu`;
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
    const complaintId = `CMP-${Math.floor(10000 + Math.random() * 90000)}`;
    const assigned = getAssignedOfficer(complaint.complaintType, 'complaint');
    const userEmail = `${currentUser.name.toLowerCase().replace(' ', '.')}@school.edu`;

    const newComplaint = {
      id: complaintId,
      submittedBy: currentUser.name,
      role: currentUser.role,
      complaintType: complaint.complaintType,
      description: complaint.description,
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

    const clientEmail = `${clientName.toLowerCase().replace(' ', '.')}@school.edu`;
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

    const clientEmail = `${clientName.toLowerCase().replace(' ', '.')}@school.edu`;
    sendEmail(
      clientEmail,
      `Complaint Ticket ESCALATED - ID: ${id}`,
      `Dear ${clientName},\n\nYour complaint ticket ${id} has been escalated directly to the Principal's Office (Dr. Adrian Vance) for direct review. We are treating this with the highest priority.`
    );

    pushNotification(`Complaint ${id} escalated to Principal Vance.`, 'danger');
  };

  // 4. ACCOUNTING & TRANSACTION ACTIONS
  const payFee = (payerName, type, amount, cardDetails, currentUser) => {
    const payId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = `tx_gate_${Math.floor(100000 + Math.random() * 900000)}`;

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

    // Update Student Fee Dues Status if Tuition or Bus Fee paid
    // Default child: Liam Chen
    const studentToUpdate = (currentUser.role === 'Parent') ? 'Liam Chen' : currentUser.name;
    
    setStudents(prev => 
      prev.map(std => {
        if (std.name === studentToUpdate) {
          return {
            ...std,
            feeStatus: type === 'Tuition Fee' ? 'Paid' : std.feeStatus
          };
        }
        return std;
      })
    );

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Completed Online Payment [${type}] ($${amount})`,
      `Created Payments Sheet row (${payId}). Transaction ID: ${txId}. updated Student Dues status.`
    );

    const emailTo = `${currentUser.name.toLowerCase().replace(' ', '.')}@school.edu`;
    sendEmail(
      emailTo,
      `Billing Receipt & Invoice - Payout: PAID - ID: ${payId}`,
      `Dear ${currentUser.name},\n\nWe have received your payment for "${type}" successfully.\n\nTransaction Receipt:\n========================\nPayment ID: ${payId}\nAmount Paid: $${amount}\nTransaction Status: SUCCESSFUL\nGateway Transaction ID: ${txId}\nBilling Date: ${new Date().toLocaleDateString()}\n========================\n\nYour student fee spreadsheet records have been updated to PAID. Thank you!`
    );

    pushNotification(`Payment of $${amount} for ${type} successful!`, 'success');
  };

  const payTeacherSalary = (teacherId, amount, currentUser) => {
    const payId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = `tx_salary_${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Find teacher
    const teacher = staff.find(st => st.id === teacherId) || { name: 'Faculty Member', email: 'faculty@school.edu' };

    const newPayment = {
      id: payId,
      userName: teacher.name,
      role: 'Teacher',
      paymentType: 'Teacher Salary',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      status: 'PAID',
      transactionId: txId
    };

    setPayments(prev => [newPayment, ...prev]);

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Disbursed Teacher Salary Payout to Mr./Mrs. ${teacher.name}`,
      `Created Payout row (${payId}). Transaction ID: ${txId}.`
    );

    sendEmail(
      teacher.email,
      `Salary Slip & Credit Advice - PAID - ID: ${payId}`,
      `Dear ${teacher.name},\n\nWe are pleased to inform you that your monthly salary payout of $${amount} has been credited.\n\nSalary Slip Details:\n========================\nReference Payout ID: ${payId}\nCredit Status: SUCCESSFUL / TRANSFERRED\nSalary Amount: $${amount}\nCredit Value Date: ${new Date().toLocaleDateString()}\nBank Transaction Reference ID: ${txId}\n========================\n\nPlease check your bank statement. Thank you for your continued dedication to Beacon High School.`
    );

    pushNotification(`Salary payout of $${amount} successfully transferred to ${teacher.name}.`, 'success');
  };

  // 5. REGISTRATION ENROLLMENT
  const registerStudent = (studentData, currentUser) => {
    const stdId = `STD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newStudent = {
      id: stdId,
      name: studentData.name,
      email: studentData.email,
      class: studentData.class || 'Grade 11-A',
      feeStatus: 'Outstanding',
      busRoute: studentData.busRoute || 'None'
    };

    setStudents(prev => [...prev, newStudent]);

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Enrolled New Student: ${studentData.name} (${stdId})`,
      `Logged row in Students spreadsheet. Set Fee Dues Status to Outstanding.`
    );

    sendEmail(
      studentData.email,
      `Welcome to Beacon High School! Student ID: ${stdId}`,
      `Dear ${studentData.name},\n\nWelcome! Your enrollment registration is complete.\n\nEnrollment details:\n========================\nStudent Assigned ID: ${stdId}\nClass Room: ${newStudent.class}\nTransportation Route: ${newStudent.busRoute}\nFee Dues Status: Outstanding ($2,500 Tuition)\n========================\n\nPlease alert your parents to complete outstanding quarterly tuition payment fees in the parent portal.`
    );

    pushNotification(`Successfully enrolled student: ${studentData.name}`, 'success');
  };

  const registerTeacher = (teacherData, currentUser) => {
    const teacherId = `STF-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTeacher = {
      id: teacherId,
      name: teacherData.name,
      role: 'Teacher',
      email: teacherData.email,
      salary: teacherData.salary || '4500',
      department: teacherData.department || 'Advisory',
      dateJoined: new Date().toISOString().split('T')[0]
    };

    setStaff(prev => [...prev, newTeacher]);

    addAuditLog(
      currentUser.name,
      currentUser.role,
      `Hired New Faculty Member: ${teacherData.name} (${teacherId})`,
      `Logged row in Staff spreadsheet database. Monthly Contract Salary set to $${newTeacher.salary}.`
    );

    sendEmail(
      teacherData.email,
      `Beacon High Appointment Offer Confirmation - ID: ${teacherId}`,
      `Dear ${teacherData.name},\n\nWe are excited to formally welcome you to the Beacon High Faculty group!\n\nEmployment summary:\n========================\nStaff ID: ${teacherId}\nDepartment: ${newTeacher.department}\nContract Base Salary: $${newTeacher.salary}/month\n========================\n\nPlease log in to access your advisor schedule and academic queries dashboard.`
    );

    pushNotification(`Formally hired instructor: ${teacherData.name}`, 'success');
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
