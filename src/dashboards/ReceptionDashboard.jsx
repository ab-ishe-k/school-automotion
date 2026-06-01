import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import { 
  UserPlus, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Check, 
  X,
  Smartphone
} from 'lucide-react';

const ReceptionDashboard = ({ activeSection, setActiveSection }) => {
  const { appointments, queries, bookAppointment, raiseQuery } = useDatabase();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('visitors'); // visitors, guest-booking, guest-query

  // Sync sidebar clicks with internal Reception dashboard tabs
  useEffect(() => {
    if (!activeSection) return;
    if (activeSection === 'dashboard') {
      setActiveTab('visitors');
    } else if (activeSection === 'appointments') {
      setActiveTab('guest-booking');
    } else if (activeSection === 'queries') {
      setActiveTab('guest-query');
    } else if (activeSection === 'complaints') {
      setActiveTab('visitors');
    }
  }, [activeSection]);
  
  // Custom Visitor state synced to localStorage
  const [visitors, setVisitors] = useState(() => {
    const data = localStorage.getItem('school_visitor_logs');
    return data ? JSON.parse(data) : [
      { id: 'VIS-901', name: 'Dr. Robert Carter', contact: '555-019-2831', purpose: 'Research Grant Collaboration with Principal', checkIn: '09:00 AM', checkedOut: true },
      { id: 'VIS-902', name: 'Mrs. Cynthia White', contact: '555-014-9988', purpose: 'Remedial Tuition clarification', checkIn: '10:15 AM', checkedOut: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('school_visitor_logs', JSON.stringify(visitors));
  }, [visitors]);

  // Visitor form states
  const [visName, setVisName] = useState('');
  const [visContact, setVisContact] = useState('');
  const [visPurpose, setVisPurpose] = useState('');

  // Guest booking states
  const [guestName, setGuestName] = useState('');
  const [guestRole, setGuestRole] = useState('Parent');
  const [guestAptWith, setGuestAptWith] = useState('Principal (Dr. Adrian Vance)');
  const [guestDate, setGuestDate] = useState('');
  const [guestTime, setGuestTime] = useState('');
  const [guestPurpose, setGuestPurpose] = useState('');

  // Guest query states
  const [gqName, setGqName] = useState('');
  const [gqCategory, setGqCategory] = useState('Certificates');
  const [gqSubject, setGqSubject] = useState('');
  const [gqDesc, setGqDesc] = useState('');

  // Calculate reception metrics
  const receptionApts = appointments.filter(a => a.createdAt && (new Date(a.createdAt) > new Date(Date.now() - 24*3600*1000)));

  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'PENDING').length,
    totalQueries: queries.length,
    resolvedQueries: queries.filter(q => q.status === 'Resolved').length,
    totalComplaints: visitors.filter(v => !v.checkedOut).length, // Map active visitors as complaint counter in stats card for reception
    escalatedComplaints: visitors.length
  };

  const handleAddVisitor = (e) => {
    e.preventDefault();
    if (!visName || !visContact || !visPurpose) return;
    
    const newVis = {
      id: `VIS-${Math.floor(100 + Math.random() * 900)}`,
      name: visName,
      contact: visContact,
      purpose: visPurpose,
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkedOut: false
    };

    setVisitors(prev => [newVis, ...prev]);
    setVisName('');
    setVisContact('');
    setVisPurpose('');
  };

  const handleToggleCheckout = (id) => {
    setVisitors(prev => 
      prev.map(v => v.id === id ? { ...v, checkedOut: true } : v)
    );
  };

  const handleGuestBooking = (e) => {
    e.preventDefault();
    if (!guestName || !guestDate || !guestTime || !guestPurpose) return;

    // Simulate booking
    let dept = 'Teachers';
    if (guestAptWith.includes('Principal')) dept = 'Principal';
    else if (guestAptWith.includes('Finch')) dept = 'Accounts department';

    const mockGuestUser = {
      name: `${guestName} (Walk-in)`,
      role: guestRole
    };

    bookAppointment({
      department: dept,
      appointmentWith: guestAptWith,
      date: guestDate,
      time: guestTime,
      purpose: guestPurpose
    }, mockGuestUser);

    setGuestName('');
    setGuestPurpose('');
    setGuestDate('');
    setGuestTime('');
    setActiveTab('visitors');
  };

  const handleGuestQuery = (e) => {
    e.preventDefault();
    if (!gqName || !gqSubject || !gqDesc) return;

    const mockGuestUser = {
      name: `${gqName} (Phone intake)`,
      role: 'Guest / Visitor'
    };

    raiseQuery({
      category: gqCategory,
      subject: gqSubject,
      description: gqDesc
    }, mockGuestUser);

    setGqName('');
    setGqSubject('');
    setGqDesc('');
    setActiveTab('visitors');
  };

  return (
    <div className="dashboard-viewport">
      {/* Metrics Card summary */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <h3>Registered Visitors Today</h3>
            <span className="metric-value">{visitors.length}</span>
            <div className="metric-trend trend-up">
              <span>{visitors.filter(v => !v.checkedOut).length} in campus</span>
            </div>
          </div>
          <div className="metric-icon-box primary">
            <UserPlus size={20} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Total Scheduled Appointments</h3>
            <span className="metric-value">{appointments.length}</span>
            <div className="metric-trend trend-up">
              <span>Syncing with Google Calendar</span>
            </div>
          </div>
          <div className="metric-icon-box success">
            <Calendar size={20} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Total Inward Queries</h3>
            <span className="metric-value">{queries.length}</span>
            <div className="metric-trend trend-up">
              <span>Logged in cloud spreadsheet</span>
            </div>
          </div>
          <div className="metric-icon-box warning">
            <MessageSquare size={20} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px', overflowX: 'auto' }}>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'visitors' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'visitors' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('visitors'); setActiveSection && setActiveSection('dashboard'); }}
        >
          Campus Visitor Registry
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'guest-booking' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'guest-booking' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('guest-booking'); setActiveSection && setActiveSection('appointments'); }}
        >
          Book Visitor Appointment
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'guest-query' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'guest-query' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('guest-query'); setActiveSection && setActiveSection('queries'); }}
        >
          Intake Caller Inquiry
        </button>
      </div>

      {/* A. CAMPUS VISITORS REGISTRY */}
      {activeTab === 'visitors' && (
        <div className="responsive-grid-1-2">
          {/* Visitor intake form */}
          <div className="glass-panel" style={{ padding: '20px', alignSelf: 'start' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} style={{ color: 'var(--primary-light)' }} />
              Register Walk-in Guest
            </h3>

            <form onSubmit={handleAddVisitor}>
              <div className="form-group">
                <label>Guest Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Dr. Robert Carter"
                  value={visName}
                  onChange={e => setVisName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Phone Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g. 555-019-2831"
                  value={visContact}
                  onChange={e => setVisContact(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Purpose of Visit</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '80px' }}
                  placeholder="e.g. Discussion regarding scholarship forms with Accounts head Mrs. Janet Finch."
                  value={visPurpose}
                  onChange={e => setVisPurpose(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Log Campus Entry
              </button>
            </form>
          </div>

          {/* Visitor Logs database */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Campus Registry database</h3>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Guest Name</th>
                    <th>Phone</th>
                    <th>Purpose</th>
                    <th>Check In</th>
                    <th>Checked Out</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                        No campus visitors registered today.
                      </td>
                    </tr>
                  ) : (
                    visitors.map(vis => (
                      <tr key={vis.id}>
                        <td style={{ fontWeight: '700' }}>{vis.id}</td>
                        <td style={{ fontWeight: '600' }}>{vis.name}</td>
                        <td style={{ fontSize: '12px' }}>{vis.contact}</td>
                        <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }} title={vis.purpose}>{vis.purpose}</td>
                        <td style={{ color: 'var(--primary-light)', fontWeight: '600' }}>{vis.checkIn}</td>
                        <td>
                          {vis.checkedOut ? (
                            <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} />
                              Checked Out
                            </span>
                          ) : (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--warning)', borderColor: 'var(--warning)' }}
                              onClick={() => handleToggleCheckout(vis.id)}
                            >
                              Log Checkout
                            </button>
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

      {/* B. BOOK VISITOR APPOINTMENT */}
      {activeTab === 'guest-booking' && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Schedule Appointment on behalf of Visitor</h3>
          
          <form onSubmit={handleGuestBooking}>
            <div className="form-grid">
              <div className="form-group">
                <label>Visitor Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Mr. Robert Smith"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Visitor Role Relation</label>
                <select className="filter-input" value={guestRole} onChange={e => setGuestRole(e.target.value)}>
                  <option value="Parent">Parent / Guardian</option>
                  <option value="Student">Visitor Student</option>
                  <option value="Alumni">Beacon Alumni</option>
                  <option value="Guest Inspector">Inspector / Board Auditor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Schedule Consultation With</label>
                <select className="filter-input" value={guestAptWith} onChange={e => setGuestAptWith(e.target.value)}>
                  <option value="Principal (Dr. Adrian Vance)">Dr. Adrian Vance (Principal)</option>
                  <option value="Mr. Marcus Davis (Math Teacher)">Mr. Marcus Davis (Math Teacher)</option>
                  <option value="Mrs. Janet Finch (Accounts Manager)">Mrs. Janet Finch (Accounts)</option>
                  <option value="Ms. Clara Thorne (Counselor)">Ms. Clara Thorne (Counselor)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Consultation Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={guestDate}
                  onChange={e => setGuestDate(e.target.value)}
                  min="2026-06-01"
                  max="2026-06-30"
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Slot</label>
                <select 
                  className="filter-input"
                  value={guestTime}
                  onChange={e => setGuestTime(e.target.value)}
                  required
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

            <div className="form-group">
              <label>Reason for Urgent Scheduling</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: '80px' }}
                placeholder="Write reasons here. Appointments scheduled on behalf of visitors will auto-add to calendars."
                value={guestPurpose}
                onChange={e => setGuestPurpose(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Submit Booking & Log Sheets Row
            </button>
          </form>
        </div>
      )}

      {/* C. INTAKE CALLER INQUIRY */}
      {activeTab === 'guest-query' && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Intake & Route Phone Caller Inquiry</h3>
          
          <form onSubmit={handleGuestQuery}>
            <div className="form-grid">
              <div className="form-group">
                <label>Caller Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Mrs. Cynthia"
                  value={gqName}
                  onChange={e => setGqName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Routing Department</label>
                <select className="filter-input" value={gqCategory} onChange={e => setGqCategory(e.target.value)}>
                  <option value="Certificates">Certificates & Transcripts Cell</option>
                  <option value="Fee issues">Billing & Accounts Office</option>
                  <option value="Transport">Transport Coordinator</option>
                  <option value="Academics">Academic Coordinator</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Headline Subject</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Transcript issuance duration query"
                value={gqSubject}
                onChange={e => setGqSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Caller Inquiry Description</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: '100px' }}
                placeholder="Enter details of the caller's request here. This will generate an active ticket and route to the appropriate department head."
                value={gqDesc}
                onChange={e => setGqDesc(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-success" style={{ width: '100%', color: 'white' }}>
              Route Caller Inquiry
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReceptionDashboard;
