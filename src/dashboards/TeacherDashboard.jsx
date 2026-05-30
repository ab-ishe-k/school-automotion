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
  const { appointments, queries, updateQueryStatus, pushNotification } = useDatabase();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, queries

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

  // Compute stats
  const stats = {
    totalAppointments: teacherConsultations.length,
    pendingAppointments: teacherConsultations.filter(a => a.status === 'PENDING').length,
    totalQueries: teacherQueries.length,
    resolvedQueries: teacherQueries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length,
    totalComplaints: 0,
    escalatedComplaints: 0
  };

  const handleResolveQuery = (id) => {
    if (!resolutionInput) return;
    updateQueryStatus(id, 'Resolved', resolutionInput, currentUser);
    setSelectedQueryId(null);
    setResolutionInput('');
  };

  return (
    <div className="dashboard-viewport">
      <DashboardCards stats={stats} />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px' }}>
        <button 
          className="btn"
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'appointments' ? '2.5px solid var(--primary-light)' : 'none',
            color: activeTab === 'appointments' ? 'var(--primary-light)' : 'var(--text-secondary)',
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
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
            borderRadius: '0', padding: '10px 16px', fontWeight: '700', fontSize: '14px'
          }}
          onClick={() => { setActiveTab('queries'); setActiveSection && setActiveSection('queries'); }}
        >
          Student Academic Queries ({pendingQueries.length})
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
    </div>
  );
};

export default TeacherDashboard;
