import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import { TrendLineChart } from '../components/CustomChart';
import { 
  Check, 
  MessageSquare, 
  Calendar, 
  User, 
  FileText,
  FileCheck,
  Search
} from 'lucide-react';

const TeacherDashboard = ({ activeSection, setActiveSection }) => {
  const { 
    appointments, 
    queries, 
    leaves,
    applyLeave,
    updateLeaveStatus,
    updateQueryStatus, 
    pushNotification 
  } = useDatabase();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, queries, leaves

  // Sync sidebar clicks with internal teacher dashboard tabs
  useEffect(() => {
    if (!activeSection) return;
    if (activeSection === 'dashboard') {
      setActiveTab('appointments');
    } else if (activeSection === 'appointments') {
      setActiveTab('appointments');
    } else if (activeSection === 'queries') {
      setActiveTab('queries');
    } else if (activeSection === 'complaints') {
      setActiveTab('queries');
    } else if (activeSection === 'leaves') {
      setActiveTab('leaves');
    }
  }, [activeSection]);
  const [resolutionInput, setResolutionInput] = useState('');
  const [selectedQueryId, setSelectedQueryId] = useState(null);

  // 1. FILTER ITEMS ASSIGNED TO THIS TEACHER
  // Our quick teacher is "Mr. Marcus Davis"
  const teacherName = currentUser.name;
  
  const teacherConsultations = appointments.filter(apt => 
    apt.appointmentWith.includes(teacherName) && 
    (apt.status === 'APPROVED' || apt.status === 'PENDING')
  );

  const teacherQueries = queries.filter(q => 
    q.assignedTo.includes(teacherName)
  );

  const pendingQueries = teacherQueries.filter(q => q.status !== 'Resolved' && q.status !== 'Closed');

  // Teacher Leaves Filtering
  const studentLeavesForTeacher = (leaves || []).filter(l => l.applicantRole === 'Student' && l.assignedTo === teacherName);
  const teacherOwnLeaves = (leaves || []).filter(l => l.applicantName === teacherName && l.applicantRole === 'Teacher');

  // Teacher Leave Form States
  const [teacherLeaveStart, setTeacherLeaveStart] = useState('');
  const [teacherLeaveEnd, setTeacherLeaveEnd] = useState('');
  const [teacherLeaveType, setTeacherLeaveType] = useState('Sick Leave');
  const [teacherLeaveReason, setTeacherLeaveReason] = useState('');
  const [leaveSubTab, setLeaveSubTab] = useState('wards'); // wards, self

  // Teacher Review Remarks State
  const [reviewRemarks, setReviewRemarks] = useState({});

  // Compute stats
  const stats = {
    totalAppointments: teacherConsultations.length,
    pendingAppointments: teacherConsultations.filter(a => a.status === 'PENDING').length,
    totalQueries: teacherQueries.length,
    resolvedQueries: teacherQueries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length,
    totalComplaints: studentLeavesForTeacher.filter(l => l.status === 'Pending').length,
    escalatedComplaints: teacherOwnLeaves.filter(l => l.status === 'Pending').length
  };

  const handleResolveQuery = (id) => {
    if (!resolutionInput) return;
    updateQueryStatus(id, 'Resolved', resolutionInput, currentUser);
    setSelectedQueryId(null);
    setResolutionInput('');
  };

  const handleTeacherApplyLeave = (e) => {
    e.preventDefault();
    if (!teacherLeaveStart || !teacherLeaveEnd || !teacherLeaveReason) return;
    applyLeave({
      startDate: teacherLeaveStart,
      endDate: teacherLeaveEnd,
      leaveType: teacherLeaveType,
      reason: teacherLeaveReason
    }, currentUser);

    setTeacherLeaveStart('');
    setTeacherLeaveEnd('');
    setTeacherLeaveType('Sick Leave');
    setTeacherLeaveReason('');
    setLeaveSubTab('self');
  };

  const handleReviewStudentLeave = (leaveId, status) => {
    const remarks = reviewRemarks[leaveId] || '';
    updateLeaveStatus(leaveId, status, remarks, currentUser);
    setReviewRemarks(prev => ({ ...prev, [leaveId]: '' }));
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
            borderBottom: activeTab === 'appointments' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'appointments' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap'
          }}
          onClick={() => { setActiveTab('appointments'); setActiveSection && setActiveSection('appointments'); }}
        >
          My Consultation Schedules
        </button>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'queries' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'queries' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap'
          }}
          onClick={() => { setActiveTab('queries'); setActiveSection && setActiveSection('queries'); }}
        >
          Student Academic Queries ({pendingQueries.length})
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
          Leaves Desk ({studentLeavesForTeacher.filter(l => l.status === 'Pending').length})
        </button>
      </div>

      {/* A. CONSULTATIONS LIST TAB */}
      {activeTab === 'appointments' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Upcoming Student / Parent Consultations</h3>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Client Name</th>
                  <th>Role</th>
                  <th>Scheduled Date</th>
                  <th>Time Slot</th>
                  <th>Purpose / Topic</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teacherConsultations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No consultations scheduled this week.
                    </td>
                  </tr>
                ) : (
                  teacherConsultations.map(apt => (
                    <tr key={apt.id}>
                      <td style={{ fontWeight: '700' }}>{apt.id}</td>
                      <td>{apt.userName}</td>
                      <td>{apt.userRole}</td>
                      <td>{apt.date}</td>
                      <td style={{ fontWeight: '600', color: 'var(--primary-light)' }}>{apt.time}</td>
                      <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={apt.purpose}>
                        {apt.purpose}
                      </td>
                      <td>
                        <span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* B. QUERIES RESPONSE TAB */}
      {activeTab === 'queries' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Assigned Student Queries Queue</h3>
          
          {teacherQueries.length === 0 ? (
            <p style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              No query tickets have been routed to your advisory department.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {teacherQueries.map(q => {
                const isSelected = selectedQueryId === q.id;
                return (
                  <div 
                    key={q.id} 
                    style={{ 
                      padding: '16px', 
                      backgroundColor: isSelected ? 'var(--info-bg)' : 'var(--bg-tertiary)', 
                      borderRadius: '8px', 
                      border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-color)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{q.id} - {q.category}</span>
                      <span className={`status-badge ${q.status.toLowerCase().replace(' ', '-')}`}>{q.status}</span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>Subject: {q.subject}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Raised by: <strong>{q.raisedBy} ({q.role})</strong> on {new Date(q.date).toLocaleDateString()}
                    </p>
                    
                    <div style={{ borderLeft: '3.5px solid var(--border-color)', paddingLeft: '12px', marginBottom: '14px', fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      "{q.description}"
                    </div>

                    {q.status === 'Resolved' || q.status === 'Closed' ? (
                      <div style={{ backgroundColor: 'var(--success-bg)', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', color: 'var(--success)', fontWeight: '600' }}>
                        👉 Resolution Answer Provided:<br />
                        <span style={{ fontWeight: '400', fontStyle: 'normal' }}>"{q.resolution}"</span>
                      </div>
                    ) : (
                      <div>
                        {isSelected ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <textarea 
                              className="form-input" 
                              style={{ minHeight: '70px', fontSize: '13px' }}
                              placeholder="Write your explanation or advice for this student here..."
                              value={resolutionInput}
                              onChange={e => setResolutionInput(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setSelectedQueryId(null)}>Cancel</button>
                              <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => handleResolveQuery(q.id)}>Submit Resolution</button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => { setSelectedQueryId(q.id); setResolutionInput(''); }}
                          >
                            <FileCheck size={14} />
                            Respond & Resolve
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* C. LEAVES DESK TAB */}
      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub-tab Toolbar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', backgroundColor: 'var(--bg-tertiary)', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
            <button
              className="btn"
              style={{
                backgroundColor: leaveSubTab === 'wards' ? 'var(--primary-light)' : 'transparent',
                color: leaveSubTab === 'wards' ? 'white' : 'var(--text-secondary)',
                border: 'none', padding: '6px 14px', fontSize: '12.5px', borderRadius: '6px', fontWeight: '700'
              }}
              onClick={() => setLeaveSubTab('wards')}
            >
              Wards Leaves Inbox ({studentLeavesForTeacher.filter(l => l.status === 'Pending').length})
            </button>
            <button
              className="btn"
              style={{
                backgroundColor: leaveSubTab === 'self' ? 'var(--primary-light)' : 'transparent',
                color: leaveSubTab === 'self' ? 'white' : 'var(--text-secondary)',
                border: 'none', padding: '6px 14px', fontSize: '12.5px', borderRadius: '6px', fontWeight: '700'
              }}
              onClick={() => setLeaveSubTab('self')}
            >
              My Leave Requests
            </button>
          </div>

          {/* Sub-Tab 1: Wards Leaves Inbox */}
          {leaveSubTab === 'wards' && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Student Leave Approval Tickets</h3>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Leave ID</th>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th>Duration</th>
                      <th>Leave Type</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentLeavesForTeacher.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                          No student leaves routed to you.
                        </td>
                      </tr>
                    ) : (
                      studentLeavesForTeacher.map(lv => (
                        <tr key={lv.id}>
                          <td style={{ fontWeight: '700' }}>{lv.id}</td>
                          <td style={{ fontWeight: '600' }}>{lv.applicantName}</td>
                          <td>{lv.applicantClass}</td>
                          <td style={{ fontSize: '12px' }}>
                            <strong>{lv.startDate}</strong> to <strong>{lv.endDate}</strong>
                          </td>
                          <td>
                            <span className="status-badge info" style={{ fontSize: '10.5px' }}>{lv.leaveType}</span>
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px' }} title={lv.reason}>
                            "{lv.reason}"
                          </td>
                          <td>
                            <span className={`status-badge ${lv.status.toLowerCase()}`}>{lv.status}</span>
                          </td>
                          <td>
                            {lv.status === 'Pending' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input
                                  type="text"
                                  placeholder="Add approval remarks..."
                                  className="filter-input"
                                  style={{ padding: '4px 8px', fontSize: '11.5px', minWidth: '150px' }}
                                  value={reviewRemarks[lv.id] || ''}
                                  onChange={e => setReviewRemarks(prev => ({ ...prev, [lv.id]: e.target.value }))}
                                />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className="btn btn-primary"
                                    style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: 'var(--success)', borderColor: 'transparent', flex: 1 }}
                                    onClick={() => handleReviewStudentLeave(lv.id, 'Approved')}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--danger)', borderColor: 'var(--danger)', flex: 1 }}
                                    onClick={() => handleReviewStudentLeave(lv.id, 'Rejected')}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                                {lv.remarks ? `💬 Remarks: "${lv.remarks}"` : '—'}
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
          )}

          {/* Sub-Tab 2: My Leave Requests */}
          {leaveSubTab === 'self' && (
            <div className="responsive-grid-2">
              {/* Form to Apply for Self Leave */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Apply for Faculty Leave</h3>
                
                <div style={{ marginBottom: '18px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '12.5px', border: '1px solid var(--border-color)' }}>
                  👤 Assigned Authority: <strong>Ms. Clara Vance (Vice Principal)</strong>
                  <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    *Note: Teacher self leave requests are routed directly to the Vice Principal's desk for review.
                  </div>
                </div>

                <form onSubmit={handleTeacherApplyLeave}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={teacherLeaveStart}
                        onChange={e => setTeacherLeaveStart(e.target.value)}
                        min="2026-06-01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={teacherLeaveEnd}
                        onChange={e => setTeacherLeaveEnd(e.target.value)}
                        min={teacherLeaveStart || '2026-06-01'}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Leave Category / Type</label>
                      <select
                        className="filter-input"
                        value={teacherLeaveType}
                        onChange={e => setTeacherLeaveType(e.target.value)}
                      >
                        <option value="Casual Leave">Casual Leave (Personal affairs)</option>
                        <option value="Sick Leave">Sick Leave (Medical treatment)</option>
                        <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                        <option value="Academic Sabbatical">Academic Sabbatical</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>Reason for Leave</label>
                    <textarea
                      className="form-input"
                      style={{ minHeight: '100px' }}
                      placeholder="Detail the reason for your absence..."
                      value={teacherLeaveReason}
                      onChange={e => setTeacherLeaveReason(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Submit Leave Request to VP Desk
                  </button>
                </form>
              </div>

              {/* History Roster of Self Leaves */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>My Leave Application History</h3>

                {teacherOwnLeaves.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                    No personal leave requests submitted.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
                    {teacherOwnLeaves.map(lv => (
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
                          👤 Approver Assigned: <strong>{lv.assignedTo}</strong>
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
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
