import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import { TrendLineChart, DonutChart } from '../components/CustomChart';
import { 
  Check, 
  DollarSign, 
  AlertTriangle, 
  Truck, 
  Clock, 
  Users, 
  Activity, 
  CreditCard,
  BookOpen
} from 'lucide-react';

const VicePrincipalDashboard = ({ activeSection, setActiveSection }) => {
  const { 
    complaints, 
    staff, 
    payments, 
    updateComplaintStatus, 
    payTeacherSalary, 
    pushNotification 
  } = useDatabase();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, discipline-transport, payroll

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
  const [disbursingId, setDisbursingId] = useState(null);

  // 1. VP METRICS
  const activeTransportComplaints = complaints.filter(c => c.complaintType === 'Transport' && c.status !== 'Resolved');
  const disciplinaryIssues = complaints.filter(c => c.complaintType === 'Student behavior' && c.status !== 'Resolved');
  
  // Outstanding salary payments is staff count minus payments made this month
  const currentMonthSalaryPayments = payments.filter(p => p.paymentType === 'Teacher Salary');
  const pendingSalariesCount = staff.filter(teacher => 
    !currentMonthSalaryPayments.some(p => p.userName === teacher.name)
  ).length;

  const stats = {
    totalAppointments: staff.length, // Staff Headcount
    pendingAppointments: pendingSalariesCount, // Pending Payroll Dues
    totalQueries: activeTransportComplaints.length, // Transport Grievances
    resolvedQueries: complaints.filter(c => c.status === 'Resolved').length,
    totalComplaints: complaints.length,
    escalatedComplaints: disciplinaryIssues.length // Active Disciplinaries
  };

  // 2. DISCIPLINE & TRANSPORT DATA
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
    setDisbursingId(teacher.id);
    // Simulate transaction delay
    setTimeout(() => {
      payTeacherSalary(teacher.id, teacher.salary, currentUser);
      setDisbursingId(null);
    }, 1200);
  };

  // Prep Charts data
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

  return (
    <div className="dashboard-viewport">
      {/* Metrics sum summaries */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <h3>Staff payroll dues</h3>
            <span className="metric-value">{pendingSalariesCount} / {staff.length}</span>
            <div className="metric-trend trend-down">
              <span>Outstanding payouts</span>
            </div>
          </div>
          <div className="metric-icon-box warning">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Active Transport tickets</h3>
            <span className="metric-value">{activeTransportComplaints.length}</span>
            <div className="metric-trend trend-up">
              <span>Traffic bottleneck delays</span>
            </div>
          </div>
          <div className="metric-icon-box primary">
            <Truck size={20} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Active Disciplinary concerns</h3>
            <span className="metric-value">{disciplinaryIssues.length}</span>
            <div className="metric-trend trend-down">
              <span>Requires monitoring</span>
            </div>
          </div>
          <div className="metric-icon-box danger">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px', overflowX: 'auto' }}>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'overview' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'overview' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('overview'); setActiveSection && setActiveSection('dashboard'); }}
        >
          Executive Overview
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'discipline-transport' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'discipline-transport' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('discipline-transport'); setActiveSection && setActiveSection('complaints'); }}
        >
          Transport & Discipline Oversight ({activeGrievances.length})
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'payroll' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'payroll' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('payroll'); setActiveSection && setActiveSection('appointments'); }}
        >
          Faculty Payout Processing ({pendingSalariesCount})
        </button>
      </div>

      {/* A. OVERVIEW PANEL */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <TrendLineChart data={trendData} title="School Operations Flow Trends" />
            <DonutChart data={distributionData} title="Staff Salaries payout status" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Safety Operations and Incident Routing Desk</h3>
          
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
                            placeholder="Add incident resolve remarks..."
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
              💰 Approvals disburse transaction rows directly into virtual Payments Google Sheet.
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Faculty Name</th>
                  <th>Advisory Department</th>
                  <th>Email Account</th>
                  <th>Base Salary Dues</th>
                  <th>Payout Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(teacher => {
                  const isPaid = currentMonthSalaryPayments.some(p => p.userName === teacher.name);
                  const isProcessing = disbursingId === teacher.id;

                  return (
                    <tr key={teacher.id}>
                      <td style={{ fontWeight: '700' }}>{teacher.id}</td>
                      <td style={{ fontWeight: '600' }}>{teacher.name}</td>
                      <td>{teacher.department}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{teacher.email}</td>
                      <td style={{ fontWeight: '800', color: 'var(--primary-light)', fontSize: '15px' }}>
                        ${teacher.salary}
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
                            {isProcessing ? 'Processing Bank Wire...' : 'Approve Salary Disburse'}
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
    </div>
  );
};

export default VicePrincipalDashboard;
