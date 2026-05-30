import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { 
  Database, 
  Mail, 
  Calendar as CalendarIcon, 
  Search, 
  Download, 
  User, 
  Clock, 
  Tag, 
  FileText,
  AlertCircle
} from 'lucide-react';

const IntegrationTab = () => {
  const { 
    appointments, 
    queries, 
    complaints, 
    payments,
    students,
    staff,
    virtualEmails, 
    pushNotification 
  } = useDatabase();
  const { quickProfiles } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState('sheets'); // sheets, gmail, calendar

  // Google Sheets states
  const [activeSheet, setActiveSheet] = useState('appointments'); // appointments, queries, complaints, payments, students, staff
  const [sheetSearch, setSheetSearch] = useState('');

  // Gmail states
  const [selectedMailUser, setSelectedMailUser] = useState('Liam Chen'); // switcher
  const [activeEmailId, setActiveEmailId] = useState(null);
  const [emailSearch, setEmailSearch] = useState('');

  // 1. CSV EXPORTER UTILITY
  const exportToCSV = (sheetName, data) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Define headers
    let headers = [];
    if (sheetName === 'appointments') {
      headers = ["Booking ID", "User Name", "Role", "Appointment With", "Date", "Time", "Purpose", "Status", "Calendar Event ID", "Resolution Notes"];
    } else if (sheetName === 'queries') {
      headers = ["Query ID", "Raised By", "Category", "Subject", "Description", "Assigned To", "Date", "Status", "Resolution", "Closed Date"];
    } else if (sheetName === 'complaints') {
      headers = ["Complaint ID", "Submitted By", "Complaint Type", "Description", "Assigned Officer", "Date", "Status", "Action Taken", "Resolved Date"];
    } else if (sheetName === 'payments') {
      headers = ["Payment ID", "User Name", "Role", "Payment Type", "Amount", "Date", "Status", "Transaction ID"];
    } else if (sheetName === 'students') {
      headers = ["Student ID", "Name", "Email", "Class", "Fee Status", "Bus Route"];
    } else if (sheetName === 'staff') {
      headers = ["Staff ID", "Name", "Role", "Email", "Salary", "Department", "Date Joined"];
    }

    csvContent += headers.map(h => `"${h}"`).join(",") + "\n";

    // Add rows
    data.forEach(row => {
      let rowValues = [];
      if (sheetName === 'appointments') {
        rowValues = [row.id, row.userName, row.userRole, row.appointmentWith, row.date, row.time, row.purpose, row.status, row.calendarEventId, row.resolutionNotes];
      } else if (sheetName === 'queries') {
        rowValues = [row.id, row.raisedBy, row.category, row.subject, row.description, row.assignedTo, row.date, row.status, row.resolution, row.closedDate];
      } else if (sheetName === 'complaints') {
        rowValues = [row.id, row.submittedBy, row.complaintType, row.description, row.assignedOfficer, row.date, row.status, row.actionTaken, row.resolvedDate];
      } else if (sheetName === 'payments') {
        rowValues = [row.id, row.userName, row.role, row.paymentType, row.amount, row.date, row.status, row.transactionId];
      } else if (sheetName === 'students') {
        rowValues = [row.id, row.name, row.email, row.class, row.feeStatus, row.busRoute];
      } else if (sheetName === 'staff') {
        rowValues = [row.id, row.name, row.role, row.email, row.salary, row.department, row.dateJoined];
      }
      csvContent += rowValues.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `google_sheets_${sheetName}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    pushNotification(`Downloaded ${sheetName} spreadsheet as CSV successfully!`, 'success');
  };

  // Google Sheets Filter
  const getFilteredSheetData = () => {
    let data = [];
    if (activeSheet === 'appointments') data = appointments;
    else if (activeSheet === 'queries') data = queries;
    else if (activeSheet === 'complaints') data = complaints;
    else if (activeSheet === 'payments') data = payments;
    else if (activeSheet === 'students') data = students;
    else if (activeSheet === 'staff') data = staff;

    if (!sheetSearch) return data;

    const term = sheetSearch.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(val => 
        (val || '').toString().toLowerCase().includes(term)
      )
    );
  };

  // Gmail Filters
  const getFilteredEmails = () => {
    const profile = quickProfiles.find(p => p.name === selectedMailUser);
    const userEmail = profile ? profile.email : 'liam.chen@school.edu';

    let filtered = virtualEmails.filter(email => email.to === userEmail);

    if (emailSearch) {
      const term = emailSearch.toLowerCase();
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(term) || 
        email.body.toLowerCase().includes(term) ||
        email.sender.toLowerCase().includes(term)
      );
    }
    return filtered;
  };

  const userEmails = getFilteredEmails();
  const activeEmail = userEmails.find(e => e.id === activeEmailId) || userEmails[0];

  // Calendar mapping
  const daysInJune = 30;
  const juneEvents = appointments.filter(apt => apt.status === 'APPROVED' && apt.date.startsWith('2026-06'));

  return (
    <div>
      {/* Simulation Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(to right, var(--info-bg), transparent)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={22} style={{ color: 'var(--primary-light)' }} />
          Simulated Google Integrations Hub
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          This console simulates real-time background API syncing. As you book appointments, raise queries, or submit complaints, you will see new rows automatically append to Google Sheets, dynamic events populate on Google Calendar, and email notification logs dispatch to the Gmail Inboxes.
        </p>

        {/* Sync Controls Tab Switches */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', overflowX: 'auto' }}>
          <button 
            className={`btn ${activeSubTab === 'sheets' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('sheets')}
          >
            <Database size={16} />
            Virtual Google Sheets (6 Tables)
          </button>
          <button 
            className={`btn ${activeSubTab === 'gmail' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('gmail')}
          >
            <Mail size={16} />
            Virtual Gmail client
          </button>
          <button 
            className={`btn ${activeSubTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('calendar')}
          >
            <CalendarIcon size={16} />
            Virtual Google Calendar
          </button>
        </div>
      </div>

      {/* 1. GOOGLE SHEETS SIMULATOR VIEW */}
      {activeSubTab === 'sheets' && (
        <div className="sheets-container">
          <div className="sheets-tabs-bar" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
            {['appointments', 'queries', 'complaints', 'payments', 'students', 'staff'].map(sheet => (
              <button 
                key={sheet}
                className={`sheets-tab-btn ${activeSheet === sheet ? 'active' : ''}`}
                onClick={() => { setActiveSheet(sheet); setSheetSearch(''); }}
                style={{ textTransform: 'capitalize' }}
              >
                {sheet} Sheet
              </button>
            ))}
          </div>

          <div className="sheets-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '400px' }}>
              <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                className="filter-input"
                style={{ width: '100%', padding: '6px 12px' }}
                placeholder="Search spreadsheet cells..." 
                value={sheetSearch}
                onChange={e => setSheetSearch(e.target.value)}
              />
            </div>

            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#107c41', color: '#107c41' }}
              onClick={() => exportToCSV(activeSheet, getFilteredSheetData())}
            >
              <Download size={14} />
              Export to Excel / CSV
            </button>
          </div>

          <div className="sheets-table-viewport">
            <table className="sheets-table">
              <thead>
                {activeSheet === 'appointments' && (
                  <tr>
                    <th>Booking ID</th>
                    <th>User Name</th>
                    <th>Role</th>
                    <th>Appointment With</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Calendar Event ID</th>
                    <th>Resolution Notes</th>
                  </tr>
                )}
                {activeSheet === 'queries' && (
                  <tr>
                    <th>Query ID</th>
                    <th>Raised By</th>
                    <th>Category</th>
                    <th>Subject</th>
                    <th>Description</th>
                    <th>Assigned To</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Resolution Remarks</th>
                    <th>Closed Date</th>
                  </tr>
                )}
                {activeSheet === 'complaints' && (
                  <tr>
                    <th>Complaint ID</th>
                    <th>Submitted By</th>
                    <th>Complaint Type</th>
                    <th>Description</th>
                    <th>Assigned Officer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action Taken</th>
                    <th>Resolved Date</th>
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
                  </tr>
                )}
                {activeSheet === 'students' && (
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Assigned Class</th>
                    <th>Quarterly Fee Status</th>
                    <th>Bus Route</th>
                  </tr>
                )}
                {activeSheet === 'staff' && (
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email Address</th>
                    <th>Contract Salary ($/mo)</th>
                    <th>Advisory Department</th>
                    <th>Date Joined</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {getFilteredSheetData().length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                      No records found in this cloud spreadsheet tab.
                    </td>
                  </tr>
                ) : (
                  getFilteredSheetData().map((row, idx) => (
                    <tr key={row.id || idx}>
                      {activeSheet === 'appointments' && (
                        <>
                          <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{row.id}</td>
                          <td>{row.userName}</td>
                          <td>{row.userRole}</td>
                          <td>{row.appointmentWith}</td>
                          <td>{row.date}</td>
                          <td>{row.time}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.purpose}>{row.purpose}</td>
                          <td>
                            <span className={`status-badge ${row.status.toLowerCase()}`}>{row.status}</span>
                          </td>
                          <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{row.calendarEventId || '—'}</td>
                          <td>{row.resolutionNotes || '—'}</td>
                        </>
                      )}
                      {activeSheet === 'queries' && (
                        <>
                          <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{row.id}</td>
                          <td>{row.raisedBy}</td>
                          <td>{row.category}</td>
                          <td>{row.subject}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.description}>{row.description}</td>
                          <td>{row.assignedTo}</td>
                          <td>{new Date(row.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${row.status.toLowerCase().replace(' ', '-')}`}>{row.status}</span>
                          </td>
                          <td>{row.resolution || '—'}</td>
                          <td>{row.closedDate ? new Date(row.closedDate).toLocaleDateString() : '—'}</td>
                        </>
                      )}
                      {activeSheet === 'complaints' && (
                        <>
                          <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{row.id}</td>
                          <td>{row.submittedBy}</td>
                          <td>{row.complaintType}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.description}>{row.description}</td>
                          <td>{row.assignedOfficer}</td>
                          <td>{new Date(row.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${row.status.toLowerCase().replace(' ', '-')}`}>{row.status}</span>
                          </td>
                          <td>{row.actionTaken || '—'}</td>
                          <td>{row.resolvedDate ? new Date(row.resolvedDate).toLocaleDateString() : '—'}</td>
                        </>
                      )}
                      {activeSheet === 'payments' && (
                        <>
                          <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{row.id}</td>
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
                          <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{row.id}</td>
                          <td style={{ fontWeight: '600' }}>{row.name}</td>
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
                          <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{row.id}</td>
                          <td style={{ fontWeight: '600' }}>{row.name}</td>
                          <td>{row.role}</td>
                          <td>{row.email}</td>
                          <td style={{ fontWeight: '700' }}>${row.salary}</td>
                          <td>{row.department}</td>
                          <td>{row.dateJoined}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. GMAIL CLIENT INBOX SIMULATOR VIEW */}
      {activeSubTab === 'gmail' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {/* User selector panel */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-tertiary)' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Active Gmail Account:
            </span>
            <select 
              className="filter-input"
              style={{ padding: '4px 10px', fontSize: '13px' }}
              value={selectedMailUser}
              onChange={e => { setSelectedMailUser(e.target.value); setActiveEmailId(null); }}
            >
              {quickProfiles.map(p => (
                <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>

          <div className="gmail-container">
            {/* List pane */}
            <div className="gmail-sidebar">
              <div className="gmail-sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <input 
                    type="text" 
                    placeholder="Search mail..."
                    style={{ border: 'none', background: 'none', outline: 'none', fontSize: '12px', width: '100%' }}
                    value={emailSearch}
                    onChange={e => setEmailSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="gmail-list-pane">
                {userEmails.length === 0 ? (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <AlertCircle size={20} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <span style={{ fontSize: '12px' }}>Inbox Empty</span>
                  </div>
                ) : (
                  userEmails.map(mail => (
                    <div 
                      key={mail.id} 
                      className={`gmail-item ${mail.id === activeEmail?.id ? 'active' : ''} ${!mail.isRead ? 'unread' : ''}`}
                      onClick={() => { mail.isRead = true; setActiveEmailId(mail.id); }}
                    >
                      <div className="gmail-item-header">
                        <span className="gmail-item-sender">{mail.sender}</span>
                        <span className="gmail-item-date">
                          {new Date(mail.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="gmail-item-subject">{mail.subject}</h4>
                      <p className="gmail-item-snippet">{mail.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Details pane */}
            <div className="gmail-body-pane">
              {activeEmail ? (
                <>
                  <div className="gmail-body-header">
                    <h3 className="gmail-body-subject">{activeEmail.subject}</h3>
                    <div className="gmail-body-meta">
                      <span>From: <strong style={{ color: 'var(--text-primary)' }}>{activeEmail.sender}</strong></span>
                      <span>{new Date(activeEmail.date).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                      To: <strong>{activeEmail.to}</strong>
                    </div>
                  </div>

                  <div className="gmail-body-content" style={{ fontSize: '13px' }}>
                    {activeEmail.body}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', flexDirection: 'column', gap: '10px' }}>
                  <Mail size={48} />
                  <span>Select an email to view details</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. GOOGLE CALENDAR SIMULATOR VIEW */}
      {activeSubTab === 'calendar' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Google Calendar Overview</h3>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-light)' }}>
              June 2026
            </span>
          </div>

          <div className="calendar-grid">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="calendar-header-day">{day.slice(0, 3)}</div>
            ))}

            <div className="calendar-cell" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <span className="calendar-cell-num" style={{ opacity: 0.3 }}>31</span>
            </div>

            {Array.from({ length: daysInJune }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `2026-06-${dayNum.toString().padStart(2, '0')}`;
              const dayEvents = juneEvents.filter(evt => evt.date === dateStr);
              const isToday = dayNum === 2;

              return (
                <div key={dayNum} className={`calendar-cell ${isToday ? 'today' : ''}`}>
                  <span className="calendar-cell-num">{dayNum}</span>
                  {dayEvents.map(evt => (
                    <div 
                      key={evt.id} 
                      className="calendar-event-pill"
                      title={`${evt.time} - ${evt.userName} with ${evt.appointmentWith}`}
                      onClick={() => pushNotification(`Appointment Event: ${evt.userName} with ${evt.appointmentWith} at ${evt.time}`, 'info')}
                    >
                      {evt.time.split(' ')[0]} - {evt.userName.split(' ')[0]}
                    </div>
                  ))}
                </div>
              );
            })}

            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="calendar-cell" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <span className="calendar-cell-num" style={{ opacity: 0.3 }}>{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationTab;
