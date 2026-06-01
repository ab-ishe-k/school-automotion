import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import Modal from '../components/Modal';
import { 
  PlusCircle, 
  Calendar, 
  MessageSquare, 
  AlertTriangle, 
  History, 
  Trash2, 
  RefreshCw,
  Clock
} from 'lucide-react';

const StudentDashboard = ({ activeSection, setActiveSection }) => {
  const { 
    appointments, 
    queries, 
    complaints, 
    students,
    staff,
    leaves,
    applyLeave,
    bookAppointment, 
    cancelAppointment, 
    rescheduleAppointment,
    raiseQuery, 
    submitComplaint 
  } = useDatabase();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('tickets'); // tickets, book, query, complaint, leaves

  // Sync sidebar clicks with internal dashboard tabs
  useEffect(() => {
    if (!activeSection) return;
    if (activeSection === 'dashboard') {
      setActiveTab('tickets');
    } else if (activeSection === 'appointments') {
      setActiveTab('book');
    } else if (activeSection === 'queries') {
      setActiveTab('query');
    } else if (activeSection === 'complaints') {
      setActiveTab('complaint');
    } else if (activeSection === 'leaves') {
      setActiveTab('leaves');
    }
  }, [activeSection]);
  
  // Reschedule state
  const [selectedRescheduleApt, setSelectedRescheduleApt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // 1. FORM STATES
  // Appointment Form
  const [aptDept, setAptDept] = useState('Teachers');
  const [aptWith, setAptWith] = useState('Mr. Marcus Davis (Math Teacher)');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('');
  const [aptPurpose, setAptPurpose] = useState('');

  // Query Form
  const [queryCategory, setQueryCategory] = useState('Academics');
  const [querySubject, setQuerySubject] = useState('');
  const [queryDesc, setQueryDesc] = useState('');

  // Complaint Form
  const [compType, setCompType] = useState('Infrastructure');
  const [compDesc, setCompDesc] = useState('');

  // Leave Form
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [leaveReason, setLeaveReason] = useState('');

  // 2. FILTER STUDENT'S RECORDS
  const studentName = currentUser.name;
  const studentApts = appointments.filter(a => a.userName === studentName);
  const studentQueries = queries.filter(q => q.raisedBy === studentName);
  const studentComplaints = complaints.filter(c => c.submittedBy === studentName);
  const studentLeaves = (leaves || []).filter(l => l.applicantName === studentName);

  // Find student's own record for fee status warning alerts
  const studentRecord = students.find(s => s.name === studentName) || { feeStatus: 'Outstanding' };

  // Stats Summary
  const stats = {
    totalAppointments: studentApts.length,
    pendingAppointments: studentApts.filter(a => a.status === 'PENDING').length,
    totalQueries: studentQueries.length,
    resolvedQueries: studentQueries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length,
    totalComplaints: studentComplaints.length,
    escalatedComplaints: studentComplaints.filter(c => c.isEscalated).length
  };

  // Staff listing helper
  const getStaffForDept = (dept) => {
    if (dept === 'Principal') {
      const p = staff.find(s => s.role === 'Principal');
      return p ? [`Principal (${p.name})`] : ['Principal (Dr. Adrian Vance)'];
    }
    if (dept === 'Counselor') {
      const c = staff.find(s => s.role === 'Counselor') || staff.find(s => s.designation?.toLowerCase().includes('counselor'));
      return c ? [`${c.name} (${c.designation})`] : ['Ms. Clara Thorne (Counselor)'];
    }
    if (dept === 'Accounts department') {
      const a = staff.find(s => s.department === 'Accounts Dept' || s.department?.toLowerCase().includes('account'));
      return a ? [`${a.name} (${a.designation})`] : ['Mrs. Janet Finch (Accounts Manager)'];
    }
    if (dept === 'Admin office') {
      const a = staff.find(s => s.role === 'Admin Staff' || s.department?.toLowerCase().includes('admin'));
      return a ? [`${a.name} (${a.designation})`] : ['Admin Staff (Ms. Lee)'];
    }
    if (dept === 'Teachers') {
      const teachers = staff.filter(s => s.role === 'Teacher');
      if (teachers.length > 0) {
        return teachers.map(t => `${t.name} (${t.designation})`);
      }
      return ['Mr. Marcus Davis (Math Teacher)'];
    }
    return ['Office Desk (Mr. Alan)'];
  };

  const handleBookApt = (e) => {
    e.preventDefault();
    if (!aptDate || !aptTime || !aptPurpose) return;
    bookAppointment({
      department: aptDept,
      appointmentWith: aptWith,
      date: aptDate,
      time: aptTime,
      purpose: aptPurpose
    }, currentUser);

    setAptDate('');
    setAptTime('');
    setAptPurpose('');
    setActiveTab('tickets');
  };

  const handleRaiseQuery = (e) => {
    e.preventDefault();
    if (!querySubject || !queryDesc) return;
    raiseQuery({
      category: queryCategory,
      subject: querySubject,
      description: queryDesc
    }, currentUser);

    setQuerySubject('');
    setQueryDesc('');
    setActiveTab('tickets');
  };

  const handleComplaint = (e) => {
    e.preventDefault();
    if (!compDesc) return;
    submitComplaint({
      complaintType: compType,
      description: compDesc
    }, currentUser);

    setCompDesc('');
    setActiveTab('tickets');
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) return;
    applyLeave({
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      leaveType: leaveType,
      reason: leaveReason
    }, currentUser);

    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveType('Sick Leave');
    setLeaveReason('');
    setActiveTab('tickets');
  };

  const handleCancelApt = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment slot?")) {
      cancelAppointment(id, currentUser);
    }
  };

  const handleRescheduleSubmit = () => {
    if (!newDate || !newTime) return;
    rescheduleAppointment(selectedRescheduleApt.id, newDate, newTime, currentUser);
    setSelectedRescheduleApt(null);
  };

  return (
    <div className="dashboard-viewport">
      {/* Dynamic Unpaid Dues Alerts Banner */}
      {studentRecord.feeStatus !== 'Paid' && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '14px 20px', 
            marginBottom: '20px', 
            borderLeft: '5px solid var(--danger)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.06), transparent)' 
          }}
        >
          <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            <strong style={{ color: 'var(--danger)' }}>BILLING DUES ALERT WARNING:</strong> Your quarterly tuition fees are currently <strong style={{ textTransform: 'uppercase' }}>{studentRecord.paymentStatus || studentRecord.feeStatus}</strong> (Pending Balance: ${studentRecord.pendingAmount || 0}, Tuition: ${studentRecord.monthlyTuitionFee || 0}, Bus Fee: ${studentRecord.busFee || 0}, Extra-Curricular Fee: ${studentRecord.monthlyExtraCurricularFee || 0}). Please remind your parent ({studentRecord.parentName || 'Parent'}) to log into the parent portal and clear the outstanding fees.
          </div>
        </div>
      )}

      <DashboardCards stats={stats} />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px', overflowX: 'auto' }}>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'tickets' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'tickets' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap'
          }}
          onClick={() => { setActiveTab('tickets'); setActiveSection && setActiveSection('dashboard'); }}
        >
          My Tickets & History
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'book' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'book' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap'
          }}
          onClick={() => { setActiveTab('book'); setActiveSection && setActiveSection('appointments'); }}
        >
          Book Consultation Slot
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'query' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'query' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap'
          }}
          onClick={() => { setActiveTab('query'); setActiveSection && setActiveSection('queries'); }}
        >
          Raise Query Ticket
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'complaint' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'complaint' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap'
          }}
          onClick={() => { setActiveTab('complaint'); setActiveSection && setActiveSection('complaints'); }}
        >
          Lodge Infrastructure Grievance
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'leaves' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'leaves' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap'
          }}
          onClick={() => { setActiveTab('leaves'); setActiveSection && setActiveSection('leaves'); }}
        >
          Leave Application Desk
        </button>
      </div>

      {/* A. MY TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Appointments card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--primary-light)' }} />
              My Appointment Booking Logs
            </h3>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Consultation With</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Calendar Event</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentApts.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                        No appointments booked. Select the "Book Consultation" tab above to get started.
                      </td>
                    </tr>
                  ) : (
                    studentApts.map(apt => (
                      <tr key={apt.id}>
                        <td style={{ fontWeight: '700' }}>{apt.id}</td>
                        <td style={{ fontWeight: '600' }}>{apt.appointmentWith}</td>
                        <td>{apt.date}</td>
                        <td style={{ color: 'var(--primary-light)', fontWeight: '600' }}>{apt.time}</td>
                        <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={apt.purpose}>
                          {apt.purpose}
                        </td>
                        <td>
                          <span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{apt.calendarEventId || '—'}</td>
                        <td>
                          {apt.status !== 'CANCELLED' && apt.status !== 'REJECTED' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--warning)', borderColor: 'var(--warning)' }}
                                onClick={() => { setSelectedRescheduleApt(apt); setNewDate(''); setNewTime(''); }}
                              >
                                <RefreshCw size={11} />
                                Reschedule
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                onClick={() => handleCancelApt(apt.id)}
                              >
                                <Trash2 size={11} />
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grid for Raised Queries & Complaints */}
          <div className="responsive-grid-2">
            {/* Queries block */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} style={{ color: 'var(--success)' }} />
                My Query / Ticket Logs
              </h3>

              {studentQueries.length === 0 ? (
                <p style={{ padding: '30px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  No queries raised. Raise academic timetabling or certificate concerns in the tab above.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                  {studentQueries.map(q => (
                    <div key={q.id} style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>{q.id}</span>
                        <span className={`status-badge ${q.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '9px', padding: '2px 6px' }}>{q.status}</span>
                      </div>
                      <h4 style={{ fontSize: '13px', fontWeight: '700' }}>{q.subject}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Assigned to: {q.assignedTo}</p>
                      {q.resolution && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--success)', fontWeight: '600' }}>
                          ✔ Resolution: "{q.resolution}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complaints block */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
                My Lodged Grievance Logs
              </h3>

              {studentComplaints.length === 0 ? (
                <p style={{ padding: '30px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  No complaints logged. Thank you for helping keep High School infrastructure safe.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                  {studentComplaints.map(c => (
                    <div key={c.id} style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '12px', color: 'var(--danger)' }}>{c.id}</span>
                        <span className={`status-badge ${c.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '9px', padding: '2px 6px' }}>{c.status}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Type: <strong>{c.complaintType}</strong></p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{c.description}"</p>
                      {c.actionTaken && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--info)', fontWeight: '600' }}>
                          ⚡ Action Taken: "{c.actionTaken}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. BOOK CONSULTATION SLOT TAB */}
      {activeTab === 'book' && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Schedule a Consultation Appointment</h3>
          
          <form onSubmit={handleBookApt}>
            <div className="form-grid">
              <div className="form-group">
                <label>Select Office / Department</label>
                <select 
                  className="filter-input" 
                  value={aptDept}
                  onChange={e => {
                    const dept = e.target.value;
                    setAptDept(dept);
                    setAptWith(getStaffForDept(dept)[0]);
                  }}
                >
                  <option value="Teachers">Instructors / Faculty</option>
                  <option value="Principal">Executive Principal Vance</option>
                  <option value="Counselor">Counselor Cell</option>
                  <option value="Accounts department">Accounts office</option>
                  <option value="Admin office">Administration Desk</option>
                </select>
              </div>

              <div className="form-group">
                <label>Consultation With</label>
                <select 
                  className="filter-input"
                  value={aptWith}
                  onChange={e => setAptWith(e.target.value)}
                >
                  {getStaffForDept(aptDept).map(staff => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={aptDate}
                  onChange={e => setAptDate(e.target.value)}
                  min="2026-06-01"
                  max="2026-06-30"
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Available Time Slot</label>
                <select 
                  className="filter-input"
                  value={aptTime}
                  onChange={e => setAptTime(e.target.value)}
                  required
                >
                  <option value="">Choose slot</option>
                  <option value="09:00 AM">09:00 AM (Available)</option>
                  <option value="10:00 AM">10:00 AM (Available)</option>
                  <option value="11:30 AM">11:30 AM (Available)</option>
                  <option value="01:30 PM">01:30 PM (Available)</option>
                  <option value="02:30 PM">02:30 PM (Available)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Purpose / Topic of Conversation</label>
              <textarea 
                className="form-input"
                style={{ minHeight: '100px' }}
                placeholder="e.g. Remedial exam clarification. Required to understand vector maths syllabus questions."
                value={aptPurpose}
                onChange={e => setAptPurpose(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Book Appointment & Sync Calendar
            </button>
          </form>
        </div>
      )}

      {/* C. RAISE QUERY TICKET TAB */}
      {activeTab === 'query' && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Raise an Academic or Administrative Ticket</h3>
          
          <form onSubmit={handleRaiseQuery}>
            <div className="form-grid">
              <div className="form-group">
                <label>Ticket Category</label>
                <select 
                  className="filter-input"
                  value={queryCategory}
                  onChange={e => setQueryCategory(e.target.value)}
                >
                  <option value="Academics">Academics (Syllabus/Classes)</option>
                  <option value="Exams">Exams & Term Grading</option>
                  <option value="Timetable">Timetable overlaps</option>
                  <option value="Certificates">Certificates & Transcripts</option>
                  <option value="Transport">Bus routing grievances</option>
                  <option value="Technical support">IT & Portal helpdesk</option>
                </select>
              </div>

              <div className="form-group">
                <label>Short Subject Title</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Midterm marks mismatch"
                  value={querySubject}
                  onChange={e => setQuerySubject(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Detailed Description of Concern</label>
              <textarea 
                className="form-input"
                style={{ minHeight: '120px' }}
                placeholder="Write your issue details here so officers can troubleshoot."
                value={queryDesc}
                onChange={e => setQueryDesc(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-success" style={{ width: '100%', color: 'white' }}>
              Submit Ticket Row to Google Sheets
            </button>
          </form>
        </div>
      )}

      {/* D. SUBMIT COMPLAINT TAB */}
      {activeTab === 'complaint' && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--danger)' }}>Lodge an Infrastructure or Disciplinary Grievance</h3>
          
          <form onSubmit={handleComplaint}>
            <div className="form-group">
              <label>Grievance Type</label>
              <select 
                className="filter-input"
                value={compType}
                onChange={e => setCompType(e.target.value)}
              >
                <option value="Infrastructure">Infrastructure (AC/Leak/Desks)</option>
                <option value="Student behavior">Student behavior / corridor shouting</option>
                <option value="Administration">Administrative delay</option>
                <option value="Transport">Bus safety / delays</option>
                <option value="Teacher issue">Teacher conduct concern</option>
              </select>
            </div>

            <div className="form-group">
              <label>Grievance Details (Confidential & Secure)</label>
              <textarea 
                className="form-input"
                style={{ minHeight: '120px' }}
                placeholder="Describe the incident or issue. Grievances can be escalated directly to the Principal."
                value={compDesc}
                onChange={e => setCompDesc(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
              Submit Grievance to Safety Officer
            </button>
          </form>
        </div>
      )}

      {/* E. LEAVE APPLICATION DESK TAB */}
      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="responsive-grid-2">
            {/* Form to Apply for Leave */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} style={{ color: 'var(--primary-light)' }} />
                Submit New Leave Application
              </h3>

              {(() => {
                const stdRecord = students.find(s => s.name === currentUser.name);
                const studentClass = stdRecord ? stdRecord.class : 'Grade 11-A';
                const classTeacher = staff.find(s => s.classTeacherOf === studentClass);
                const classTeacherName = classTeacher ? classTeacher.name : 'Mr. Marcus Davis';
                return (
                  <div style={{ marginBottom: '18px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '12.5px', border: '1px solid var(--border-color)' }}>
                    <div>🏫 My Registered Class: <strong>{studentClass}</strong></div>
                    <div style={{ marginTop: '4px' }}>🧑‍🏫 Assigned Class Teacher: <strong>{classTeacherName}</strong></div>
                    <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      *Note: Student leave applications are automatically routed to your assigned class teacher for approval.
                    </div>
                  </div>
                );
              })()}

              <form onSubmit={handleApplyLeave}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={leaveStartDate}
                      onChange={e => setLeaveStartDate(e.target.value)}
                      min="2026-06-01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={leaveEndDate}
                      onChange={e => setLeaveEndDate(e.target.value)}
                      min={leaveStartDate || '2026-06-01'}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Leave Category / Type</label>
                    <select 
                      className="filter-input"
                      value={leaveType}
                      onChange={e => setLeaveType(e.target.value)}
                    >
                      <option value="Sick Leave">Sick Leave (Medical recovery)</option>
                      <option value="Casual Leave">Casual Leave (Personal affairs)</option>
                      <option value="Family Event">Family Event / Function</option>
                      <option value="Medical Emergency">Medical Emergency</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Reason for Leave Request</label>
                  <textarea 
                    className="form-input"
                    style={{ minHeight: '100px' }}
                    placeholder="Provide a clear description or doctor notes details..."
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Leave Request to Class Teacher
                </button>
              </form>
            </div>

            {/* Leave History List */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} style={{ color: 'var(--success)' }} />
                Leave Request Logs & Status
              </h3>

              {studentLeaves.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  No leave requests submitted yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
                  {studentLeaves.map(lv => (
                    <div key={lv.id} style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '12.5px', color: 'var(--primary-light)' }}>{lv.id} - {lv.leaveType}</span>
                        <span className={`status-badge ${lv.status.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 8px' }}>{lv.status}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        📅 Duration: <strong>{lv.startDate}</strong> to <strong>{lv.endDate}</strong>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '6px' }}>
                        "{lv.reason}"
                      </p>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                        👤 Routed Approver: <strong>{lv.assignedTo}</strong>
                      </div>
                      {lv.remarks && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'var(--info-bg)', borderRadius: '4px', fontSize: '11.5px', color: 'var(--primary-light)', fontWeight: '500' }}>
                          💬 Remarks: "{lv.remarks}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      <Modal
        isOpen={selectedRescheduleApt !== null}
        onClose={() => setSelectedRescheduleApt(null)}
        title="Reschedule Appointment Time Slot"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelectedRescheduleApt(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRescheduleSubmit}>Apply Reschedule</button>
          </>
        }
      >
        {selectedRescheduleApt && (
          <div className="form-grid">
            <div className="form-group">
              <label>New Consultation Date</label>
              <input 
                type="date" 
                className="form-input"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                min="2026-06-01"
                max="2026-06-30"
              />
            </div>

            <div className="form-group">
              <label>New Slot</label>
              <select 
                className="filter-input"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
              >
                <option value="">Select slot</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="01:30 PM">01:30 PM</option>
                <option value="02:30 PM">02:30 PM</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDashboard;
