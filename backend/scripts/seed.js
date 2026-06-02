import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import Fee from '../models/Fee.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Notice from '../models/Notice.js';
import Homework from '../models/Homework.js';
import Appointment from '../models/Appointment.js';
import Query from '../models/Query.js';
import Complaint from '../models/Complaint.js';
import Leave from '../models/Leave.js';
import Email from '../models/Email.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

dotenv.config();

const INITIAL_USERS = [
  {
    name: 'Dr. Adrian Vance',
    role: 'Principal',
    email: 'vance.principal@school.edu',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    tempId: 'TEMP-PRN-90281',
    tempPassword: 'Demo-PRN-2026',
    isSetupCompleted: false,
    description: 'Executive principal of High School. Manages calendars, escalations, and audits.'
  },
  {
    name: 'Mr. Marcus Davis',
    role: 'Teacher',
    email: 'davis.math@school.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    tempId: 'TEMP-TCH-20192',
    tempPassword: 'Demo-TCH-2026',
    isSetupCompleted: false,
    description: 'Advisory mathematics instructor. Resolves academic queries and guides consultations.'
  },
  {
    name: 'Liam Chen',
    role: 'Student',
    email: 'liam.chen@school.edu',
    linkedStudentName: 'Liam Chen',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    tempId: 'TEMP-STD-88201',
    tempPassword: 'Demo-STD-2026',
    isSetupCompleted: false,
    description: 'Student Grade 11-A. Manages academic queries, consultation bookings, and billing alerts.'
  },
  {
    name: 'Sarah Smith',
    role: 'Parent',
    email: 'sarah.smith@school.edu',
    linkedStudentName: 'Liam Chen',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    tempId: 'TEMP-PAR-30821',
    tempPassword: 'Demo-PAR-2026',
    isSetupCompleted: false,
    description: 'Parent of Liam Chen. Manages school fees checkouts and teacher consultation schedules.'
  },
  {
    name: 'Mrs. Janet Finch',
    role: 'Admin Staff',
    email: 'finch.admin@school.edu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    tempId: 'TEMP-ADM-10822',
    tempPassword: 'Demo-ADM-2026',
    isSetupCompleted: false,
    description: 'System administrator. Coordinates spreadsheets, admissions, and ID card generation.'
  },
  {
    name: 'Officer Alan',
    role: 'Reception / Office Staff',
    email: 'alan.frontdesk@school.edu',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    tempId: 'TEMP-REC-00192',
    tempPassword: 'Demo-REC-2026',
    isSetupCompleted: false,
    description: 'Office receptionist desk. Handles walk-in registries, caller queries, and safety logs.'
  },
  {
    name: 'Ms. Clara Vance',
    role: 'Vice Principal',
    email: 'vance.vp@school.edu',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150',
    tempId: 'TEMP-VPS-10291',
    tempPassword: 'Demo-VPS-2026',
    isSetupCompleted: false,
    description: 'Vice Principal. Oversees disciplinary routes, transport alerts, and staff payroll.'
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
    admissionDate: new Date('2026-06-01'),
    monthlyTuitionFee: 2000,
    busFee: 500,
    monthlyExtraCurricularFee: 150,
    totalMonthlyFee: 2650,
    paidAmount: 0,
    pendingAmount: 2650,
    pendingMonths: 1,
    paymentDate: '',
    paymentStatus: 'Pending',
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
    admissionDate: new Date('2026-05-15'),
    monthlyTuitionFee: 2000,
    busFee: 0,
    monthlyExtraCurricularFee: 150,
    totalMonthlyFee: 2150,
    paidAmount: 2150,
    pendingAmount: 0,
    pendingMonths: 0,
    paymentDate: '2026-05-28',
    paymentStatus: 'Paid',
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
    admissionDate: new Date('2026-06-01'),
    monthlyTuitionFee: 1200,
    busFee: 300,
    monthlyExtraCurricularFee: 100,
    totalMonthlyFee: 1600,
    paidAmount: 1600,
    pendingAmount: 0,
    pendingMonths: 0,
    paymentDate: '2026-06-01',
    paymentStatus: 'Paid',
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
    admissionDate: new Date('2026-06-01'),
    monthlyTuitionFee: 1500,
    busFee: 400,
    monthlyExtraCurricularFee: 120,
    totalMonthlyFee: 2020,
    paidAmount: 0,
    pendingAmount: 2020,
    pendingMonths: 1,
    paymentDate: '',
    paymentStatus: 'Pending',
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
    admissionDate: new Date('2026-06-01'),
    monthlyTuitionFee: 2500,
    busFee: 500,
    monthlyExtraCurricularFee: 200,
    totalMonthlyFee: 3200,
    paidAmount: 3200,
    pendingAmount: 0,
    pendingMonths: 0,
    paymentDate: '2026-06-01',
    paymentStatus: 'Paid',
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
    joiningDate: new Date('2021-08-15'),
    monthlySalary: 4500,
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
    classTeacherOf: 'Grade 12-A',
    joiningDate: new Date('2022-09-01'),
    monthlySalary: 4800,
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
    joiningDate: new Date('2023-01-10'),
    monthlySalary: 4700,
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
    joiningDate: new Date('2020-06-15'),
    monthlySalary: 4900,
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
    classTeacherOf: 'Grade 10-B',
    joiningDate: new Date('2021-11-20'),
    monthlySalary: 4400,
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
    joiningDate: new Date('2019-08-01'),
    monthlySalary: 5200,
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
    classTeacherOf: 'Nursery',
    joiningDate: new Date('2023-08-15'),
    monthlySalary: 4200,
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
    classTeacherOf: 'Grade 5',
    joiningDate: new Date('2020-01-15'),
    monthlySalary: 4600,
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
    joiningDate: new Date('2018-05-10'),
    monthlySalary: 7500,
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
    joiningDate: new Date('2019-10-01'),
    monthlySalary: 6000,
    paidSalary: 0,
    remainingSalary: 6000,
    paymentDate: '',
    paymentStatus: 'Pending'
  }
];

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
    resolutionNotes: 'Scholarship reviewed. Guidelines signed off.'
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
    resolutionNotes: ''
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
    resolutionNotes: ''
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
    remarks: 'Get well soon, Liam. Stay hydrated.'
  },
  {
    id: 'LV-90281',
    applicantName: 'Mr. Marcus Davis',
    applicantRole: 'Teacher',
    applicantClass: 'Math Dept',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    leaveType: 'Casual Leave',
    reason: 'Attending regional mathematics education summit.',
    assignedTo: 'Ms. Clara Vance',
    status: 'Pending',
    remarks: ''
  }
];

const INITIAL_EMAILS = [
  {
    to: 'liam.chen@school.edu',
    subject: 'Appointment Booked - PENDING approval - APT-98271',
    body: 'Hi Liam Chen,\n\nYour appointment with Principal (Dr. Adrian Vance) has been booked successfully.\n\nBooking ID: APT-98271\nDate: 2026-06-02\nTime: 10:00 AM\nPurpose: Discussing Academic Scholarship requirements.\n\nStatus: PENDING PRINCIPAL APPROVAL.\n\nYou will receive a calendar invite once approved.',
    sender: 'School Automation <no-reply@school.edu>',
    date: '2026-05-29T10:15:00Z',
    isRead: false
  },
  {
    to: 'liam.chen@school.edu',
    subject: 'Appointment APPROVED & Google Calendar Invite - APT-98271',
    body: 'Hi Liam Chen,\n\nWe are pleased to inform you that your appointment with Principal (Dr. Adrian Vance) has been APPROVED.\n\nBooking ID: APT-98271\nDate: 2026-06-02\nTime: 10:00 AM\nGoogle Calendar Event ID: gcal_evt_98271a\n\nA Google Calendar invitation has been automatically added to your calendar at liam.chen@school.edu. Please accept the invitation.',
    sender: 'Google Calendar Sync <calendar-notification@school.edu>',
    date: '2026-05-29T11:30:00Z',
    isRead: false
  }
];

const INITIAL_PAYMENTS = [
  {
    id: 'PAY-10029',
    userName: 'Sarah Smith',
    role: 'Parent',
    paymentType: 'Bus Fee',
    amount: 150,
    date: '2026-05-28',
    status: 'PAID',
    transactionId: 'tx_pay_10029a'
  },
  {
    id: 'PAY-30812',
    userName: 'Mr. Marcus Davis',
    role: 'Teacher',
    paymentType: 'Teacher Salary',
    amount: 4500,
    date: '2026-05-25',
    status: 'PAID',
    transactionId: 'tx_salary_30812b'
  }
];

const INITIAL_NOTICES = [
  {
    title: 'Final Term Exams Roster Out',
    content: 'The administrative desk has finalized the seating and timetable grids for Grade 9 through 12 exams. Roster is posted in notices lobby.',
    audience: 'All',
    date: '2026-06-01',
    createdBy: 'Mrs. Janet Finch'
  },
  {
    title: 'Staff Meeting: Syllabus Check',
    content: 'A mandatory review of mid-term syllabus progress will take place in the Principal conference hall on Thursday 3:00 PM.',
    audience: 'Teachers',
    date: '2026-05-31',
    createdBy: 'Dr. Adrian Vance'
  }
];

const INITIAL_HOMEWORK = [
  {
    class: 'Grade 11-A',
    subject: 'Mathematics',
    title: 'Advanced Calculus Assignment 4',
    description: 'Solve questions 1 through 15 on Chapter 7: Definite Integration. Show complete steps.',
    dueDate: '2026-06-08',
    createdBy: 'Mr. Marcus Davis',
    submissions: [
      {
        studentId: 'STD-88201',
        studentName: 'Liam Chen',
        submissionDate: '2026-06-02',
        status: 'Submitted',
        submissionText: 'Solved chapters equations: Int_0^pi sin(x) dx = 2. Solutions complete.',
        grade: '',
        remarks: ''
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log('Seed: Connecting to MongoDB...');
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/school_automation',
      {
        serverSelectionTimeoutMS: 5000 // fail fast in 5 seconds
      }
    );
    console.log('Seed: Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Class.deleteMany();
    await Attendance.deleteMany();
    await Fee.deleteMany();
    await Exam.deleteMany();
    await Result.deleteMany();
    await Notice.deleteMany();
    await Homework.deleteMany();
    await Appointment.deleteMany();
    await Query.deleteMany();
    await Complaint.deleteMany();
    await Leave.deleteMany();
    await Email.deleteMany();
    await AuditLog.deleteMany();
    await Notification.deleteMany();

    console.log('Seed: Cleared all collections.');

    // 1. Seed Users
    await User.create(INITIAL_USERS);
    console.log('Seed: Seeded default users.');

    // 2. Seed Students
    await Student.create(INITIAL_STUDENTS);
    console.log('Seed: Seeded default students.');

    // 3. Seed Teachers/Staff
    await Teacher.create(INITIAL_STAFF);
    console.log('Seed: Seeded default staff.');

    // 4. Seed Appointments
    await Appointment.create(INITIAL_APPOINTMENTS);
    console.log('Seed: Seeded appointments.');

    // 5. Seed Queries
    await Query.create(INITIAL_QUERIES);
    console.log('Seed: Seeded queries.');

    // 6. Seed Complaints
    await Complaint.create(INITIAL_COMPLAINTS);
    console.log('Seed: Seeded complaints.');

    // 7. Seed Leaves
    await Leave.create(INITIAL_LEAVES);
    console.log('Seed: Seeded leaves.');

    // 8. Seed Emails
    await Email.create(INITIAL_EMAILS);
    console.log('Seed: Seeded virtual emails.');

    // 9. Seed Payments
    await Fee.create(INITIAL_PAYMENTS);
    console.log('Seed: Seeded financial payments.');

    // 10. Seed Notices
    await Notice.create(INITIAL_NOTICES);
    console.log('Seed: Seeded notices.');

    // 11. Seed Homework
    await Homework.create(INITIAL_HOMEWORK);
    console.log('Seed: Seeded homework assignments.');

    // 12. Create Classes dynamically
    await Class.create([
      { name: 'Grade 11-A', section: 'A', subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'] },
      { name: 'Grade 12-A', section: 'A', subjects: ['Mathematics', 'Physics', 'Biology', 'English'] },
      { name: 'Grade 10-B', section: 'B', subjects: ['Science', 'Social Studies', 'English', 'Math'] },
      { name: 'Grade 5', section: 'A', subjects: ['Science', 'Mathematics', 'English'] },
      { name: 'Nursery', section: 'A', subjects: ['English', 'Drawing', 'Play'] }
    ]);
    console.log('Seed: Seeded class designations.');

    // 13. Create an initial Exam
    const exam = await Exam.create({
      name: 'Math Midterm Exam 2026',
      class: 'Grade 11-A',
      subject: 'Mathematics',
      date: '2026-05-24',
      maxMarks: 100
    });

    // 14. Create a Result
    const student = await Student.findOne({ id: 'STD-88201' });
    await Result.create({
      student: student._id,
      studentId: student.id,
      studentName: student.name,
      class: 'Grade 11-A',
      exam: exam._id,
      examName: exam.name,
      subject: exam.subject,
      marksObtained: 88,
      maxMarks: 100,
      grade: 'A',
      remarks: 'Strong display in calculus sections.'
    });
    console.log('Seed: Seeded exam schedules and result transcripts.');

    // 15. Create Audit log
    await AuditLog.create({
      id: 'LOG-001',
      timestamp: new Date().toISOString(),
      user: 'Mrs. Janet Finch',
      role: 'Admin Staff',
      action: 'Seeded core database via CLI',
      details: 'Populated all 14 schema tables with fresh mock details.'
    });

    console.log('Database Seeded Successfully! ✓');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
