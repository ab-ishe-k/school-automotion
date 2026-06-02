import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Fee from '../models/Fee.js';
import Attendance from '../models/Attendance.js';
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

import { logActivity, notifyUser, sendSimulatedEmail } from './authController.js';

// ==========================================
// 1. DATA SYNCHRONIZERS (GET ALL DATA BUNDLE)
// ==========================================

export const getAllDataBundle = async (req, res, next) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    const queries = await Query.find().sort({ createdAt: -1 });
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    const virtualEmails = await Email.find().sort({ createdAt: -1 });
    const auditLogs = await AuditLog.find().sort({ createdAt: -1 });
    const payments = await Fee.find().sort({ createdAt: -1 });
    const students = await Student.find().sort({ name: 1 });
    const staff = await Teacher.find().sort({ name: 1 });
    const leaves = await Leave.find().sort({ createdAt: -1 });
    const notifications = await Notification.find().sort({ createdAt: -1 });
    const notices = await Notice.find().sort({ date: -1 });
    const homework = await Homework.find().sort({ dueDate: -1 });
    const exams = await Exam.find().sort({ date: -1 });
    const results = await Result.find().sort({ createdAt: -1 });
    const users = await User.find({ isSetupCompleted: false }); // for temporary onboarding copy dropdown

    res.status(200).json({
      success: true,
      data: {
        appointments,
        queries,
        complaints,
        virtualEmails,
        auditLogs,
        payments,
        students,
        staff,
        leaves,
        notifications,
        notices,
        homework,
        exams,
        results,
        users
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 2. APPOINTMENT MANAGEMENT
// ==========================================

export const bookAppointment = async (req, res, next) => {
  try {
    const { appointmentWith, department, date, time, purpose } = req.body;
    const currentUser = req.user;

    const bookingId = `APT-${Math.floor(10000 + Math.random() * 90000)}`;
    const isPrincipal = department === 'Principal';

    const newBooking = await Appointment.create({
      id: bookingId,
      userName: currentUser.name,
      userRole: currentUser.role,
      appointmentWith,
      department,
      date,
      time,
      purpose,
      status: isPrincipal ? 'PENDING' : 'APPROVED',
      calendarEventId: isPrincipal ? '' : `gcal_evt_${Math.floor(100000 + Math.random() * 900000)}`,
      resolutionNotes: ''
    });

    await logActivity(
      currentUser.name,
      currentUser.role,
      `Booked Appointment with ${appointmentWith} (${bookingId})`,
      `Created Appointment entry. Status: ${newBooking.status}.`
    );

    const emailBody = `Hi ${currentUser.name},\n\nYour appointment with ${appointmentWith} has been logged in the system.\n\nBooking ID: ${bookingId}\nDate: ${date}\nTime: ${time}\nPurpose: ${purpose}\n\nStatus: ${newBooking.status}.\n${
      isPrincipal 
        ? 'Since this is with the Principal, it is currently PENDING approval. You will receive an update shortly.' 
        : `This has been AUTO-APPROVED. Google Calendar Event ID: ${newBooking.calendarEventId} has been added.`
    }`;
    await sendSimulatedEmail(currentUser.email, `Appointment Booked - ${newBooking.status} - ID: ${bookingId}`, emailBody);
    await notifyUser(`New appointment booking logged: ${bookingId}`, 'success');

    res.status(201).json({ success: true, data: newBooking });
  } catch (err) {
    next(err);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, newDate, newTime, action } = req.body;
    const currentUser = req.user;

    let appointment = await Appointment.findOne({ id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (action === 'approve') {
      const calendarEvtId = `gcal_evt_${Math.floor(100000 + Math.random() * 900000)}`;
      appointment.status = 'APPROVED';
      appointment.calendarEventId = calendarEvtId;
      appointment.resolutionNotes = resolutionNotes || '';
      await appointment.save();

      await logActivity(currentUser.name, currentUser.role, `Approved Appointment ${id}`, `Created Google Calendar Event: ${calendarEvtId}`);
      await notifyUser(`Appointment ${id} approved.`, 'success');

      const emailBody = `Hi ${appointment.userName},\n\nYour appointment with ${appointment.appointmentWith} has been APPROVED.\n\nBooking ID: ${id}\nGoogle Calendar Event ID: ${calendarEvtId}\n\nNotes from Approver:\n${resolutionNotes || 'No notes provided.'}`;
      await sendSimulatedEmail(appointment.userName.toLowerCase().replace(/\s+/g, '.') + '@school.edu', `Appointment APPROVED & Calendar Event Added - ID: ${id}`, emailBody);
    } 
    else if (action === 'reject') {
      appointment.status = 'REJECTED';
      appointment.resolutionNotes = resolutionNotes || 'Rejected by authority';
      await appointment.save();

      await logActivity(currentUser.name, currentUser.role, `Rejected Appointment ${id}`, `Set status to REJECTED.`);
      await notifyUser(`Appointment ${id} has been rejected.`, 'warning');

      const emailBody = `Hi ${appointment.userName},\n\nYour appointment with ${appointment.appointmentWith} was REJECTED.\n\nReason/Remarks:\n${resolutionNotes || 'Rejected by authority'}`;
      await sendSimulatedEmail(appointment.userName.toLowerCase().replace(/\s+/g, '.') + '@school.edu', `Appointment REJECTED - ID: ${id}`, emailBody);
    }
    else if (action === 'reschedule') {
      appointment.date = newDate;
      appointment.time = newTime;
      appointment.status = 'PENDING';
      await appointment.save();

      await logActivity(currentUser.name, currentUser.role, `Rescheduled Appointment ${id}`, `New Date: ${newDate}, Time: ${newTime}. Re-routing for principal approval.`);
      await notifyUser(`Appointment rescheduled to ${newDate}. Pending approval.`, 'info');

      const emailBody = `Hi Principal Vance,\n\nLiam Chen has requested to reschedule Appointment ${id} to ${newDate} at ${newTime}.\n\nPlease review this in the Management Dashboard.`;
      await sendSimulatedEmail('vance.principal@school.edu', `Reschedule Request - ID: ${id}`, emailBody);
    }
    else if (action === 'cancel') {
      appointment.status = 'REJECTED';
      appointment.resolutionNotes = 'Cancelled by applicant';
      await appointment.save();

      await logActivity(currentUser.name, currentUser.role, `Cancelled Appointment ${id}`, `Applicant triggered cancellation.`);
      await notifyUser(`Appointment ${id} cancelled.`, 'info');
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 3. STUDENT & TEACHER REGISTRATIONS
// ==========================================

export const registerStudent = async (req, res, next) => {
  try {
    const { name, email, className, rollNumber, parentName, parentEmail, parentContact, monthlyTuitionFee, busFee, monthlyExtraCurricularFee } = req.body;
    const currentUser = req.user;

    const studentId = `STD-${Math.floor(10000 + Math.random() * 90000)}`;
    const tempId = `TEMP-STD-${Math.floor(10000 + Math.random() * 90000)}`;
    const tempPassword = `Demo-STD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Calculate fees
    const tuition = Number(monthlyTuitionFee) || 0;
    const bus = Number(busFee) || 0;
    const extra = Number(monthlyExtraCurricularFee) || 0;
    const total = tuition + bus + extra;

    // Create User record for auth
    const newUser = await User.create({
      name,
      email,
      role: 'Student',
      tempId,
      tempPassword,
      isSetupCompleted: false,
      linkedStudentName: name,
      description: `Student of class ${className}. Registered by Admin Staff.`
    });

    // Create Student record
    const newStudent = await Student.create({
      id: studentId,
      name,
      email,
      class: className,
      rollNumber,
      parentName,
      parentEmail,
      parentContact,
      monthlyTuitionFee: tuition,
      busFee: bus,
      monthlyExtraCurricularFee: extra,
      totalMonthlyFee: total,
      paidAmount: 0,
      pendingAmount: total,
      pendingMonths: 1,
      paymentStatus: 'Pending',
      remindersActive: true
    });

    // Create Parent User record
    const parentTempId = `TEMP-PAR-${Math.floor(10000 + Math.random() * 90000)}`;
    const parentTempPassword = `Demo-PAR-${Math.floor(1000 + Math.random() * 9000)}`;
    await User.create({
      name: parentName,
      email: parentEmail,
      role: 'Parent',
      tempId: parentTempId,
      tempPassword: parentTempPassword,
      isSetupCompleted: false,
      linkedStudentName: name,
      description: `Parent of student ${name}. Registered by Admin Staff.`
    });

    await logActivity(currentUser.name, currentUser.role, `Registered Student ${name} & Parent`, `Generated temp credentials in User collections.`);
    await notifyUser(`New student ${name} enrolled. Class: ${className}`, 'success');

    // Send onboarding emails
    await sendSimulatedEmail(email, `🏫 HighSchool ERP: Student Gateway Account Generated`, `Welcome ${name},\n\nYour portal account is active. Log in with:\nTemp ID: ${tempId}\nTemp Password: ${tempPassword}\n\nComplete onboarding to create a permanent username!`);
    await sendSimulatedEmail(parentEmail, `🏫 HighSchool ERP: Parent Gateway Account Generated`, `Welcome ${parentName},\n\nYour parent portal account is active. Log in with:\nTemp ID: ${parentTempId}\nTemp Password: ${parentTempPassword}`);

    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    next(err);
  }
};

export const registerTeacher = async (req, res, next) => {
  try {
    const { name, email, phone, designation, department, classTeacherOf, monthlySalary } = req.body;
    const currentUser = req.user;

    const teacherId = `STF-${Math.floor(10000 + Math.random() * 90000)}`;
    const tempId = `TEMP-TCH-${Math.floor(10000 + Math.random() * 90000)}`;
    const tempPassword = `Demo-TCH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create User record for auth
    await User.create({
      name,
      email,
      role: 'Teacher',
      tempId,
      tempPassword,
      isSetupCompleted: false,
      description: `${designation} in ${department}. Registered by Admin.`
    });

    // Create Teacher record
    const newTeacher = await Teacher.create({
      id: teacherId,
      name,
      email,
      phone,
      designation,
      department,
      classTeacherOf: classTeacherOf || '',
      monthlySalary: Number(monthlySalary) || 0,
      paidSalary: 0,
      remainingSalary: Number(monthlySalary) || 0,
      paymentStatus: 'Pending'
    });

    await logActivity(currentUser.name, currentUser.role, `Registered Faculty ${name}`, `Created staff record ${teacherId} and generated temp credentials.`);
    await notifyUser(`New teacher ${name} registered. Designation: ${designation}`, 'success');

    await sendSimulatedEmail(email, `🏫 HighSchool ERP: Faculty Account Activated`, `Welcome ${name},\n\nYour faculty workspace account is active. Log in with:\nTemp ID: ${tempId}\nTemp Password: ${tempPassword}`);

    res.status(201).json({ success: true, data: newTeacher });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 4. FINANCIAL PAYMENT DESK
// ==========================================

export const payFee = async (req, res, next) => {
  try {
    const { studentId, amount, paymentType } = req.body;
    const currentUser = req.user;

    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const payAmt = Number(amount);
    const txId = `tx_pay_${Math.floor(10000 + Math.random() * 90000)}a`;

    // Create Fee payment entry
    const payment = await Fee.create({
      id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
      userName: student.parentName,
      role: 'Parent',
      paymentType,
      amount: payAmt,
      date: new Date().toISOString().split('T')[0],
      status: 'PAID',
      transactionId: txId
    });

    // Update student payment status
    student.paidAmount += payAmt;
    student.pendingAmount = Math.max(0, student.pendingAmount - payAmt);
    if (student.pendingAmount === 0) {
      student.paymentStatus = 'Paid';
      student.pendingMonths = 0;
      student.remindersActive = false;
    }
    student.paymentDate = new Date().toISOString().split('T')[0];
    await student.save();

    await logActivity(currentUser.name, currentUser.role, `Recorded Parent Fee Payment`, `Collected $${payAmt} for ${student.name}. TX ID: ${txId}`);
    await notifyUser(`Payment of $${payAmt} received for ${student.name}.`, 'success');

    const emailBody = `Dear ${student.parentName},\n\nWe confirm receipt of payment for ${student.name} (${student.class}).\n\nTransaction Details:\n- Payment Type: ${paymentType}\n- Amount Paid: $${payAmt}\n- Invoice/TX ID: ${txId}\n- Outstanding Balance: $${student.pendingAmount}\n\nThank you for processing your payments on time.`;
    await sendSimulatedEmail(student.parentEmail, `Receipt: Fee Payment Confirmed - ${student.name}`, emailBody);

    res.status(201).json({ success: true, data: { payment, student } });
  } catch (err) {
    next(err);
  }
};

export const payTeacherSalary = async (req, res, next) => {
  try {
    const { teacherId, amount } = req.body;
    const currentUser = req.user;

    const teacher = await Teacher.findOne({ id: teacherId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const payAmt = Number(amount);
    const txId = `tx_salary_${Math.floor(10000 + Math.random() * 90000)}b`;

    // Create Fee/Expense payment entry
    const payment = await Fee.create({
      id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
      userName: teacher.name,
      role: 'Teacher',
      paymentType: 'Teacher Salary',
      amount: payAmt,
      date: new Date().toISOString().split('T')[0],
      status: 'PAID',
      transactionId: txId
    });

    // Update teacher records
    teacher.paidSalary += payAmt;
    teacher.remainingSalary = Math.max(0, teacher.remainingSalary - payAmt);
    if (teacher.remainingSalary === 0) {
      teacher.paymentStatus = 'Paid';
    }
    teacher.paymentDate = new Date().toISOString().split('T')[0];
    await teacher.save();

    await logActivity(currentUser.name, currentUser.role, `Disbursed Faculty Salary`, `Paid $${payAmt} to ${teacher.name}. TX: ${txId}`);
    await notifyUser(`Salary of $${payAmt} disbursed to ${teacher.name}.`, 'success');

    const emailBody = `Hi ${teacher.name},\n\nWe have disbursed your salary of $${payAmt} for this month.\n\nTransaction ID: ${txId}\nJoining Date: ${teacher.joiningDate}\n\nSalary credited to your registered bank account.`;
    await sendSimulatedEmail(teacher.email, `Payroll Disbursed - ${teacher.name}`, emailBody);

    res.status(201).json({ success: true, data: { payment, teacher } });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 5. QUERY & COMPLAINT RESOLUTIONS
// ==========================================

export const raiseQuery = async (req, res, next) => {
  try {
    const { category, subject, description, assignedTo } = req.body;
    const currentUser = req.user;

    const queryId = `QRY-${Math.floor(10000 + Math.random() * 90000)}`;

    const newQuery = await Query.create({
      id: queryId,
      raisedBy: currentUser.name,
      role: currentUser.role,
      category,
      subject,
      description,
      assignedTo,
      date: new Date().toISOString(),
      status: 'Pending'
    });

    await logActivity(currentUser.name, currentUser.role, `Raised Academic Query`, `Query ID: ${queryId}. Subject: ${subject}`);
    await notifyUser(`New query raised: ${queryId}`, 'info');

    res.status(201).json({ success: true, data: newQuery });
  } catch (err) {
    next(err);
  }
};

export const updateQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    const currentUser = req.user;

    let query = await Query.findOne({ id });
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    query.status = status;
    if (resolution) {
      query.resolution = resolution;
    }
    if (status === 'Resolved') {
      query.closedDate = new Date().toISOString();
    }
    await query.save();

    await logActivity(currentUser.name, currentUser.role, `Updated Query status`, `Set status to ${status} for ${id}`);
    await notifyUser(`Query ${id} updated to ${status}.`, 'info');

    res.status(200).json({ success: true, data: query });
  } catch (err) {
    next(err);
  }
};

export const submitComplaint = async (req, res, next) => {
  try {
    const { complaintType, description, assignedOfficer } = req.body;
    const currentUser = req.user;

    const complaintId = `CMP-${Math.floor(10000 + Math.random() * 90000)}`;

    const newComplaint = await Complaint.create({
      id: complaintId,
      submittedBy: currentUser.name,
      role: currentUser.role,
      complaintType,
      description,
      assignedOfficer,
      date: new Date().toISOString(),
      status: 'Pending'
    });

    await logActivity(currentUser.name, currentUser.role, `Submitted Complaint`, `ID: ${complaintId}. Type: ${complaintType}`);
    await notifyUser(`New complaint logged: ${complaintId}`, 'warning');

    res.status(201).json({ success: true, data: newComplaint });
  } catch (err) {
    next(err);
  }
};

export const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, actionTaken, internalNotes, isEscalated } = req.body;
    const currentUser = req.user;

    let complaint = await Complaint.findOne({ id });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (actionTaken) complaint.actionTaken = actionTaken;
    if (internalNotes) complaint.internalNotes = internalNotes;
    if (isEscalated !== undefined) complaint.isEscalated = isEscalated;

    if (status === 'Resolved') {
      complaint.resolvedDate = new Date().toISOString();
    }
    await complaint.save();

    await logActivity(currentUser.name, currentUser.role, `Updated Complaint Status`, `Complaint ID: ${id}. Status set to: ${status}`);
    await notifyUser(`Complaint ${id} status: ${status}`, 'info');

    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 6. LEAVE REQUEST ACTIONS
// ==========================================

export const applyLeave = async (req, res, next) => {
  try {
    const { startDate, endDate, leaveType, reason, assignedTo } = req.body;
    const currentUser = req.user;

    const leaveId = `LV-${Math.floor(10000 + Math.random() * 90000)}`;

    const newLeave = await Leave.create({
      id: leaveId,
      applicantName: currentUser.name,
      applicantRole: currentUser.role,
      applicantClass: currentUser.linkedStudentName || 'Faculty',
      startDate,
      endDate,
      leaveType,
      reason,
      assignedTo,
      status: 'Pending',
      remarks: ''
    });

    await logActivity(currentUser.name, currentUser.role, `Applied for Leave`, `Leave ID: ${leaveId}. Dates: ${startDate} to ${endDate}`);
    await notifyUser(`Leave request submitted by ${currentUser.name}.`, 'info');

    res.status(201).json({ success: true, data: newLeave });
  } catch (err) {
    next(err);
  }
};

export const updateLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const currentUser = req.user;

    let leave = await Leave.findOne({ id });
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.remarks = remarks || '';
    await leave.save();

    await logActivity(currentUser.name, currentUser.role, `Reviewed Leave Request`, `Set status of ${id} to ${status}`);
    await notifyUser(`Leave request ${id} has been ${status.toLowerCase()}.`, 'success');

    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 7. SPREADSHEET ROW OPERATIONS (ADMIN GENERAL)
// ==========================================

export const updateSheetRow = async (req, res, next) => {
  try {
    const { sheetName, id } = req.params;
    const updates = req.body;
    const currentUser = req.user;

    let doc;
    if (sheetName === 'students') {
      doc = await Student.findOneAndUpdate({ id }, updates, { new: true });
    } else if (sheetName === 'staff') {
      doc = await Teacher.findOneAndUpdate({ id }, updates, { new: true });
    } else if (sheetName === 'appointments') {
      doc = await Appointment.findOneAndUpdate({ id }, updates, { new: true });
    } else if (sheetName === 'queries') {
      doc = await Query.findOneAndUpdate({ id }, updates, { new: true });
    } else if (sheetName === 'complaints') {
      doc = await Complaint.findOneAndUpdate({ id }, updates, { new: true });
    } else if (sheetName === 'leaves') {
      doc = await Leave.findOneAndUpdate({ id }, updates, { new: true });
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: `Record not found in ${sheetName}` });
    }

    await logActivity(currentUser.name, currentUser.role, `Modified Row in ${sheetName}`, `Updated fields for record ID: ${id}`);
    await notifyUser(`Updated row in sheet: ${sheetName}`, 'success');

    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

export const deleteSheetRow = async (req, res, next) => {
  try {
    const { sheetName, id } = req.params;
    const currentUser = req.user;

    let deleted = false;
    let doc;
    if (sheetName === 'students') {
      const student = await Student.findOneAndDelete({ id });
      if (student) {
        await User.findOneAndDelete({ email: student.email });
        await User.findOneAndDelete({ email: student.parentEmail });
        deleted = true;
      }
    } else if (sheetName === 'staff') {
      const teacher = await Teacher.findOneAndDelete({ id });
      if (teacher) {
        await User.findOneAndDelete({ email: teacher.email });
        deleted = true;
      }
    } else if (sheetName === 'appointments') {
      doc = await Appointment.findOneAndDelete({ id });
      deleted = !!doc;
    } else if (sheetName === 'queries') {
      doc = await Query.findOneAndDelete({ id });
      deleted = !!doc;
    } else if (sheetName === 'complaints') {
      doc = await Complaint.findOneAndDelete({ id });
      deleted = !!doc;
    } else if (sheetName === 'leaves') {
      doc = await Leave.findOneAndDelete({ id });
      deleted = !!doc;
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: `Record not found in ${sheetName}` });
    }

    await logActivity(currentUser.name, currentUser.role, `Deleted Record from ${sheetName}`, `Purged ID: ${id} from database.`);
    await notifyUser(`Record purged from sheet: ${sheetName}`, 'warning');

    res.status(200).json({ success: true, message: 'Purged record successfully' });
  } catch (err) {
    next(err);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.status(200).json({ success: true, message: 'Notifications cleared' });
  } catch (err) {
    next(err);
  }
};

// @desc    Simulate email sending
// @route   POST /api/dashboard/email/send
// @access  Private
export const sendEmailRoute = async (req, res, next) => {
  try {
    const { to, subject, body, sender } = req.body;
    await sendSimulatedEmail(to, subject, body, sender);
    res.status(200).json({ success: true, message: 'Simulated email sent successfully.' });
  } catch (err) {
    next(err);
  }
};
