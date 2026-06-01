import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import Modal from '../components/Modal';
import { 
  Calendar, 
  MessageSquare, 
  AlertTriangle, 
  Users, 
  Clock, 
  PlusCircle, 
  Trash2, 
  RefreshCw,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ParentDashboard = ({ activeSection, setActiveSection }) => {
  const { 
    appointments, 
    queries, 
    complaints, 
    students,
    staff,
    payFee,
    bookAppointment, 
    cancelAppointment, 
    rescheduleAppointment,
    raiseQuery, 
    submitComplaint 
  } = useDatabase();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('child-overview'); // child-overview, consultations, billing, log-ticket

  // Sync sidebar clicks with internal parent dashboard tabs
  useEffect(() => {
    if (!activeSection) return;
    if (activeSection === 'dashboard') {
      setActiveTab('child-overview');
    } else if (activeSection === 'appointments') {
      setActiveTab('consultations');
    } else if (activeSection === 'queries') {
      setActiveTab('child-overview');
    } else if (activeSection === 'complaints') {
      setActiveTab('log-ticket');
    }
  }, [activeSection]);
  
  // Reschedule states
  const [selectedRescheduleApt, setSelectedRescheduleApt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Payment checkout states
  const [checkoutItem, setCheckoutItem] = useState(null); // { type, amount }
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');
  const [ccName, setCcName] = useState('');
  const [payingState, setPayingState] = useState(false);

  // 1. FORMS STATES
  const [aptWith, setAptWith] = useState('Mr. Marcus Davis (Math Teacher)');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('');
  const [aptPurpose, setAptPurpose] = useState('');

  const [ticketCategory, setTicketCategory] = useState('Fee issues');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketType, setTicketType] = useState('query');

  // Parent Sarah Smith monitors child "Liam Chen" in our mock data
  const parentName = currentUser.name;
  
  // Parent's own consultations
  const parentApts = appointments.filter(a => a.userName === parentName);
  
  // Parent monitors child tickets + their own raised issues
  const childQueries = queries.filter(q => q.raisedBy === 'Liam Chen' || q.raisedBy === parentName);
  const childComplaints = complaints.filter(c => c.submittedBy === 'Liam Chen' || c.submittedBy === parentName);

  // Find ward's fee status
  const wardRecord = students.find(s => s.name === 'Liam Chen') || { feeStatus: 'Outstanding', busRoute: 'Route 12' };

  // Compute Parent specific Stats
  const stats = {
    totalAppointments: parentApts.length,
    pendingAppointments: parentApts.filter(a => a.status === 'PENDING').length,
    totalQueries: childQueries.length,
    resolvedQueries: childQueries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length,
    totalComplaints: childComplaints.length,
    escalatedComplaints: childComplaints.filter(c => c.isEscalated).length
  };

  const handleBookConsultation = (e) => {
    e.preventDefault();
    if (!aptDate || !aptTime || !aptPurpose) return;
    
    let dept = 'Teachers';
    if (aptWith.includes('Principal')) dept = 'Principal';
    else if (aptWith.includes('Finch')) dept = 'Accounts department';

    bookAppointment({
      department: dept,
      appointmentWith: aptWith,
      date: aptDate,
      time: aptTime,
      purpose: aptPurpose
    }, currentUser);

    setAptDate('');
    setAptTime('');
    setAptPurpose('');
    setActiveTab('consultations');
  };

  const handleLogTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) return;

    if (ticketType === 'query') {
      raiseQuery({
        category: ticketCategory,
        subject: ticketSubject,
        description: ticketDesc
      }, currentUser);
    } else {
      submitComplaint({
        complaintType: ticketCategory === 'Fee issues' ? 'Administration' : 'Transport',
        description: ticketDesc
      }, currentUser);
    }

    setTicketSubject('');
    setTicketDesc('');
    setActiveTab('child-overview');
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!ccNumber || !ccExpiry || !ccCvv || !ccName) return;

    setPayingState(true);
    // Simulate transaction gate delay
    setTimeout(() => {
      payFee(
        parentName,
        checkoutItem.type,
        checkoutItem.amount,
        { cardHolder: ccName },
        currentUser
      );
      setPayingState(false);
      setCheckoutItem(null);
      setCcNumber('');
      setCcExpiry('');
      setCcCvv('');
      setCcName('');
    }, 1500);
  };

  const handleCancelApt = (id) => {
    if (window.confirm("Do you want to cancel this consultation scheduled with the teacher?")) {
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
      <DashboardCards stats={stats} />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px', overflowX: 'auto' }}>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'child-overview' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'child-overview' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('child-overview'); setActiveSection && setActiveSection('dashboard'); }}
        >
          Child Activity Monitor
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'billing' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'billing' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('billing'); setActiveSection && setActiveSection('dashboard'); }}
        >
          School Dues & Payment Console
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'consultations' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'consultations' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('consultations'); setActiveSection && setActiveSection('appointments'); }}
        >
          Teacher Consultations Logs ({parentApts.length})
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'log-ticket' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'log-ticket' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('log-ticket'); setActiveSection && setActiveSection('complaints'); }}
        >
          Lodge Grievance / Billing Inquiry
        </button>
      </div>

      {/* A. CHILD MONITOR OVERVIEW TAB */}
      {activeTab === 'child-overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Child Identity banner */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(to right, var(--info-bg), transparent)' }}>
            <Users size={24} style={{ color: 'var(--primary-light)' }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Active Student Ward: Liam Chen (Grade 11-A)</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>You are currently reviewing query submissions and active transportation complaints logs on behalf of Liam.</p>
            </div>
          </div>

          <div className="responsive-grid-2">
            {/* Child queries card */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} style={{ color: 'var(--success)' }} />
                Academic Query Tickets History
              </h3>

              {childQueries.length === 0 ? (
                <p style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>No query tickets submitted by ward.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {childQueries.map(q => (
                    <div key={q.id} style={{ padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '11px', color: 'var(--primary-light)' }}>{q.id} ({q.category})</strong>
                        <span className={`status-badge ${q.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '9px', padding: '1px 5px' }}>{q.status}</span>
                      </div>
                      <p style={{ fontSize: '12px', fontWeight: '700' }}>{q.subject}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Submitted by: {q.raisedBy}</p>
                      {q.resolution && (
                        <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: '600' }}>✔ Resolution: "{q.resolution}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Child complaints card */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                Transport & Safety Complaint History
              </h3>

              {childComplaints.length === 0 ? (
                <p style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>No grievances registered.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {childComplaints.map(c => (
                    <div key={c.id} style={{ padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '11px', color: 'var(--danger)' }}>{c.id} ({c.complaintType})</strong>
                        <span className={`status-badge ${c.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '9px', padding: '1px 5px' }}>{c.status}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{c.description}"</p>
                      {c.actionTaken && (
                        <p style={{ fontSize: '11px', color: 'var(--info)', marginTop: '4px', fontWeight: '600' }}>⚡ Action Taken: "{c.actionTaken}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. BILLING & FEES TAB */}
      {activeTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>School Dues & Fee Structure Statement</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Quarterly school fees billing ledger for <strong>Liam Chen</strong> (Grade 11-A). Click checkout to process payments online.
            </p>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dues Category</th>
                    <th>Reference Period</th>
                    <th>Due Amount ($)</th>
                    <th>Dues status</th>
                    <th>Online Checkout</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Tuition Fee Item */}
                  <tr>
                    <td style={{ fontWeight: '600' }}>Quarterly School Tuition Fee</td>
                    <td>Q2 (June - Aug 2026)</td>
                    <td style={{ fontWeight: '700', fontSize: '15px' }}>${wardRecord.monthlyTuitionFee || 0}</td>
                    <td>
                      {wardRecord.paidAmount >= (wardRecord.monthlyTuitionFee || 0) ? (
                        <span className="status-badge approved">PAID SUCCESSFUL</span>
                      ) : wardRecord.paidAmount > 0 ? (
                        <span className="status-badge pending">PARTIAL PAY (${(wardRecord.monthlyTuitionFee || 0) - wardRecord.paidAmount} due)</span>
                      ) : (
                        <span className="status-badge pending">OUTSTANDING DUES</span>
                      )}
                    </td>
                    <td>
                      {wardRecord.paidAmount >= (wardRecord.monthlyTuitionFee || 0) ? (
                        <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Receipts Sent
                        </span>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setCheckoutItem({ type: 'Tuition Fee', amount: String((wardRecord.monthlyTuitionFee || 0) - wardRecord.paidAmount) })}
                        >
                          <CreditCard size={12} />
                          Pay Tuition Dues
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Bus Fee Item */}
                  <tr>
                    <td style={{ fontWeight: '600' }}>School Bus Transportation Fee</td>
                    <td>{wardRecord.busFee > 0 ? 'Q2 Route 12 Services' : 'Not Enrolled'}</td>
                    <td style={{ fontWeight: '700', fontSize: '15px' }}>${wardRecord.busFee || 0}</td>
                    <td>
                      {wardRecord.busFee === 0 ? (
                        <span className="status-badge approved">NOT ENROLLED</span>
                      ) : wardRecord.paidAmount >= (wardRecord.monthlyTuitionFee || 0) + (wardRecord.busFee || 0) ? (
                        <span className="status-badge approved">PAID SUCCESSFUL</span>
                      ) : wardRecord.paidAmount > (wardRecord.monthlyTuitionFee || 0) ? (
                        <span className="status-badge pending">PARTIAL PAY (${(wardRecord.monthlyTuitionFee || 0) + (wardRecord.busFee || 0) - wardRecord.paidAmount} due)</span>
                      ) : (
                        <span className="status-badge pending">OUTSTANDING DUES</span>
                      )}
                    </td>
                    <td>
                      {wardRecord.busFee === 0 ? (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>—</span>
                      ) : wardRecord.paidAmount >= (wardRecord.monthlyTuitionFee || 0) + (wardRecord.busFee || 0) ? (
                        <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Receipts Sent
                        </span>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setCheckoutItem({ 
                            type: 'Bus Fee', 
                            amount: String((wardRecord.monthlyTuitionFee || 0) + (wardRecord.busFee || 0) - Math.max(wardRecord.monthlyTuitionFee || 0, wardRecord.paidAmount)) 
                          })}
                        >
                          <CreditCard size={12} />
                          Pay Bus Fee
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Extra-Curricular Activities Fee Item */}
                  <tr>
                    <td style={{ fontWeight: '600' }}>Quarterly Extra-Curricular Activities Fee</td>
                    <td>Q2 (June - Aug 2026)</td>
                    <td style={{ fontWeight: '700', fontSize: '15px' }}>${wardRecord.monthlyExtraCurricularFee || 0}</td>
                    <td>
                      {wardRecord.paidAmount >= (wardRecord.totalMonthlyFee || 0) ? (
                        <span className="status-badge approved">PAID SUCCESSFUL</span>
                      ) : wardRecord.paidAmount > (wardRecord.monthlyTuitionFee || 0) + (wardRecord.busFee || 0) ? (
                        <span className="status-badge pending">PARTIAL PAY (${(wardRecord.totalMonthlyFee || 0) - wardRecord.paidAmount} due)</span>
                      ) : (
                        <span className="status-badge pending">OUTSTANDING DUES</span>
                      )}
                    </td>
                    <td>
                      {wardRecord.paidAmount >= (wardRecord.totalMonthlyFee || 0) ? (
                        <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Receipts Sent
                        </span>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setCheckoutItem({ 
                            type: 'Extra-Curricular Fee', 
                            amount: String((wardRecord.totalMonthlyFee || 0) - Math.max((wardRecord.monthlyTuitionFee || 0) + (wardRecord.busFee || 0), wardRecord.paidAmount)) 
                          })}
                        >
                          <CreditCard size={12} />
                          Pay Extra-Curricular Dues
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* C. CONSULTATIONS LOGS TAB */}
      {activeTab === 'consultations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Scheduling form */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Schedule Teacher / Principal Consultation</h3>
            
            <form onSubmit={handleBookConsultation}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Staff Contact Person</label>
                  <select className="filter-input" value={aptWith} onChange={e => setAptWith(e.target.value)}>
                    {staff.map(member => (
                      <option key={member.id} value={`${member.name} (${member.designation})`}>
                        {member.name} ({member.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Preferred Date</label>
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
                  <label>Available Consultation Slot</label>
                  <select 
                    className="filter-input"
                    value={aptTime}
                    onChange={e => setAptTime(e.target.value)}
                    required
                  >
                    <option value="">Choose slot</option>
                    <option value="09:00 AM">09:00 AM (Available)</option>
                    <option value="11:30 AM">11:30 AM (Available)</option>
                    <option value="02:30 PM">02:30 PM (Available)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Discussion Purpose / Remarks</label>
                <textarea 
                  className="form-input"
                  style={{ minHeight: '80px' }}
                  placeholder="e.g. Inquire regarding midterm performance drop and plans for physics remedial classes."
                  value={aptPurpose}
                  onChange={e => setAptPurpose(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Request Consultation Slot
              </button>
            </form>
          </div>

          {/* Active Consultations Table */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>My Active Appointments</h3>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Consultation With</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parentApts.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                        No consultations scheduled. Request a meeting using the form above.
                      </td>
                    </tr>
                  ) : (
                    parentApts.map(apt => (
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
        </div>
      )}

      {/* D. LODGE GRIEVANCE / INQUIRY TAB */}
      {activeTab === 'log-ticket' && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Lodge Billing Inquiry or Transportation Grievance</h3>
          
          <form onSubmit={handleLogTicket}>
            <div className="form-grid">
              <div className="form-group">
                <label>Ticket Type</label>
                <select className="filter-input" value={ticketType} onChange={e => setTicketType(e.target.value)}>
                  <option value="query">Billing Inquiry (Fee Query)</option>
                  <option value="complaint">Transportation / Safety Grievance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category Area</label>
                <select className="filter-input" value={ticketCategory} onChange={e => setTicketCategory(e.target.value)}>
                  <option value="Fee issues">Quarterly Tuition Fees / Billing</option>
                  <option value="Transport">School Bus routing & Driver speed</option>
                  <option value="Academics">Syllabus curriculum issues</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Subject Headline</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. Double invoice charges regarding tuition fee"
                value={ticketSubject}
                onChange={e => setTicketSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Grievance Details / Description</label>
              <textarea 
                className="form-input"
                style={{ minHeight: '120px' }}
                placeholder="Detail your inquiry or bus routing grievance here. System tickets sync instantly with administrators."
                value={ticketDesc}
                onChange={e => setTicketDesc(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Submit Ticket to Administration Office
            </button>
          </form>
        </div>
      )}

      {/* CREDIT CARD GATEWAY CHECKOUT MODAL */}
      <Modal
        isOpen={checkoutItem !== null}
        onClose={() => setCheckoutItem(null)}
        title={`Secure Checkout Gate - Quarterly Billing`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCheckoutItem(null)}>Decline Payment</button>
          </>
        }
      >
        {checkoutItem && (
          <form onSubmit={handleCheckoutSubmit}>
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Selected Invoice</p>
                <strong style={{ fontSize: '15px' }}>{checkoutItem.type} Dues</strong>
              </div>
              <strong style={{ fontSize: '20px', color: 'var(--primary-light)' }}>${checkoutItem.amount}</strong>
            </div>

            <div className="form-group">
              <label>Cardholder Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Sarah Smith"
                value={ccName}
                onChange={e => setCcName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>16-digit Credit Card Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 10px' }}>
                <CreditCard size={16} style={{ color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  maxLength="19"
                  style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '14px', width: '100%', outline: 'none' }}
                  placeholder="4111 2222 3333 4444"
                  value={ccNumber}
                  onChange={e => setCcNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Expiration Date</label>
                <input 
                  type="text" 
                  maxLength="5"
                  className="form-input" 
                  placeholder="MM/YY"
                  value={ccExpiry}
                  onChange={e => setCcExpiry(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>3-digit CVV Card Code</label>
                <input 
                  type="password" 
                  maxLength="3"
                  className="form-input" 
                  placeholder="***"
                  value={ccCvv}
                  onChange={e => setCcCvv(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '12px', height: '42px', fontSize: '14px' }}
              disabled={payingState}
            >
              {payingState ? 'Authorizing Credit Card Bank Wire...' : `Pay $${checkoutItem.amount} Securely`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-tertiary)', justifyContent: 'center', marginTop: '12px' }}>
              <CheckCircle size={12} style={{ color: 'var(--success)' }} />
              <span>Simulated 256-bit AES Payout Tunnel Active</span>
            </div>
          </form>
        )}
      </Modal>

      {/* RESCHEDULE MODAL */}
      <Modal
        isOpen={selectedRescheduleApt !== null}
        onClose={() => setSelectedRescheduleApt(null)}
        title="Reschedule Consultation"
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
              <label>New Proposed Date</label>
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
              <label>New Time Slot</label>
              <select 
                className="filter-input"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
              >
                <option value="">Select slot</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:30 PM">02:30 PM</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParentDashboard;
