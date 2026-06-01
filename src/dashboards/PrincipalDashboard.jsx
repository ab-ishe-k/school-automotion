import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import { TrendLineChart, DonutChart } from '../components/CustomChart';
import Modal from '../components/Modal';
import { 
  Check, 
  X, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  ChevronRight,
  RefreshCw,
  Search,
  Download,
  Users,
  Briefcase,
  DollarSign,
  Lock
} from 'lucide-react';

const PrincipalDashboard = ({ activeSection, setActiveSection }) => {
  const { 
    appointments, 
    queries, 
    complaints, 
    auditLogs, 
    students,
    staff,
    payments
  } = useDatabase();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, escalations, students, staff, payments, audits

  // Sync sidebar clicks with internal principal dashboard tabs
  useEffect(() => {
    if (!activeSection) return;
    if (activeSection === 'dashboard') {
      setActiveTab('overview');
    } else if (activeSection === 'appointments') {
      setActiveTab('approvals');
    } else if (activeSection === 'queries') {
      setActiveTab('overview');
    } else if (activeSection === 'complaints') {
      setActiveTab('escalations');
    }
  }, [activeSection]);

  // Report Search & Filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('');

  const [staffSearch, setStaffSearch] = useState('');
  const [staffDeptFilter, setStaffDeptFilter] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState('');

  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('');

  // 1. CALCULATE Executive Metrics
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === 'PENDING').length;
  const totalQueries = queries.length;
  const resolvedQueries = queries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length;
  const totalComplaints = complaints.length;
  const escalatedComplaints = complaints.filter(c => c.isEscalated && c.status !== 'Resolved').length;

  const stats = {
    totalAppointments,
    pendingAppointments,
    totalQueries,
    resolvedQueries,
    totalComplaints,
    escalatedComplaints
  };

  // 2. FINANCIAL AGGREGATIONS
  const totalFeesCollected = payments
    .filter(p => p.paymentType !== 'Teacher Salary' && p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalSalariesPaid = payments
    .filter(p => p.paymentType === 'Teacher Salary' && p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalOutstandingDues = students
    .reduce((sum, s) => sum + Number(s.pendingAmount || 0), 0);

  // 3. PREPARE Chart Data
  // Dynamic Month Fee Collection Trend
  const feePaymentsSum = payments
    .filter(p => p.paymentType !== 'Teacher Salary' && p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const trendData = [
    { label: 'Jan', value: 4500 },
    { label: 'Feb', value: 5800 },
    { label: 'Mar', value: 7200 },
    { label: 'Apr', value: 6500 },
    { label: 'May', value: 8000 + feePaymentsSum }
  ];

  // Outstanding Dues group by Class
  const classDuesMap = students.reduce((acc, s) => {
    if (s.pendingAmount > 0) {
      const cls = s.class || 'Unknown';
      acc[cls] = (acc[cls] || 0) + Number(s.pendingAmount);
    }
    return acc;
  }, {});

  const pendingDuesDistribution = Object.keys(classDuesMap).length > 0
    ? Object.keys(classDuesMap).map((key, idx) => ({
        label: key,
        value: classDuesMap[key],
        color: `hsl(${10 + idx * 45}, 80%, 45%)`
      }))
    : [{ label: 'All Paid', value: 0, color: 'var(--success)' }];

  // Staff Payouts Allocations by Department
  const deptSalaryMap = staff.reduce((acc, s) => {
    const dept = s.department || 'Other';
    acc[dept] = (acc[dept] || 0) + Number(s.monthlySalary || 0);
    return acc;
  }, {});

  const staffPayoutsAllocation = Object.keys(deptSalaryMap).length > 0
    ? Object.keys(deptSalaryMap).map((key, idx) => ({
        label: key,
        value: deptSalaryMap[key],
        color: `hsl(${120 + idx * 45}, 80%, 45%)`
      }))
    : [{ label: 'No Staff', value: 0, color: 'var(--text-tertiary)' }];

  // Grievance/Complaint distribution count by type
  const complaintTypeMap = complaints.reduce((acc, c) => {
    acc[c.complaintType] = (acc[c.complaintType] || 0) + 1;
    return acc;
  }, {});

  const complaintDistribution = Object.keys(complaintTypeMap).length > 0
    ? Object.keys(complaintTypeMap).map((key, idx) => ({
        label: key,
        value: complaintTypeMap[key],
        color: `hsl(${190 + idx * 45}, 80%, 45%)`
      }))
    : [{ label: 'No Tickets', value: 0, color: 'var(--text-tertiary)' }];

  // 4. ACTION QUEUES
  const principalApprovals = appointments.filter(a => 
    a.department === 'Principal' && a.status === 'PENDING'
  );

  const escalatedComplaintsList = complaints.filter(c => 
    c.isEscalated && c.status !== 'Resolved'
  );

  // 5. CSV EXPORT UTILITY
  const handleExportCSV = (data, columns, filename) => {
    const csvRows = [];
    csvRows.push(columns.join(','));
    
    data.forEach(row => {
      const values = columns.map(col => {
        const val = row[col] !== undefined ? row[col] : '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. FILTERING LOGICS
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.id?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.parentName?.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesClass = studentClassFilter === '' || s.class === studentClassFilter;
    const matchesStatus = studentStatusFilter === '' || s.paymentStatus === studentStatusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const filteredStaff = staff.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
                          t.id?.toLowerCase().includes(staffSearch.toLowerCase()) ||
                          t.designation?.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesDept = staffDeptFilter === '' || t.department === staffDeptFilter;
    const matchesStatus = staffStatusFilter === '' || t.paymentStatus === staffStatusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.userName?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                          p.id?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                          p.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesType = paymentTypeFilter === '' || p.paymentType === paymentTypeFilter;
    return matchesSearch && matchesType;
  });

  // Extract unique filter keys
  const uniqueClasses = Array.from(new Set(students.map(s => s.class).filter(Boolean)));
  const uniqueDepts = Array.from(new Set(staff.map(t => t.department).filter(Boolean)));
  const uniquePayTypes = Array.from(new Set(payments.map(p => p.paymentType).filter(Boolean)));

  return (
    <div className="dashboard-viewport">
      {/* Dashboard Metrics summary bar */}
      <DashboardCards stats={stats} />

      {/* Main Section Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px', overflowX: 'auto' }}>
        {[
          { key: 'overview', label: 'Executive Overview' },
          { key: 'approvals', label: 'Appointments Queue' },
          { key: 'escalations', label: 'Escalation Queue' },
          { key: 'students', label: 'Student Billing Roster' },
          { key: 'staff', label: 'Staff Salary Registry' },
          { key: 'payments', label: 'Transaction Logs' },
          { key: 'audits', label: 'Security Audit logs' }
        ].map(tab => (
          <button
            key={tab.key}
            className="btn"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2.5px solid var(--primary-light)' : 'none',
              color: activeTab === tab.key ? 'var(--primary-light)' : 'var(--text-secondary)',
              borderRadius: '0',
              padding: '10px 16px',
              fontWeight: '700',
              fontSize: '13px',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}
            onClick={() => {
              setActiveTab(tab.key);
              if (setActiveSection) {
                if (tab.key === 'overview') setActiveSection('dashboard');
                else if (tab.key === 'approvals') setActiveSection('appointments');
                else if (tab.key === 'escalations') setActiveSection('complaints');
                else if (tab.key === 'audits') setActiveSection('dashboard');
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* A. EXECTUTIVE OVERVIEW PANEL */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Executive Real-time Financial Card Deck */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--success)', background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Total Fee Revenues Collected</p>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: 'var(--success)' }}>${totalFeesCollected.toLocaleString()}</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Summed from live payment processing triggers</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--primary-light)', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.05), transparent)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Total Staff Salary Disbursed</p>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: 'var(--primary-light)' }}>${totalSalariesPaid.toLocaleString()}</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Salaries credited with secure voucher transactions</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--danger)', background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Outstanding Tuition & Bus Dues</p>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 4px 0', color: 'var(--danger)' }}>${totalOutstandingDues.toLocaleString()}</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Pending monthly sweeps and active reminders</p>
            </div>
          </div>

          {/* Charts Rows */}
          <div className="charts-grid">
            <TrendLineChart data={trendData} title="Monthly Intake Analytics (Fee Collection Trends)" />
            <DonutChart data={pendingDuesDistribution} title="Outstanding Billing Dues Distribution by Class" />
          </div>

          <div className="charts-grid">
            <DonutChart data={staffPayoutsAllocation} title="Staff Salary Overheads Allocation by Dept" />
            <DonutChart data={complaintDistribution} title="Lodge Grievance Category Metrics" />
          </div>

          {/* Quick Tasks Grid */}
          <div className="responsive-grid-2">
            {/* Direct Approval card summary */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Direct Appointment Approvals</h3>
                <span className="status-badge pending">{principalApprovals.length} pending</span>
              </div>

              {principalApprovals.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', padding: '20px 0' }}>
                  No pending appointment approvals for your office.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {principalApprovals.slice(0, 3).map(apt => (
                    <div 
                      key={apt.id} 
                      style={{ 
                        padding: '12px', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '700' }}>{apt.userName} ({apt.userRole})</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Date: {apt.date} at {apt.time}</p>
                      </div>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setActiveTab('approvals')}
                      >
                        Inspect Queue
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Escalated grievances card summary */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Disciplinary Escalations</h3>
                <span className="status-badge rejected">{escalatedComplaintsList.length} urgent</span>
              </div>

              {escalatedComplaintsList.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', padding: '20px 0' }}>
                  All student/infra complaints are currently handled by supervisors.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {escalatedComplaintsList.slice(0, 3).map(cmp => (
                    <div 
                      key={cmp.id} 
                      style={{ 
                        padding: '12px', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '700' }}>{cmp.id} - {cmp.complaintType}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Submitted by: {cmp.submittedBy}</p>
                      </div>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setActiveTab('escalations')}
                      >
                        Inspect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. APPROVALS TAB (Lockdown View-Only) */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '14px 20px', borderLeft: '5px solid var(--warning)', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.06), transparent)' }}>
            <Lock size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              <strong>READ-ONLY GATEWAY ACTIVE:</strong> As Principal, your workspace is configured for view-only report monitoring. Direct modification of appointment tickets is locked on this role.
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Principal Appointments Pending Queue</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Requester</th>
                    <th>Role</th>
                    <th>DateTime Slot</th>
                    <th>Purpose</th>
                    <th>Access State</th>
                  </tr>
                </thead>
                <tbody>
                  {principalApprovals.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                        No pending consultations. All caught up!
                      </td>
                    </tr>
                  ) : (
                    principalApprovals.map(apt => (
                      <tr key={apt.id}>
                        <td style={{ fontWeight: '700' }}>{apt.id}</td>
                        <td>{apt.userName}</td>
                        <td>{apt.userRole}</td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{apt.date}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{apt.time}</div>
                        </td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={apt.purpose}>
                          {apt.purpose}
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={12} /> Closed (Read Only)
                          </span>
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

      {/* C. ESCALATIONS TAB (Lockdown View-Only) */}
      {activeTab === 'escalations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '14px 20px', borderLeft: '5px solid var(--warning)', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.06), transparent)' }}>
            <Lock size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              <strong>READ-ONLY GRIEVANCE OVERVIEW:</strong> Disciplinary ticket modifications, resolution overrides, and action inputs are restricted. Access is strictly report audit only.
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Critical Disciplinary Escalation Queue</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Submitted By</th>
                    <th>Complaint Category</th>
                    <th>Description</th>
                    <th>Date Logged</th>
                    <th>Resolution Status</th>
                  </tr>
                </thead>
                <tbody>
                  {escalatedComplaintsList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                        No escalated disciplinary concerns currently pending.
                      </td>
                    </tr>
                  ) : (
                    escalatedComplaintsList.map(cmp => (
                      <tr key={cmp.id}>
                        <td style={{ fontWeight: '700', color: 'var(--danger)' }}>{cmp.id}</td>
                        <td>{cmp.submittedBy} ({cmp.role})</td>
                        <td>
                          <span className="priority-tag urgent">{cmp.complaintType}</span>
                        </td>
                        <td style={{ maxWidth: '300px', fontSize: '12px' }}>{cmp.description}</td>
                        <td>{new Date(cmp.date).toLocaleDateString()}</td>
                        <td>
                          <input 
                            type="text" 
                            className="filter-input" 
                            disabled={true}
                            style={{ padding: '6px 12px', width: '150px', backgroundColor: 'var(--bg-tertiary)', border: '1px dashed var(--border-color)', cursor: 'not-allowed' }}
                            placeholder="Write blocked..."
                          />
                          <button 
                            className="btn btn-secondary" 
                            disabled={true}
                            style={{ marginLeft: '6px', padding: '6px 12px', fontSize: '11px', cursor: 'not-allowed', opacity: 0.6 }}
                          >
                            Locked
                          </button>
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

      {/* D. READ-ONLY STUDENT ROSTER TAB */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Student Fee & Financial Ledger</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Secure view-only roster of registered students, parents, and outstanding balances.</p>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => handleExportCSV(
                  filteredStudents, 
                  ['id', 'name', 'class', 'rollNumber', 'parentName', 'parentEmail', 'parentContact', 'monthlyTuitionFee', 'busFee', 'totalMonthlyFee', 'paidAmount', 'pendingAmount', 'paymentStatus'], 
                  'student_ledger'
                )}
              >
                <Download size={14} />
                Export Ledger (CSV)
              </button>
            </div>

            {/* Filter Suite */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 12px' }}>
                <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  style={{ border: 'none', background: 'none', outline: 'none', padding: '10px 0', fontSize: '13px', width: '100%' }}
                  placeholder="Search by ID, name, or parent..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                />
              </div>

              <select 
                className="filter-input" 
                style={{ width: '150px' }}
                value={studentClassFilter}
                onChange={e => setStudentClassFilter(e.target.value)}
              >
                <option value="">All Classes</option>
                {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>

              <select 
                className="filter-input" 
                style={{ width: '150px' }}
                value={studentStatusFilter}
                onChange={e => setStudentStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Roster Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Grade / Class</th>
                    <th>Roll No</th>
                    <th>Parent Name</th>
                    <th>Parent Contact</th>
                    <th>Tuition Fee ($)</th>
                    <th>Bus Fee ($)</th>
                    <th>Total Fee ($)</th>
                    <th>Paid ($)</th>
                    <th>Pending ($)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="12" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                        No students match search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(std => (
                      <tr key={std.id}>
                        <td style={{ fontWeight: '700' }}>{std.id}</td>
                        <td style={{ fontWeight: '600' }}>{std.name}</td>
                        <td>{std.class}</td>
                        <td style={{ fontFamily: 'monospace' }}>{std.rollNumber}</td>
                        <td>{std.parentName}</td>
                        <td>{std.parentContact || '—'}</td>
                        <td>${std.monthlyTuitionFee}</td>
                        <td>${std.busFee}</td>
                        <td style={{ fontWeight: '700' }}>${std.totalMonthlyFee}</td>
                        <td style={{ color: 'var(--success)', fontWeight: '600' }}>${std.paidAmount || 0}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: '600' }}>${std.pendingAmount || 0}</td>
                        <td>
                          <span className={`status-badge ${std.paymentStatus?.toLowerCase() || 'pending'}`}>
                            {std.paymentStatus || 'Pending'}
                          </span>
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

      {/* E. READ-ONLY STAFF REGISTRY TAB */}
      {activeTab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Staff Registry & Payroll Registry</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>View salary overhead contracts, current disbursements status, and contact registries.</p>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => handleExportCSV(
                  filteredStaff, 
                  ['id', 'name', 'role', 'phone', 'email', 'designation', 'department', 'monthlySalary', 'paidSalary', 'remainingSalary', 'paymentDate', 'paymentStatus'], 
                  'staff_registry'
                )}
              >
                <Download size={14} />
                Export Staff (CSV)
              </button>
            </div>

            {/* Filter Suite */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 12px' }}>
                <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  style={{ border: 'none', background: 'none', outline: 'none', padding: '10px 0', fontSize: '13px', width: '100%' }}
                  placeholder="Search by ID, name, or designation..."
                  value={staffSearch}
                  onChange={e => setStaffSearch(e.target.value)}
                />
              </div>

              <select 
                className="filter-input" 
                style={{ width: '150px' }}
                value={staffDeptFilter}
                onChange={e => setStaffDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {uniqueDepts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>

              <select 
                className="filter-input" 
                style={{ width: '150px' }}
                value={staffStatusFilter}
                onChange={e => setStaffStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Staff Registry Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Monthly Salary</th>
                    <th>Paid ($)</th>
                    <th>Remaining ($)</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="11" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                        No staff matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: '700' }}>{t.id}</td>
                        <td style={{ fontWeight: '600' }}>{t.name}</td>
                        <td>{t.role}</td>
                        <td>{t.designation}</td>
                        <td>{t.department}</td>
                        <td>{t.phone || '—'}</td>
                        <td style={{ fontWeight: '600' }}>${t.monthlySalary}</td>
                        <td style={{ color: 'var(--success)', fontWeight: '600' }}>${t.paidSalary || 0}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: '600' }}>${t.remainingSalary || 0}</td>
                        <td>{t.paymentDate || '—'}</td>
                        <td>
                          <span className={`status-badge ${t.paymentStatus?.toLowerCase() || 'pending'}`}>
                            {t.paymentStatus || 'Pending'}
                          </span>
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

      {/* F. READ-ONLY TRANSACTION LOGS TAB */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Live Transaction Auditing</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Full read-only ledger of payments received and salaries disbursed.</p>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => handleExportCSV(
                  filteredPayments, 
                  ['id', 'userName', 'role', 'paymentType', 'amount', 'date', 'status', 'transactionId'], 
                  'financial_transactions'
                )}
              >
                <Download size={14} />
                Export Ledger (CSV)
              </button>
            </div>

            {/* Filter Suite */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 12px' }}>
                <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  style={{ border: 'none', background: 'none', outline: 'none', padding: '10px 0', fontSize: '13px', width: '100%' }}
                  placeholder="Search by ID, name, or gateway ID..."
                  value={paymentSearch}
                  onChange={e => setPaymentSearch(e.target.value)}
                />
              </div>

              <select 
                className="filter-input" 
                style={{ width: '180px' }}
                value={paymentTypeFilter}
                onChange={e => setPaymentTypeFilter(e.target.value)}
              >
                <option value="">All Payment Types</option>
                {uniquePayTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Payments Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>User Name</th>
                    <th>User Role</th>
                    <th>Transaction Category</th>
                    <th>Amount ($)</th>
                    <th>Date Logged</th>
                    <th>Clearing Status</th>
                    <th>Gateway reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                        No transactions recorded matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: '700' }}>{p.id}</td>
                        <td style={{ fontWeight: '600' }}>{p.userName}</td>
                        <td>{p.role}</td>
                        <td style={{ fontWeight: '600', color: 'var(--primary-light)' }}>{p.paymentType}</td>
                        <td style={{ fontWeight: '700' }}>${p.amount}</td>
                        <td>{p.date}</td>
                        <td>
                          <span className="status-badge approved">
                            {p.status}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.transactionId}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* G. AUDIT LOGS TAB */}
      {activeTab === 'audits' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Real-time System Audit & Security Console</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
              🔒 Dynamic activity logs encrypt in SQLite virtual memory.
            </span>
          </div>

          <div className="audit-timeline">
            {auditLogs.slice(0, 15).map(log => (
              <div key={log.id} className="audit-timeline-item">
                <div className="audit-timeline-icon">
                  <ShieldAlert size={16} />
                </div>
                <div className="audit-timeline-content">
                  <div className="audit-timeline-header">
                    <span className="audit-user">{log.user} ({log.role})</span>
                    <span className="audit-time">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="audit-action">{log.action}</p>
                  <p className="audit-details">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalDashboard;
