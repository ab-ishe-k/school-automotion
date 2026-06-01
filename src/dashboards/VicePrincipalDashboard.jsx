import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import { TrendLineChart, DonutChart } from '../components/CustomChart';
import Modal from '../components/Modal';
import { 
  Check, 
  DollarSign, 
  AlertTriangle, 
  Truck, 
  Clock, 
  Users, 
  Activity, 
  CreditCard,
  BookOpen,
  Search,
  Edit2,
  ShieldAlert,
  FileText
} from 'lucide-react';

const VicePrincipalDashboard = ({ activeSection, setActiveSection }) => {
  const { 
    complaints, 
    staff, 
    students,
    payments, 
    updateComplaintStatus, 
    payTeacherSalary, 
    payFee,
    updateSheetRow,
    pushNotification 
  } = useDatabase();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, discipline-transport, payroll, student-fees, registry-editor

  // Sync sidebar clicks with internal VP dashboard tabs
  useEffect(() => {
    if (!activeSection) return;
    if (activeSection === 'dashboard') {
      setActiveTab('overview');
    } else if (activeSection === 'appointments') {
      setActiveTab('payroll');
    } else if (activeSection === 'queries') {
      setActiveTab('overview');
    } else if (activeSection === 'complaints') {
      setActiveTab('discipline-transport');
    }
  }, [activeSection]);

  // VP Payroll States
  const [disbursingId, setDisbursingId] = useState(null);
  const [disburseAmounts, setDisburseAmounts] = useState({});

  // Student Fee Collection States
  const [collectingStudent, setCollectingStudent] = useState(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [collectCategory, setCollectCategory] = useState('Tuition Fee');

  // Registry Editor States
  const [editingItem, setEditingItem] = useState(null); // { type: 'student'|'staff', data }
  const [editFields, setEditFields] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // 1. VP METRICS
  const activeTransportComplaints = complaints.filter(c => c.complaintType === 'Transport' && c.status !== 'Resolved');
  const disciplinaryIssues = complaints.filter(c => c.complaintType === 'Student behavior' && c.status !== 'Resolved');
  
  const currentMonthSalaryPayments = payments.filter(p => p.paymentType === 'Teacher Salary');
  const pendingSalariesCount = staff.filter(teacher => 
    !currentMonthSalaryPayments.some(p => p.userName === teacher.name)
  ).length;

  const totalOutstandingFees = students.reduce((sum, s) => sum + Number(s.pendingAmount || 0), 0);
  const pendingStudentsCount = students.filter(s => s.pendingAmount > 0).length;

  const stats = {
    totalAppointments: staff.length, // Staff Headcount
    pendingAppointments: pendingSalariesCount, // Pending Payroll Dues
    totalQueries: activeTransportComplaints.length, // Transport Grievances
    resolvedQueries: complaints.filter(c => c.status === 'Resolved').length,
    totalComplaints: complaints.length,
    escalatedComplaints: disciplinaryIssues.length // Active Disciplinaries
  };

  // 2. DISCIPLINE & TRANSPORT
  const activeGrievances = complaints.filter(c => 
    (c.complaintType === 'Transport' || c.complaintType === 'Student behavior') &&
    c.status !== 'Resolved'
  );

  const handleResolveComplaint = (id, remarks) => {
    updateComplaintStatus(id, { status: 'Resolved', actionTaken: remarks }, currentUser);
    pushNotification(`Grievance ticket ${id} resolved.`, 'success');
  };

  // 3. PAYROLL PROCESSING
  const handleDisburseSalary = (teacher) => {
    const amountToPay = Number(disburseAmounts[teacher.id] !== undefined ? disburseAmounts[teacher.id] : (teacher.remainingSalary !== undefined ? teacher.remainingSalary : teacher.salary));
    if (isNaN(amountToPay) || amountToPay <= 0) {
      alert("Please enter a valid salary disbursement amount.");
      return;
    }
    setDisbursingId(teacher.id);
    setTimeout(() => {
      payTeacherSalary(teacher.id, amountToPay, currentUser);
      setDisbursingId(null);
    }, 1200);
  };

  // 4. STUDENT FEE COLLECTION SUBMIT
  const handleCollectFeeSubmit = (e) => {
    e.preventDefault();
    if (!collectAmount || isNaN(collectAmount) || Number(collectAmount) <= 0) {
      alert("Please enter a valid positive payment amount.");
      return;
    }

    const payer = collectingStudent.parentName || collectingStudent.name;
    
    payFee(
      payer,
      collectCategory,
      collectAmount,
      { cardHolder: 'VP Office Cashier' },
      { name: collectingStudent.name, role: 'Parent' } // mock payment author context for Liam/student
    );

    setCollectingStudent(null);
    setCollectAmount('');
  };

  // 5. REGISTRY EDITOR SAVE
  const handleSaveEditor = (e) => {
    e.preventDefault();
    const sheetName = editingItem.type === 'student' ? 'students' : 'staff';
    
    // Save locally & trigger audit
    updateSheetRow(sheetName, editingItem.data.id, editFields, currentUser);
    
    pushNotification(`Updated ${sheetName === 'students' ? 'student' : 'staff'} record: ${editingItem.data.name}`, 'success');
    setEditingItem(null);
    setEditFields({});
  };

  // Charts
  const trendData = [
    { label: 'Feb', value: 8 },
    { label: 'Mar', value: 14 },
    { label: 'Apr', value: 10 },
    { label: 'May', value: staff.length + activeGrievances.length }
  ];

  const distributionData = [
    { label: 'Pending Salaries', value: pendingSalariesCount, color: '#f59e0b' },
    { label: 'Paid Salaries', value: currentMonthSalaryPayments.length, color: '#10b981' }
  ];

  // Filtering
  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStaff = staff.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-viewport">
      {/* Metrics sum summaries */}
      <DashboardCards stats={stats} />

      {/* Navigation tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px', overflowX: 'auto' }}>
        {[
          { key: 'overview', label: 'Executive Overview' },
          { key: 'discipline-transport', label: `Incidents oversight (${activeGrievances.length})` },
          { key: 'payroll', label: `Staff Payouts Queue (${pendingSalariesCount})` },
          { key: 'student-fees', label: `Collect Student Fees` },
          { key: 'registry-editor', label: `Database Registry Editor` }
        ].map(tab => (
          <button 
            key={tab.key}
            className="btn"
            style={{
              background: 'none', border: 'none',
              borderBottom: activeTab === tab.key ? '2.5px solid var(--primary-light)' : 'none',
              color: activeTab === tab.key ? 'var(--primary-light)' : 'var(--text-secondary)',
              borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '13px',
              whiteSpace: 'nowrap'
            }}
            onClick={() => { setActiveTab(tab.key); setActiveSection && setActiveSection('dashboard'); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* A. OVERVIEW PANEL */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--warning)', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Outstanding Student Fees</p>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: 'var(--warning)' }}>${totalOutstandingDues.toLocaleString()}</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Across {pendingStudentsCount} students with outstanding balances</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--primary-light)', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.05), transparent)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Unpaid Faculty Salaries</p>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: 'var(--primary-light)' }}>${staff.filter(t => t.paymentStatus !== 'Paid').reduce((sum, t) => sum + Number(t.remainingSalary || 0), 0).toLocaleString()}</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Pending monthly sweeps or partial allocations</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <TrendLineChart data={trendData} title="School Operations Flow Trends" />
            <DonutChart data={distributionData} title="Staff Salaries payout status" />
          </div>

          <div className="responsive-grid-2">
            {/* Quick Grievances summary */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Active Transit & Safety alerts</h3>
                <span className="status-badge pending">{activeGrievances.length} active</span>
              </div>

              {activeGrievances.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', padding: '20px 0' }}>
                  No active safety alerts logged.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeGrievances.slice(0, 3).map(cmp => (
                    <div key={cmp.id} style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>{cmp.id} - {cmp.complaintType}</span>
                        <span className="priority-tag urgent">URGENT VP</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>"{cmp.description}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Payroll ledger status */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Monthly Salary Credit Queue</h3>
                <span className="status-badge resolved">{currentMonthSalaryPayments.length} credited</span>
              </div>

              {currentMonthSalaryPayments.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', padding: '20px 0' }}>
                  No salaries disbursed this cycle. Open the payroll tab to begin payouts.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentMonthSalaryPayments.slice(0, 3).map(pay => (
                    <div key={pay.id} style={{ padding: '10px 12px', backgroundColor: 'var(--success-bg)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)' }}>{pay.userName}</p>
                        <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Tx Ref: {pay.transactionId}</p>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--success)' }}>${pay.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. TRANSPORT & DISCIPLINE TAB */}
      {activeTab === 'discipline-transport' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Safety Operations and Incident Incident Desk</h3>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Grievance Type</th>
                  <th>Submitted By</th>
                  <th>Incident details</th>
                  <th>Action Remarks</th>
                </tr>
              </thead>
              <tbody>
                {activeGrievances.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No safety or corridor discipline alerts currently unresolved.
                    </td>
                  </tr>
                ) : (
                  activeGrievances.map(cmp => (
                    <tr key={cmp.id}>
                      <td style={{ fontWeight: '700', color: 'var(--danger)' }}>{cmp.id}</td>
                      <td>
                        <span className="priority-tag urgent">{cmp.complaintType}</span>
                      </td>
                      <td>{cmp.submittedBy} ({cmp.role})</td>
                      <td style={{ maxWidth: '300px', fontSize: '12px' }}>{cmp.description}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="filter-input" 
                            style={{ flex: 1, padding: '6px 12px' }}
                            placeholder="Add VP resolve remarks..."
                            id={`vp-resolve-${cmp.id}`}
                          />
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => {
                              const inputVal = document.getElementById(`vp-resolve-${cmp.id}`).value;
                              if (!inputVal) return;
                              handleResolveComplaint(cmp.id, inputVal);
                            }}
                          >
                            Resolve Log
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
      )}

      {/* C. PAYROLL TAB */}
      {activeTab === 'payroll' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Faculty Monthly Salary Approvals Console</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
              💰 VP disburse allows custom/partial payouts.
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Faculty Name</th>
                  <th>Department</th>
                  <th>Monthly Contract</th>
                  <th>Paid Dues</th>
                  <th>Outstanding Salary</th>
                  <th>Disburse Amount ($)</th>
                  <th>Payout Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(teacher => {
                  const isPaid = teacher.paymentStatus === 'Paid';
                  const isProcessing = disbursingId === teacher.id;
                  const currentRemaining = teacher.remainingSalary !== undefined ? teacher.remainingSalary : teacher.salary;

                  return (
                    <tr key={teacher.id}>
                      <td style={{ fontWeight: '700' }}>{teacher.id}</td>
                      <td style={{ fontWeight: '600' }}>{teacher.name}</td>
                      <td>{teacher.department}</td>
                      <td style={{ fontWeight: '700' }}>${teacher.monthlySalary || teacher.salary}</td>
                      <td style={{ color: 'var(--success)', fontWeight: '600' }}>${teacher.paidSalary || 0}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: '600' }}>${currentRemaining}</td>
                      <td>
                        <input 
                          type="number"
                          className="filter-input"
                          style={{ width: '100px', padding: '4px 8px' }}
                          disabled={isPaid}
                          placeholder={String(currentRemaining)}
                          value={disburseAmounts[teacher.id] !== undefined ? disburseAmounts[teacher.id] : ''}
                          onChange={e => setDisburseAmounts(prev => ({ ...prev, [teacher.id]: e.target.value }))}
                        />
                      </td>
                      <td>
                        {isPaid ? (
                          <span className="status-badge approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={12} />
                            CREDITED SUCCESSFUL
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '11px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              backgroundColor: isProcessing ? 'var(--text-tertiary)' : 'var(--success)',
                              borderColor: 'transparent'
                            }}
                            onClick={() => handleDisburseSalary(teacher)}
                            disabled={isProcessing}
                          >
                            <CreditCard size={12} />
                            {isProcessing ? 'Processing wire...' : 'Collect payout'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* D. STUDENT FEES TAB */}
      {activeTab === 'student-fees' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Student Fee Cashier Payments Collector</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 10px' }}>
              <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                className="filter-input" 
                style={{ border: 'none', padding: '8px 0', outline: 'none' }}
                placeholder="Search students..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Tuition Dues</th>
                  <th>Bus Dues</th>
                  <th>Total Monthly</th>
                  <th>Paid Amount</th>
                  <th>Pending Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>No matching student records found.</td>
                  </tr>
                ) : (
                  filteredStudents.map(std => (
                    <tr key={std.id}>
                      <td style={{ fontWeight: '700' }}>{std.id}</td>
                      <td style={{ fontWeight: '600' }}>{std.name}</td>
                      <td>{std.class}</td>
                      <td>${std.monthlyTuitionFee}</td>
                      <td>${std.busFee}</td>
                      <td style={{ fontWeight: '700' }}>${std.totalMonthlyFee}</td>
                      <td style={{ color: 'var(--success)' }}>${std.paidAmount || 0}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: '700' }}>${std.pendingAmount || 0}</td>
                      <td>
                        <span className={`status-badge ${std.paymentStatus?.toLowerCase() || 'pending'}`}>{std.paymentStatus || 'Pending'}</span>
                      </td>
                      <td>
                        {std.pendingAmount <= 0 ? (
                          <span className="status-badge approved">Fully Cleared</span>
                        ) : (
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', borderColor: 'var(--success)' }}
                            onClick={() => {
                              setCollectingStudent(std);
                              setCollectAmount(String(std.pendingAmount));
                              setCollectCategory('Tuition Fee');
                            }}
                          >
                            <CreditCard size={12} /> Collect Fee
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
      )}

      {/* E. DATABASE REGISTRY EDITOR */}
      {activeTab === 'registry-editor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Operations Registry Editor Console</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click edit to override fee balances, designations, salaries, or department lines.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 10px' }}>
                <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  className="filter-input" 
                  style={{ border: 'none', padding: '8px 0', outline: 'none' }}
                  placeholder="Global registry search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Students Sub-ledger */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--primary-light)' }}>Registered Student Ward Accounts</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Parent Name</th>
                      <th>Contact Phone</th>
                      <th>Tuition Fee ($)</th>
                      <th>Bus Fee ($)</th>
                      <th>Paid ($)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(std => (
                      <tr key={std.id}>
                        <td style={{ fontWeight: '700' }}>{std.id}</td>
                        <td style={{ fontWeight: '600' }}>{std.name}</td>
                        <td>{std.class}</td>
                        <td>{std.parentName}</td>
                        <td>{std.parentContact || '—'}</td>
                        <td>${std.monthlyTuitionFee}</td>
                        <td>${std.busFee}</td>
                        <td>${std.paidAmount || 0}</td>
                        <td>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setEditingItem({ type: 'student', data: std });
                              setEditFields({
                                parentName: std.parentName,
                                parentContact: std.parentContact || '',
                                parentEmail: std.parentEmail || '',
                                monthlyTuitionFee: std.monthlyTuitionFee,
                                busFee: std.busFee
                              });
                            }}
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Staff Sub-ledger */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--success)' }}>Hired Faculty Salaries Contracts</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Designation</th>
                      <th>Department</th>
                      <th>Contact Phone</th>
                      <th>Contract Salary ($)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: '700' }}>{t.id}</td>
                        <td style={{ fontWeight: '600' }}>{t.name}</td>
                        <td>{t.designation}</td>
                        <td>{t.department}</td>
                        <td>{t.phone}</td>
                        <td style={{ fontWeight: '700' }}>${t.monthlySalary || t.salary}</td>
                        <td>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setEditingItem({ type: 'staff', data: t });
                              setEditFields({
                                designation: t.designation,
                                department: t.department,
                                phone: t.phone || '',
                                monthlySalary: t.monthlySalary || t.salary,
                                salary: t.monthlySalary || t.salary
                              });
                            }}
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLLECT FEE MODAL */}
      <Modal
        isOpen={collectingStudent !== null}
        onClose={() => setCollectingStudent(null)}
        title="Collect Student Cashier Payment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCollectingStudent(null)}>Cancel</button>
          </>
        }
      >
        {collectingStudent && (
          <form onSubmit={handleCollectFeeSubmit}>
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'var(--bg-tertiary)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Selected Roster Account</p>
              <strong style={{ fontSize: '15px' }}>{collectingStudent.name} ({collectingStudent.class})</strong>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Total Due Pending:</span>
                <strong style={{ color: 'var(--danger)' }}>${collectingStudent.pendingAmount}</strong>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Payment Category</label>
                <select 
                  className="filter-input" 
                  value={collectCategory} 
                  onChange={e => setCollectCategory(e.target.value)}
                >
                  <option value="Tuition Fee">Tuition Fee dues</option>
                  <option value="Bus Fee">School Bus transportation fee</option>
                  <option value="Incidentals">Incidentals & Lab deposits</option>
                </select>
              </div>

              <div className="form-group">
                <label>Collected Cash Amount ($)</label>
                <input 
                  type="number"
                  className="form-input"
                  required
                  placeholder={String(collectingStudent.pendingAmount)}
                  value={collectAmount}
                  onChange={e => setCollectAmount(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '12px', height: '42px', fontSize: '14px', backgroundColor: 'var(--success)', borderColor: 'transparent' }}
            >
              Post Cashier Payment of ${collectAmount || '0'}
            </button>
          </form>
        )}
      </Modal>

      {/* REGISTRY EDITOR MODAL */}
      <Modal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title={`Edit Operations Registry - ${editingItem?.type === 'student' ? 'Student' : 'Staff'} Account`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditingItem(null)}>Discard</button>
          </>
        }
      >
        {editingItem && (
          <form onSubmit={handleSaveEditor}>
            <div className="glass-panel" style={{ padding: '12px 16px', marginBottom: '20px', backgroundColor: 'var(--bg-tertiary)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Registered Account Key</p>
              <strong style={{ fontSize: '14px' }}>{editingItem.data.id} — {editingItem.data.name}</strong>
            </div>

            {editingItem.type === 'student' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Parent/Guardian Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={editFields.parentName || ''}
                    onChange={e => setEditFields(prev => ({ ...prev, parentName: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Parent Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={editFields.parentContact || ''}
                    onChange={e => setEditFields(prev => ({ ...prev, parentContact: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Parent Notification Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    required
                    value={editFields.parentEmail || ''}
                    onChange={e => setEditFields(prev => ({ ...prev, parentEmail: e.target.value }))}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Tuition Fee Rate ($)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      required
                      value={editFields.monthlyTuitionFee || 0}
                      onChange={e => setEditFields(prev => {
                        const val = Number(e.target.value);
                        return { 
                          ...prev, 
                          monthlyTuitionFee: val,
                          totalMonthlyFee: val + Number(prev.busFee || 0),
                          pendingAmount: val + Number(prev.busFee || 0) - Number(editingItem.data.paidAmount || 0)
                        };
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Bus Fee Rate ($)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      required
                      value={editFields.busFee || 0}
                      onChange={e => setEditFields(prev => {
                        const val = Number(e.target.value);
                        return { 
                          ...prev, 
                          busFee: val,
                          totalMonthlyFee: val + Number(prev.monthlyTuitionFee || 0),
                          pendingAmount: val + Number(prev.monthlyTuitionFee || 0) - Number(editingItem.data.paidAmount || 0)
                        };
                      })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Professional Designation</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={editFields.designation || ''}
                    onChange={e => setEditFields(prev => ({ ...prev, designation: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Advisory Department</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={editFields.department || ''}
                    onChange={e => setEditFields(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Contract Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={editFields.phone || ''}
                    onChange={e => setEditFields(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Monthly Salary Contract ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={editFields.monthlySalary || 0}
                    onChange={e => setEditFields(prev => {
                      const val = Number(e.target.value);
                      return { 
                        ...prev, 
                        monthlySalary: val,
                        salary: String(val),
                        remainingSalary: val - Number(editingItem.data.paidSalary || 0)
                      };
                    })}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '16px', height: '42px', fontSize: '14px' }}
            >
              Commit Changes & Recalculate Ledger
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default VicePrincipalDashboard;
