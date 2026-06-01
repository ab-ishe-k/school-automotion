import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import Modal from '../components/Modal';
import { 
  Edit, 
  Trash2, 
  UserPlus, 
  Filter, 
  RotateCcw, 
  Search, 
  PlusCircle, 
  CheckSquare,
  AlertOctagon,
  Calendar,
  DollarSign,
  GraduationCap
} from 'lucide-react';

const AdminDashboard = ({ activeSection, setActiveSection }) => {
  const { 
    appointments, 
    queries, 
    complaints, 
    payments,
    students,
    staff,
    updateSheetRow, 
    deleteSheetRow, 
    resetAllData,
    registerStudent,
    registerTeacher,
    updateQueryStatus,
    updateComplaintStatus,
    escalateComplaint,
    runDuesReminderLoop
  } = useDatabase();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('database'); // database, routing, admissions, settings

  // Sync sidebar clicks with internal Admin dashboard tabs & active sheet
  useEffect(() => {
    if (!activeSection) return;
    if (activeSection === 'dashboard') {
      setActiveTab('database');
    } else if (activeSection === 'appointments') {
      setActiveTab('database');
      setActiveSheet('appointments');
    } else if (activeSection === 'queries') {
      setActiveTab('routing');
    } else if (activeSection === 'complaints') {
      setActiveTab('routing');
    }
  }, [activeSection]);
  const [activeSheet, setActiveSheet] = useState('appointments'); // appointments, queries, complaints, payments, students, staff
  const [sheetSearch, setSheetSearch] = useState('');
  
  // Advanced Filtering states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Row editor modal states
  const [selectedRow, setSelectedRow] = useState(null);
  const [editFields, setEditFields] = useState({});

  // Student Admission Form states
  const [stdName, setStdName] = useState('');
  const [stdEmail, setStdEmail] = useState('');
  const [stdClass, setStdClass] = useState('Grade 11-A');
  const [stdRoute, setStdRoute] = useState('None');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [tuitionFee, setTuitionFee] = useState('2000');
  const [busFee, setBusFee] = useState('500');
  const [rollNum, setRollNum] = useState('');

  // Teacher Recruitment Form states
  const [tchName, setTchName] = useState('');
  const [tchEmail, setTchEmail] = useState('');
  const [tchDept, setTchDept] = useState('Math Dept');
  const [tchSalary, setTchSalary] = useState('4500');
  const [tchDesignation, setTchDesignation] = useState('Mathematics Instructor');
  const [tchPhone, setTchPhone] = useState('');
  const [tchRole, setTchRole] = useState('Teacher');

  // 1. STATS SUMMARY
  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'PENDING').length,
    totalQueries: queries.length,
    resolvedQueries: queries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length,
    totalComplaints: complaints.length,
    escalatedComplaints: complaints.filter(c => c.isEscalated).length
  };

  // 2. DATA FILTERING ENGINE
  const getFilteredData = () => {
    let raw = [];
    if (activeSheet === 'appointments') raw = appointments;
    else if (activeSheet === 'queries') raw = queries;
    else if (activeSheet === 'complaints') raw = complaints;
    else if (activeSheet === 'payments') raw = payments;
    else if (activeSheet === 'students') raw = students;
    else if (activeSheet === 'staff') raw = staff;

    // Standard Search text
    if (sheetSearch) {
      const term = sheetSearch.toLowerCase();
      raw = raw.filter(row => 
        Object.values(row).some(v => 
          (v || '').toString().toLowerCase().includes(term)
        )
      );
    }

    // Role-based status filter
    if (filterStatus) {
      raw = raw.filter(row => (row.status || row.feeStatus || '').toLowerCase() === filterStatus.toLowerCase());
    }

    // Department routing filter
    if (filterDepartment) {
      raw = raw.filter(row => {
        const field = row.appointmentWith || row.assignedTo || row.assignedOfficer || row.department || '';
        return field.toLowerCase().includes(filterDepartment.toLowerCase());
      });
    }

    return raw;
  };

  const filteredData = getFilteredData();

  // 3. EDIT ROW ACTIONS
  const handleEditClick = (row) => {
    setSelectedRow(row);
    setEditFields({ ...row });
  };

  const handleSaveRow = () => {
    updateSheetRow(activeSheet, selectedRow.id, editFields, currentUser);
    setSelectedRow(null);
  };

  const handleDeleteClick = (rowId) => {
    if (window.confirm(`Are you sure you want to permanently delete row ${rowId} from the Google Sheet?`)) {
      deleteSheetRow(activeSheet, rowId, currentUser);
    }
  };

  const handleResetDatabase = () => {
    if (window.confirm("WARNING: This will flush all Google Sheets spreadsheets and Gmail mail logs back to their initial state. Continue?")) {
      resetAllData(currentUser);
    }
  };

  // 4. SUBMISSIONS
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!stdName || !stdEmail) return;
    registerStudent({
      name: stdName,
      email: stdEmail,
      class: stdClass,
      busRoute: stdRoute,
      parentName,
      parentEmail,
      parentContact,
      monthlyTuitionFee: Number(tuitionFee),
      busFee: Number(busFee),
      rollNumber: rollNum
    }, currentUser);

    setStdName('');
    setStdEmail('');
    setStdRoute('None');
    setParentName('');
    setParentEmail('');
    setParentContact('');
    setTuitionFee('2000');
    setBusFee('500');
    setRollNum('');
    setActiveTab('database');
    setActiveSheet('students');
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    if (!tchName || !tchEmail || !tchSalary) return;
    registerTeacher({
      name: tchName,
      email: tchEmail,
      department: tchDept,
      salary: tchSalary,
      designation: tchDesignation,
      phone: tchPhone,
      role: tchRole
    }, currentUser);

    setTchName('');
    setTchEmail('');
    setTchSalary('4500');
    setTchDesignation('Mathematics Instructor');
    setTchPhone('');
    setTchRole('Teacher');
    setActiveTab('database');
    setActiveSheet('staff');
  };

  // Routing Queues
  const pendingQueries = queries.filter(q => q.status === 'Pending');
  const pendingComplaints = complaints.filter(c => c.status === 'Pending');

  return (
    <div className="dashboard-viewport">
      <DashboardCards stats={stats} />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px', overflowX: 'auto' }}>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'database' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'database' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('database'); setActiveSection && setActiveSection('dashboard'); }}
        >
          Google Sheets Database Console
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'routing' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'routing' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('routing'); setActiveSection && setActiveSection('queries'); }}
        >
          Workflows & Ticketing Router
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'admissions' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'admissions' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('admissions'); setActiveSection && setActiveSection('dashboard'); }}
        >
          Admissions & Hiring Desk
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'settings' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'settings' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('settings'); setActiveSection && setActiveSection('dashboard'); }}
        >
          System Controls
        </button>
      </div>

      {/* A. DATABASE SHEETS TAB */}
      {activeTab === 'database' && (
        <div>
          {/* Spreadsheet Selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
            {['appointments', 'queries', 'complaints', 'payments', 'students', 'staff'].map(sheet => (
              <button
                key={sheet}
                className={`btn ${activeSheet === sheet ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize', padding: '8px 16px', fontSize: '13px' }}
                onClick={() => { setActiveSheet(sheet); setSheetSearch(''); }}
              >
                {sheet} Sheet
              </button>
            ))}
          </div>

          {/* Search & Advanced Filters Dock */}
          <div className="filters-dock">
            <div className="filter-input-group">
              <label>Search Spreadsheet</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 10px' }}>
                <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  style={{ border: 'none', background: 'none', padding: '8px 0', fontSize: '13px', width: '100%', outline: 'none' }}
                  placeholder="Type to filter..." 
                  value={sheetSearch}
                  onChange={e => setSheetSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-input-group">
              <label>Status Filter</label>
              <select className="filter-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending / Outstanding</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid / Credited</option>
                <option value="resolved">Resolved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-input-group">
              <label>Dept Filter</label>
              <select className="filter-input" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
                <option value="">All Officers</option>
                <option value="principal">Principal</option>
                <option value="vp">Vice Principal</option>
                <option value="math">Math</option>
                <option value="accounts">Accounts</option>
                <option value="transport">Transport</option>
              </select>
            </div>
          </div>

          {/* Sheets Data Table */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  {activeSheet === 'appointments' && (
                    <tr>
                      <th>Booking ID</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Staff Assigned</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  )}
                  {activeSheet === 'queries' && (
                    <tr>
                      <th>Query ID</th>
                      <th>Raised By</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Assigned Officer</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  )}
                  {activeSheet === 'complaints' && (
                    <tr>
                      <th>Complaint ID</th>
                      <th>Submitted By</th>
                      <th>Type</th>
                      <th>Officer Assigned</th>
                      <th>Escalated</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  )}
                  {activeSheet === 'payments' && (
                    <tr>
                      <th>Payment ID</th>
                      <th>User Name</th>
                      <th>Role</th>
                      <th>Payment Type</th>
                      <th>Amount ($)</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Transaction ID</th>
                      <th>Actions</th>
                    </tr>
                  )}
                  {activeSheet === 'students' && (
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Email Address</th>
                      <th>Assigned Class</th>
                      <th>Fee Status</th>
                      <th>Bus Route Route</th>
                      <th>Actions</th>
                    </tr>
                  )}
                  {activeSheet === 'staff' && (
                    <tr>
                      <th>Staff ID</th>
                      <th>Instructor Name</th>
                      <th>Role</th>
                      <th>Email Address</th>
                      <th>Salary ($)</th>
                      <th>Department</th>
                      <th>Date Joined</th>
                      <th>Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                        No matching spreadsheet rows found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map(row => (
                      <tr key={row.id}>
                        <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{row.id}</td>
                        {activeSheet === 'appointments' && (
                          <>
                            <td>{row.userName}</td>
                            <td>{row.userRole}</td>
                            <td>{row.appointmentWith}</td>
                            <td>{row.date}</td>
                            <td>{row.time}</td>
                            <td>
                              <span className={`status-badge ${row.status.toLowerCase()}`}>{row.status}</span>
                            </td>
                          </>
                        )}
                        {activeSheet === 'queries' && (
                          <>
                            <td>{row.raisedBy} ({row.role})</td>
                            <td>{row.category}</td>
                            <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.subject}>{row.subject}</td>
                            <td>{row.assignedTo}</td>
                            <td>
                              <span className={`status-badge ${row.status.toLowerCase().replace(' ', '-')}`}>{row.status}</span>
                            </td>
                          </>
                        )}
                        {activeSheet === 'complaints' && (
                          <>
                            <td>{row.submittedBy} ({row.role})</td>
                            <td>{row.complaintType}</td>
                            <td>{row.assignedOfficer}</td>
                            <td>
                              <span style={{ color: row.isEscalated ? 'var(--danger)' : 'var(--text-tertiary)', fontWeight: '700' }}>
                                {row.isEscalated ? 'YES' : 'NO'}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${row.status.toLowerCase().replace(' ', '-')}`}>{row.status}</span>
                            </td>
                          </>
                        )}
                        {activeSheet === 'payments' && (
                          <>
                            <td>{row.userName}</td>
                            <td>{row.role}</td>
                            <td>
                              <span className="priority-tag medium" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                                {row.paymentType}
                              </span>
                            </td>
                            <td style={{ fontWeight: '700' }}>${row.amount}</td>
                            <td>{row.date}</td>
                            <td>
                              <span className="status-badge approved">{row.status}</span>
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{row.transactionId}</td>
                          </>
                        )}
                        {activeSheet === 'students' && (
                          <>
                            <td>{row.name}</td>
                            <td>{row.email}</td>
                            <td>{row.class}</td>
                            <td>
                              <span className={`status-badge ${row.feeStatus === 'Paid' ? 'approved' : 'pending'}`}>{row.feeStatus}</span>
                            </td>
                            <td>{row.busRoute}</td>
                          </>
                        )}
                        {activeSheet === 'staff' && (
                          <>
                            <td>{row.name}</td>
                            <td>{row.role}</td>
                            <td>{row.email}</td>
                            <td style={{ fontWeight: '700' }}>${row.salary}</td>
                            <td>{row.department}</td>
                            <td>{row.dateJoined}</td>
                          </>
                        )}
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 8px', color: 'var(--primary-light)', borderColor: 'var(--primary-light)' }}
                              onClick={() => handleEditClick(row)}
                            >
                              <Edit size={12} />
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 8px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                              onClick={() => handleDeleteClick(row.id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
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

      {/* B. WORKFLOW ROUTING TAB */}
      {activeTab === 'routing' && (
        <div className="responsive-grid-2">
          {/* Pending Queries queue */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} style={{ color: 'var(--primary-light)' }} />
              Queries Routing Queue
            </h3>
            
            {pendingQueries.length === 0 ? (
              <p style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                All query tickets are routed and currently In Progress or Resolved.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pendingQueries.map(q => (
                  <div key={q.id} style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{q.id}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(q.date).toLocaleDateString()}</span>
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{q.subject}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{q.description}</p>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select 
                        className="filter-input" 
                        style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}
                        id={`routing-officer-${q.id}`}
                      >
                        <option value="Mr. Marcus Davis (Math Teacher)">Mr. Marcus Davis (Math Teacher)</option>
                        <option value="Mrs. Janet Finch (Accounts Manager)">Mrs. Janet Finch (Accounts)</option>
                        <option value="Transport Supervisor (Mr. Greg)">Mr. Greg (Transport)</option>
                        <option value="IT Helpdesk (Alex)">Alex (IT Support)</option>
                      </select>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => {
                          const officer = document.getElementById(`routing-officer-${q.id}`).value;
                          updateSheetRow('queries', q.id, { assignedTo: officer, status: 'In Progress' }, currentUser);
                        }}
                      >
                        Route & Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Complaints queue */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={18} style={{ color: 'var(--danger)' }} />
              Complaints Escalation Queue
            </h3>

            {pendingComplaints.length === 0 ? (
              <p style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No fresh unassigned complaints logs.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pendingComplaints.map(c => (
                  <div key={c.id} style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--danger)' }}>{c.id}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{c.description}</p>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px', flex: 1 }}
                        onClick={() => updateComplaintStatus(c.id, { status: 'In Progress', actionTaken: 'Investigation opened by Admin' }, currentUser)}
                      >
                        Start Investigation
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '4px 8px', fontSize: '11px', flex: 1 }}
                        onClick={() => escalateComplaint(c.id, currentUser)}
                      >
                        Escalate to Principal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* C. ADMISSIONS & HIRING TAB */}
      {activeTab === 'admissions' && (
        <div className="responsive-grid-2">
          {/* Enroll Student Form */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)' }}>
              <GraduationCap size={18} />
              Student Admission Registry
            </h3>

            <form onSubmit={handleAddStudent}>
              <div className="form-group">
                <label>Student Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Liam Chen"
                  value={stdName}
                  onChange={e => setStdName(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid responsive-grid-12-1" style={{ gap: '10px' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. liam@beacon.edu"
                    value={stdEmail}
                    onChange={e => setStdEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Student Roll Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 12"
                    value={rollNum}
                    onChange={e => setRollNum(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid responsive-grid-12-1" style={{ gap: '10px' }}>
                <div className="form-group">
                  <label>Parent Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Sarah Smith"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Parent Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 555-012-9988"
                    value={parentContact}
                    onChange={e => setParentContact(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Parent Contact Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. sarah.smith@school.edu"
                  value={parentEmail}
                  onChange={e => setParentEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid responsive-grid-2-tight">
                <div className="form-group">
                  <label>Monthly Tuition Fee ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={tuitionFee}
                    onChange={e => setTuitionFee(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Bus Fee ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={busFee}
                    onChange={e => setBusFee(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Assigned Class</label>
                  <select className="filter-input" value={stdClass} onChange={e => setStdClass(e.target.value)}>
                    <option value="Grade 9-A">Grade 9-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                    <option value="Grade 11-A">Grade 11-A</option>
                    <option value="Grade 12-A">Grade 12-A</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Transport Bus Route</label>
                  <select className="filter-input" value={stdRoute} onChange={e => setStdRoute(e.target.value)}>
                    <option value="None">None (Self Transit)</option>
                    <option value="Route 12">Route 12 (North Stop)</option>
                    <option value="Route 5">Route 5 (East Stop)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                Approve Admission & Log Student
              </button>
            </form>
          </div>

          {/* Recruit Teacher Form */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
              <UserPlus size={18} />
              Recruit New Faculty Member
            </h3>

            <form onSubmit={handleAddTeacher}>
              <div className="form-group">
                <label>Faculty Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Mr. Marcus Davis"
                  value={tchName}
                  onChange={e => setTchName(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid responsive-grid-12-1" style={{ gap: '10px' }}>
                <div className="form-group">
                  <label>Contract Email Account</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. davis@school.edu"
                    value={tchEmail}
                    onChange={e => setTchEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 555-018-4431"
                    value={tchPhone}
                    onChange={e => setTchPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid responsive-grid-2-tight">
                <div className="form-group">
                  <label>Specific Designation</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Math Instructor"
                    value={tchDesignation}
                    onChange={e => setTchDesignation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Employment Role</label>
                  <select className="filter-input" value={tchRole} onChange={e => setTchRole(e.target.value)}>
                    <option value="Teacher">Teacher (Advisor)</option>
                    <option value="Admin Staff">Admin Staff</option>
                    <option value="Vice Principal">Vice Principal</option>
                    <option value="Principal">Principal</option>
                  </select>
                </div>
              </div>

              <div className="form-grid responsive-grid-2-tight">
                <div className="form-group">
                  <label>Faculty Advisory Dept</label>
                  <select className="filter-input" value={tchDept} onChange={e => setTchDept(e.target.value)}>
                    <option value="Math Dept">Math Dept</option>
                    <option value="Physics Dept">Physics Dept</option>
                    <option value="English Dept">English Dept</option>
                    <option value="Accounts Dept">Accounts Office</option>
                    <option value="Principal Office">Principal Office</option>
                    <option value="VP Office">VP Office</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Approved Base Salary ($/mo)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={tchSalary}
                    onChange={e => setTchSalary(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--success)', borderColor: 'transparent', marginTop: '12px' }}>
                Formally Recruit Faculty Row
              </button>
            </form>
          </div>
        </div>
      )}

      {/* D. SYSTEM SETTINGS CONTROL TAB */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>System Administrator Maintenance Panel</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Control global application properties, synchronization intervals, or perform database refreshes.
          </p>

          <div className="responsive-grid-2" style={{ gap: '16px', maxWidth: '800px' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', backgroundColor: 'var(--bg-tertiary)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--danger)' }}>Database Hard Reset</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Flush all local storage records for Google Sheets, Calendar events, and mock Gmail messages, restoring default profiles.
              </p>
              <button className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '12px' }} onClick={handleResetDatabase}>
                <RotateCcw size={14} />
                Restore Default Databases
              </button>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', backgroundColor: 'var(--bg-tertiary)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--primary-light)' }}>Parent Fee Notification Loop</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Simulate the automated 7-day recurring email dues reminder sweep. The system will dispatch warnings to parents of students with outstanding balances.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '12px' }} 
                onClick={() => runDuesReminderLoop(currentUser)}
              >
                <AlertOctagon size={14} />
                Execute 7-Day Reminder Loop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROW FIELD EDIT MODAL */}
      <Modal
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
        title={`Edit Row [${selectedRow?.id}] - Virtual Sheet`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelectedRow(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveRow}>Update Row Cells</button>
          </>
        }
      >
        {selectedRow && (
          <div className="form-grid">
            {activeSheet === 'appointments' && (
              <>
                <div className="form-group">
                  <label>Booking ID</label>
                  <input type="text" className="form-input" value={editFields.id} disabled />
                </div>
                <div className="form-group">
                  <label>Client Name</label>
                  <input type="text" className="form-input" value={editFields.userName} onChange={e => setEditFields({ ...editFields, userName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>DateTime Slot</label>
                  <input type="date" className="form-input" value={editFields.date} onChange={e => setEditFields({ ...editFields, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Appointment Status</label>
                  <select className="filter-input" value={editFields.status} onChange={e => setEditFields({ ...editFields, status: e.target.value })}>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Resolution Remarks</label>
                  <input type="text" className="form-input" value={editFields.resolutionNotes || ''} onChange={e => setEditFields({ ...editFields, resolutionNotes: e.target.value })} />
                </div>
              </>
            )}

            {activeSheet === 'queries' && (
              <>
                <div className="form-group">
                  <label>Ticket ID</label>
                  <input type="text" className="form-input" value={editFields.id} disabled />
                </div>
                <div className="form-group">
                  <label>Raised By</label>
                  <input type="text" className="form-input" value={editFields.raisedBy} onChange={e => setEditFields({ ...editFields, raisedBy: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ticket Subject</label>
                  <input type="text" className="form-input" value={editFields.subject} onChange={e => setEditFields({ ...editFields, subject: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ticket Status</label>
                  <select className="filter-input" value={editFields.status} onChange={e => setEditFields({ ...editFields, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Resolution notes</label>
                  <input type="text" className="form-input" value={editFields.resolution || ''} onChange={e => setEditFields({ ...editFields, resolution: e.target.value })} />
                </div>
              </>
            )}

            {activeSheet === 'complaints' && (
              <>
                <div className="form-group">
                  <label>Complaint ID</label>
                  <input type="text" className="form-input" value={editFields.id} disabled />
                </div>
                <div className="form-group">
                  <label>Submitted By</label>
                  <input type="text" className="form-input" value={editFields.submittedBy} onChange={e => setEditFields({ ...editFields, submittedBy: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Assign Officer</label>
                  <input type="text" className="form-input" value={editFields.assignedOfficer} onChange={e => setEditFields({ ...editFields, assignedOfficer: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ticket Status</label>
                  <select className="filter-input" value={editFields.status} onChange={e => setEditFields({ ...editFields, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Action Taken / Investigation</label>
                  <input type="text" className="form-input" value={editFields.actionTaken || ''} onChange={e => setEditFields({ ...editFields, actionTaken: e.target.value })} />
                </div>
              </>
            )}

            {activeSheet === 'payments' && (
              <>
                <div className="form-group">
                  <label>Payment ID</label>
                  <input type="text" className="form-input" value={editFields.id} disabled />
                </div>
                <div className="form-group">
                  <label>User Name</label>
                  <input type="text" className="form-input" value={editFields.userName} onChange={e => setEditFields({ ...editFields, userName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Payment Type</label>
                  <input type="text" className="form-input" value={editFields.paymentType} onChange={e => setEditFields({ ...editFields, paymentType: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input type="number" className="form-input" value={editFields.amount} onChange={e => setEditFields({ ...editFields, amount: e.target.value })} />
                </div>
              </>
            )}

            {activeSheet === 'students' && (
              <>
                <div className="form-group">
                  <label>Student ID</label>
                  <input type="text" className="form-input" value={editFields.id} disabled />
                </div>
                <div className="form-group">
                  <label>Student Name</label>
                  <input type="text" className="form-input" value={editFields.name} onChange={e => setEditFields({ ...editFields, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email Account</label>
                  <input type="email" className="form-input" value={editFields.email} onChange={e => setEditFields({ ...editFields, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Fee Status</label>
                  <select className="filter-input" value={editFields.feeStatus} onChange={e => setEditFields({ ...editFields, feeStatus: e.target.value })}>
                    <option value="Paid">Paid</option>
                    <option value="Outstanding">Outstanding</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </>
            )}

            {activeSheet === 'staff' && (
              <>
                <div className="form-group">
                  <label>Staff ID</label>
                  <input type="text" className="form-input" value={editFields.id} disabled />
                </div>
                <div className="form-group">
                  <label>Faculty Name</label>
                  <input type="text" className="form-input" value={editFields.name} onChange={e => setEditFields({ ...editFields, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contract Salary</label>
                  <input type="number" className="form-input" value={editFields.salary} onChange={e => setEditFields({ ...editFields, salary: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Advisory Dept</label>
                  <input type="text" className="form-input" value={editFields.department} onChange={e => setEditFields({ ...editFields, department: e.target.value })} />
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
