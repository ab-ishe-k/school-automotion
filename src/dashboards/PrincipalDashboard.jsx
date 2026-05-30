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
  Search
} from 'lucide-react';

const PrincipalDashboard = ({ activeSection, setActiveSection }) => {
  const { 
    appointments, 
    queries, 
    complaints, 
    auditLogs, 
    approveAppointment, 
    rejectAppointment, 
    rescheduleAppointment,
    updateComplaintStatus 
  } = useDatabase();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, escalations, audits

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
  const [selectedApt, setSelectedApt] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  const [actionType, setActionType] = useState(''); // approve, reject, reschedule
  
  // Reschedule states
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

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

  // 2. PREPARE Chart Data
  const trendData = [
    { label: 'Jan', value: 12 },
    { label: 'Feb', value: 19 },
    { label: 'Mar', value: 26 },
    { label: 'Apr', value: 34 },
    { label: 'May', value: totalAppointments + totalQueries + totalComplaints }
  ];

  // Count complaints by type
  const complaintTypeMap = complaints.reduce((acc, c) => {
    acc[c.complaintType] = (acc[c.complaintType] || 0) + 1;
    return acc;
  }, {});

  const complaintDistribution = Object.keys(complaintTypeMap).map((key, idx) => ({
    label: key,
    value: complaintTypeMap[key],
    color: `hsl(${190 + idx * 45}, 80%, 45%)`
  }));

  // 3. ACTION QUEUES
  const principalApprovals = appointments.filter(a => 
    a.department === 'Principal' && a.status === 'PENDING'
  );

  const escalatedComplaintsList = complaints.filter(c => 
    c.isEscalated && c.status !== 'Resolved'
  );

  const handleActionClick = (apt, type) => {
    setSelectedApt(apt);
    setActionType(type);
    setResolutionText('');
    setNewDate('');
    setNewTime('');
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      approveAppointment(selectedApt.id, resolutionText, currentUser);
    } else if (actionType === 'reject') {
      rejectAppointment(selectedApt.id, resolutionText, currentUser);
    } else if (actionType === 'reschedule') {
      if (!newDate || !newTime) return;
      rescheduleAppointment(selectedApt.id, newDate, newTime, currentUser);
    }
    setSelectedApt(null);
  };

  const handleResolveComplaint = (cmpId, actionText) => {
    updateComplaintStatus(cmpId, { status: 'Resolved', actionTaken: actionText }, currentUser);
  };

  return (
    <div className="dashboard-viewport">
      {/* Dashboard Metrics summary bar */}
      <DashboardCards stats={stats} />

      {/* Main Section Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px', overflowX: 'auto' }}>
        {['overview', 'approvals', 'escalations', 'audits'].map(tab => (
          <button
            key={tab}
            className={`btn`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2.5px solid var(--primary-light)' : 'none',
              color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-secondary)',
              borderRadius: '0',
              padding: '10px 16px',
              fontWeight: '700',
              fontSize: '14px',
              textTransform: 'capitalize'
            }}
            onClick={() => {
              setActiveTab(tab);
              if (setActiveSection) {
                if (tab === 'overview') setActiveSection('dashboard');
                else if (tab === 'approvals') setActiveSection('appointments');
                else if (tab === 'escalations') setActiveSection('complaints');
                else if (tab === 'audits') setActiveSection('dashboard');
              }
            }}
          >
            {tab === 'audits' ? 'Security Audit Logs' : tab}
          </button>
        ))}
      </div>

      {/* A. OVERVIEW PANEL */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Charts Row */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <TrendLineChart data={trendData} title="Monthly Intake Analytics" />
            <DonutChart data={complaintDistribution} title="Lodge Complaint Metrics" />
          </div>

          {/* Quick Tasks Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                        Approve Queue
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
                        Intervene
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. APPROVALS TAB */}
      {activeTab === 'approvals' && (
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
                  <th>Actions</th>
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--success)', borderColor: 'var(--success)' }}
                            onClick={() => handleActionClick(apt, 'approve')}
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--warning)', borderColor: 'var(--warning)' }}
                            onClick={() => handleActionClick(apt, 'reschedule')}
                          >
                            <RefreshCw size={12} />
                            Reschedule
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            onClick={() => handleActionClick(apt, 'reject')}
                          >
                            <X size={12} />
                            Decline
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

      {/* C. ESCALATIONS TAB */}
      {activeTab === 'escalations' && (
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
                  <th>Executive Remarks & Resolution</th>
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
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="filter-input" 
                            style={{ flex: 1, padding: '6px 12px' }}
                            placeholder="Add action taken..."
                            id={`action-${cmp.id}`}
                          />
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => {
                              const inputVal = document.getElementById(`action-${cmp.id}`).value;
                              if (!inputVal) return;
                              handleResolveComplaint(cmp.id, inputVal);
                            }}
                          >
                            Resolve Ticket
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

      {/* D. AUDIT LOGS TAB */}
      {activeTab === 'audits' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Real-time System Audit & Security Console</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
              🔒 Dynamic activity logs encrypt in SQLite virtual memory.
            </span>
          </div>

          <div className="audit-timeline">
            {auditLogs.slice(0, 10).map(log => (
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

      {/* UNIVERSAL MODAL POPUPS */}
      <Modal
        isOpen={selectedApt !== null}
        onClose={() => setSelectedApt(null)}
        title={actionType === 'reschedule' ? 'Reschedule Appointment Slot' : 'Confirm Action'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelectedApt(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConfirmAction}>Confirm Update</button>
          </>
        }
      >
        {selectedApt && (
          <div>
            <p style={{ fontSize: '14px', marginBottom: '12px' }}>
              Updating appointment ticket <strong>{selectedApt.id}</strong> requested by {selectedApt.userName}.
            </p>

            {actionType === 'reschedule' ? (
              <div className="form-grid">
                <div className="form-group">
                  <label>New Available Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
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
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Resolution Remarks / Internal Notes</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="e.g. Schedule verified. Ready to review scholarship forms."
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PrincipalDashboard;
