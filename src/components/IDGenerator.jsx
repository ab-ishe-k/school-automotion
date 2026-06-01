import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  User, 
  Printer, 
  RefreshCw, 
  ArrowRightLeft, 
  PlusCircle, 
  ShieldCheck, 
  Heart,
  Droplet,
  Calendar,
  AlertCircle
} from 'lucide-react';

const IDGenerator = () => {
  const { students, staff, pushNotification } = useDatabase();
  const { currentUser } = useAuth();

  // 1. STATE VARIABLES
  const [category, setCategory] = useState('student'); // student, staff, visitor
  const [theme, setTheme] = useState('glassmorphism'); // glassmorphism, cyberpunk, academic
  const [layout, setLayout] = useState('portrait'); // portrait, landscape
  const [isFlipped, setIsFlipped] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneContact, setPhoneContact] = useState('555-019-9800');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [issueDate, setIssueDate] = useState('2026-06-01');
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  
  // Custom Visitor Extra Fields
  const [visitPurpose, setVisitPurpose] = useState('Official Visitor');
  
  // List of active visitors loaded from local storage for receptionist auto-fill
  const [visitorLogs, setVisitorLogs] = useState([]);

  useEffect(() => {
    const rawLogs = localStorage.getItem('school_visitor_logs');
    if (rawLogs) {
      setVisitorLogs(JSON.parse(rawLogs));
    }
  }, []);

  // 2. AUTO-FILL HANDLERS
  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setFullName(student.name);
    setIdNumber(student.id);
    setDesignation(student.class);
    setEmailAddress(student.email);
    setPhoneContact('555-012-9988');
    setBloodGroup(student.id.includes('8') ? 'B+' : 'O+');
    setIssueDate('2026-06-01');
    setExpiryDate('2027-06-30');
    // Simulated placeholder avatars based on names
    if (student.name.includes('Liam')) {
      setAvatarUrl('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop');
    } else {
      setAvatarUrl('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop');
    }
    pushNotification(`Auto-filled Student details for ${student.name}`, 'success');
  };

  const handleStaffSelect = (staffId) => {
    const member = staff.find(s => s.id === staffId);
    if (!member) return;

    setFullName(member.name);
    setIdNumber(member.id);
    setDesignation(member.department);
    setEmailAddress(member.email);
    setPhoneContact('555-018-4431');
    setBloodGroup(member.id.includes('2') ? 'A+' : 'AB+');
    setIssueDate(member.dateJoined || '2026-06-01');
    setExpiryDate('2029-06-30');
    
    if (member.name.includes('Marcus')) {
      setAvatarUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop');
    } else if (member.name.includes('Adrian')) {
      setAvatarUrl('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop');
    } else {
      setAvatarUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop');
    }
    pushNotification(`Auto-filled Faculty details for ${member.name}`, 'success');
  };

  const handleVisitorSelect = (visitorId) => {
    const vis = visitorLogs.find(v => v.id === visitorId);
    if (!vis) return;

    setFullName(vis.name);
    setIdNumber(vis.id);
    setDesignation('CAMPUS VISITOR');
    setEmailAddress('security@beacon.edu');
    setPhoneContact(vis.contact || '555-010-0000');
    setBloodGroup('N/A');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setExpiryDate(new Date().toISOString().split('T')[0]);
    setVisitPurpose(vis.purpose);
    setAvatarUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop');
    pushNotification(`Auto-filled Visitor details for ${vis.name}`, 'success');
  };

  // Set default values when switching category
  useEffect(() => {
    if (category === 'student') {
      setFullName('Liam Chen');
      setIdNumber('STD-88201');
      setDesignation('Grade 11-A');
      setEmailAddress('liam.chen@school.edu');
      setPhoneContact('555-012-9988');
      setBloodGroup('O+');
      setAvatarUrl('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop');
    } else if (category === 'staff') {
      setFullName('Mr. Marcus Davis');
      setIdNumber('STF-20192');
      setDesignation('Math Dept');
      setEmailAddress('davis.math@school.edu');
      setPhoneContact('555-018-4431');
      setBloodGroup('A+');
      setAvatarUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop');
    } else {
      setFullName('Dr. Robert Carter');
      setIdNumber('VIS-901');
      setDesignation('GUEST PASSPORT');
      setEmailAddress('security@beacon.edu');
      setPhoneContact('555-019-2831');
      setBloodGroup('N/A');
      setVisitPurpose('Grant Collaboration Meeting');
      setAvatarUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop');
    }
  }, [category]);

  // 4. PHOTO CAPTURE & GALLERY UPLOAD HANDLERS
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Hook to bind camera stream to the video element once it is mounted in the DOM
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const startCamera = async () => {
    try {
      // Use ideal constraints for high hardware and browser compatibility
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          facingMode: 'user' 
        } 
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      console.warn("Retrying with simple camera constraints...", err);
      try {
        // Fallback constraint
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        setCameraActive(true);
      } catch (fallbackErr) {
        pushNotification('Could not access camera: ' + fallbackErr.message, 'danger');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  // Stop camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 150, 150);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setAvatarUrl(dataUrl);
      stopCamera();
      pushNotification('Photo captured successfully!', 'success');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        pushNotification('Image uploaded from gallery!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. PRINT HANDLER
  const handlePrint = () => {
    pushNotification('Opening native print console...', 'info');
    window.print();
  };

  return (
    <div className="dashboard-viewport">
      {/* Printable isolated frame */}
      <div id="printable-id-card-area" style={{ display: 'none' }}>
        <div className={`id-card-flipper ${layout} ${theme}`}>
          <div className={`id-card-front theme-${theme}`}>
            <div className="id-chip-holo"></div>
            <div className="id-header">
              <h4>{category === 'student' ? (designation || 'STUDENT').toUpperCase() : category === 'staff' ? (designation || 'FACULTY').toUpperCase() : (visitPurpose || 'VISITOR').toUpperCase()}</h4>
              <p>HIGH SCHOOL</p>
            </div>
            <div className="id-body">
              <div className="id-photo-frame">
                <img src={avatarUrl} alt={fullName} className="id-photo" />
              </div>
              <h2 className="id-name">{fullName}</h2>
              <div className="id-role-badge">{category === 'visitor' ? 'VISITOR' : category.toUpperCase()}</div>
              
              <div className="id-details-list">
                <div className="id-detail-row">
                  <span>ID Code:</span>
                  <span>{idNumber}</span>
                </div>
                <div className="id-detail-row">
                  <span>{category === 'student' ? 'Grade:' : category === 'staff' ? 'Dept:' : 'Purpose:'}</span>
                  <span>{category === 'visitor' ? visitPurpose.substring(0, 18) + (visitPurpose.length > 18 ? '...' : '') : designation}</span>
                </div>
                <div className="id-detail-row">
                  <span>Blood Gp:</span>
                  <span>{bloodGroup}</span>
                </div>
                <div className="id-detail-row">
                  <span>Valid Till:</span>
                  <span>{expiryDate}</span>
                </div>
              </div>
              
              <div className="id-barcode-container">
                <svg className="id-barcode-svg" viewBox="0 0 100 20" fill="currentColor">
                  <rect x="0" width="2" height="20" /><rect x="3" width="1" height="20" /><rect x="5" width="3" height="20" /><rect x="9" width="1" height="20" /><rect x="11" width="2" height="20" /><rect x="14" width="4" height="20" /><rect x="19" width="1" height="20" /><rect x="21" width="2" height="20" /><rect x="24" width="3" height="20" /><rect x="28" width="1" height="20" /><rect x="30" width="2" height="20" /><rect x="33" width="4" height="20" /><rect x="38" width="2" height="20" /><rect x="41" width="1" height="20" /><rect x="43" width="3" height="20" /><rect x="47" width="1" height="20" /><rect x="49" width="2" height="20" /><rect x="52" width="4" height="20" /><rect x="57" width="1" height="20" /><rect x="59" width="2" height="20" /><rect x="62" width="3" height="20" /><rect x="66" width="1" height="20" /><rect x="68" width="2" height="20" /><rect x="71" width="4" height="20" /><rect x="76" width="2" height="20" /><rect x="79" width="1" height="20" /><rect x="81" width="3" height="20" /><rect x="85" width="1" height="20" /><rect x="87" width="2" height="20" /><rect x="90" width="4" height="20" />
                </svg>
                <span className="id-barcode-num">{idNumber}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`id-card-flipper ${layout} ${theme}`}>
          <div className={`id-card-back theme-${theme}`}>
            <div className="id-back-content">
              <div className="id-back-section">
                <span className="id-back-title">General Terms of Use</span>
                <p className="id-terms-text">
                  This card is the property of High School and is non-transferable. It must be displayed prominently at all times on campus premises. Loss of this card must be reported immediately to the administrative desk.
                </p>
              </div>

              <div className="id-back-section">
                <span className="id-back-title">Emergency Details</span>
                <div className="id-detail-row">
                  <span>Emergency Tel:</span>
                  <span>{phoneContact}</span>
                </div>
                <div className="id-detail-row">
                  <span>Authorized By:</span>
                  <span>Principal Office</span>
                </div>
                <div className="id-detail-row">
                  <span>Address:</span>
                  <span>100 School Ave, New York</span>
                </div>
              </div>

              <div className="id-qr-sign-row">
                <div className="id-qr-box">
                  <svg width="56" height="56" viewBox="0 0 21 21" fill="currentColor" style={{ color: 'black' }}>
                    <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H2z" /><path d="M14 0h7v7h-7zm1 1v5h5V1zm1 1h3v3h-3z" /><path d="M0 14h7v7H0zm1 1v5h5v-5zm1 1h3v3H2z" /><path d="M9 0h1v2H9zm2 0h1v1h-1zm1 2h2v1h-2zm-3 2h2v1H9zm3 0h1v2h-1zm3 8h1v1h-1zm1 2h2v1h-2zm-4 4h3v1h-3zm5 1h1v1h-1zm0-3h1v1h-1zm-6-2h2v1H9zm1-2h1v1h-1zm2 1h1v2h-1zm-4 2h1v1H8zm2 2h1v1h-1zm1-3h1v1h-1z" />
                  </svg>
                </div>
                <div className="id-signature-box">
                  <svg width="90" height="30" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 25c10-2 20-15 25-15s-10 20-5 20c8 0 12-25 15-25s-8 23-3 23c6 0 14-18 18-18s-5 18-1 18c5 0 12-10 16-12" />
                  </svg>
                  <span style={{ fontSize: '9px', opacity: 0.6 }}>Principal Sign</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form & Preview Dashboard Panel */}
      <div className="responsive-grid-12-1" style={{ alignItems: 'start' }}>
        
        {/* Left Side: Control Forms Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard style={{ color: 'var(--primary-light)' }} />
            Dynamic ID Card Generator Desk
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Select an active roster profile from the virtual spreadsheet database or key in details manually to generate double-sided smart print ID cards instantly.
          </p>

          {/* Configuration Categories */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '700', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Select ID Card Category</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['student', 'staff', 'visitor'].map(cat => (
                <button
                  key={cat}
                  className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, textTransform: 'capitalize', fontSize: '12px', padding: '8px' }}
                  onClick={() => setCategory(cat)}
                >
                  {cat === 'student' ? 'Student Card' : cat === 'staff' ? 'Staff Card' : 'Visitor Pass'}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Fill selection box */}
          <div className="form-group" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <label style={{ fontWeight: '700', fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--success)' }}>
              ⚡ Auto-Fill from Database Roster
            </label>
            {category === 'student' ? (
              <select className="filter-input" style={{ width: '100%' }} onChange={(e) => handleStudentSelect(e.target.value)} defaultValue="">
                <option value="" disabled>Select Student from Spreadsheet...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.class}) - {s.id}</option>
                ))}
              </select>
            ) : category === 'staff' ? (
              <select className="filter-input" style={{ width: '100%' }} onChange={(e) => handleStaffSelect(e.target.value)} defaultValue="">
                <option value="" disabled>Select Staff from Spreadsheet...</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role}) - {s.id}</option>
                ))}
              </select>
            ) : (
              <select className="filter-input" style={{ width: '100%' }} onChange={(e) => handleVisitorSelect(e.target.value)} defaultValue="">
                <option value="" disabled>
                  {visitorLogs.length === 0 ? 'No walk-in visitors logged today' : 'Select Visitor from Walk-in Desk...'}
                </option>
                {visitorLogs.map(v => (
                  <option key={v.id} value={v.id}>{v.name} - {v.id}</option>
                ))}
              </select>
            )}
          </div>

          {/* Form Fields Inputs */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label>Cardholder Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Unique ID Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  required
                />
              </div>

              {category !== 'visitor' ? (
                <div className="form-group">
                  <label>{category === 'student' ? 'Class / Grade' : 'Advisory Dept'}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Purpose of Visit</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={visitPurpose}
                    onChange={e => setVisitPurpose(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Blood Group</label>
                <select className="filter-input" style={{ width: '100%' }} value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="N/A">N/A (Visitor)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cardholder Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={emailAddress}
                  onChange={e => setEmailAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Emergency Telephone</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={phoneContact}
                  onChange={e => setPhoneContact(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date Issued</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Expiration Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <label style={{ fontWeight: '700', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                Cardholder Photo / Avatar
              </label>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {/* Custom File Upload Input */}
                <label className="btn btn-secondary" style={{ flex: 1, cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  📁 Open Gallery
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                  />
                </label>

                {/* Camera Capture Activation */}
                <button 
                  type="button" 
                  className={`btn ${cameraActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={cameraActive ? stopCamera : startCamera}
                >
                  📸 {cameraActive ? 'Close Camera' : 'Open Camera'}
                </button>
              </div>

              {/* Camera Live Feed Area */}
              {cameraActive && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    style={{ width: '100%', maxWidth: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#000', transform: 'scaleX(-1)' }} 
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ padding: '6px 16px', fontSize: '12px' }}
                    onClick={capturePhoto}
                  >
                    Snap Photo
                  </button>
                  <canvas ref={canvasRef} width="150" height="150" style={{ display: 'none' }} />
                </div>
              )}

              {/* Resource URL fallback */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Or input raw image URL directly:</span>
                <input 
                  type="text" 
                  className="form-input" 
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>
            </div>

            {/* Visual Styling settings */}
            <div className="responsive-grid-12-1" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '11px' }}>ID Card Styling Theme</label>
                <select className="filter-input" value={theme} onChange={e => setTheme(e.target.value)} style={{ width: '100%' }}>
                  <option value="glassmorphism">Glassmorphism VIP (Frosted Neon)</option>
                  <option value="cyberpunk">Cyberpunk Neon (Contrast Pink)</option>
                  <option value="academic">Academic Royal Gold (Classic Navy)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '11px' }}>Card Layout</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    className={`btn ${layout === 'portrait' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px', fontSize: '11px' }}
                    onClick={() => setLayout('portrait')}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    className={`btn ${layout === 'landscape' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '8px', fontSize: '11px' }}
                    onClick={() => setLayout('landscape')}
                  >
                    Landscape
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: 3D ID Card Previewer & Print Suite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card Preview Area */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🖥️ Interactive 3D Card Preview
              </span>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <ArrowRightLeft size={12} />
                Flip Card Preview
              </button>
            </div>

            {/* 3D stage */}
            <div className="id-card-stage" style={{ width: '100%' }}>
              <div className={`id-card-flipper ${layout} ${isFlipped ? 'flipped' : ''}`}>
                
                {/* ID Front Side */}
                <div className={`id-card-front theme-${theme}`}>
                  <div className="id-chip-holo"></div>
                  <div className="id-header">
                    <h4>{category === 'student' ? (designation || 'STUDENT').toUpperCase() : category === 'staff' ? (designation || 'FACULTY').toUpperCase() : (visitPurpose || 'VISITOR').toUpperCase()}</h4>
                    <p>HIGH SCHOOL</p>
                  </div>
                  
                  {layout === 'portrait' ? (
                    /* Portrait Front Layout */
                    <div className="id-body">
                      <div className="id-photo-frame">
                        <img src={avatarUrl} alt={fullName} className="id-photo" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'; }} />
                      </div>
                      <h2 className="id-name">{fullName}</h2>
                      <div className="id-role-badge">
                        {category === 'visitor' ? 'VISITOR' : category.toUpperCase()}
                      </div>
                      
                      <div className="id-details-list">
                        <div className="id-detail-row">
                          <span>Cardholder ID:</span>
                          <span>{idNumber}</span>
                        </div>
                        <div className="id-detail-row">
                          <span>{category === 'student' ? 'Grade Class:' : category === 'staff' ? 'Advisory Dept:' : 'Visit Purpose:'}</span>
                          <span>{category === 'visitor' ? visitPurpose.substring(0, 18) + (visitPurpose.length > 18 ? '...' : '') : designation}</span>
                        </div>
                        <div className="id-detail-row">
                          <span>Blood Group:</span>
                          <span>{bloodGroup}</span>
                        </div>
                        <div className="id-detail-row">
                          <span>Date Issued:</span>
                          <span>{issueDate}</span>
                        </div>
                        <div className="id-detail-row">
                          <span>Expiration:</span>
                          <span>{expiryDate}</span>
                        </div>
                      </div>

                      <div className="id-barcode-container">
                        <svg className="id-barcode-svg" viewBox="0 0 100 20" fill="currentColor">
                          <rect x="0" width="2" height="20" /><rect x="3" width="1" height="20" /><rect x="5" width="3" height="20" /><rect x="9" width="1" height="20" /><rect x="11" width="2" height="20" /><rect x="14" width="4" height="20" /><rect x="19" width="1" height="20" /><rect x="21" width="2" height="20" /><rect x="24" width="3" height="20" /><rect x="28" width="1" height="20" /><rect x="30" width="2" height="20" /><rect x="33" width="4" height="20" /><rect x="38" width="2" height="20" /><rect x="41" width="1" height="20" /><rect x="43" width="3" height="20" /><rect x="47" width="1" height="20" /><rect x="49" width="2" height="20" /><rect x="52" width="4" height="20" /><rect x="57" width="1" height="20" /><rect x="59" width="2" height="20" /><rect x="62" width="3" height="20" /><rect x="66" width="1" height="20" /><rect x="68" width="2" height="20" /><rect x="71" width="4" height="20" /><rect x="76" width="2" height="20" /><rect x="79" width="1" height="20" /><rect x="81" width="3" height="20" /><rect x="85" width="1" height="20" /><rect x="87" width="2" height="20" /><rect x="90" width="4" height="20" />
                        </svg>
                        <span className="id-barcode-num">{idNumber}</span>
                      </div>
                    </div>
                  ) : (
                    /* Landscape Front Layout */
                    <div className="id-body" style={{ display: 'flex', flexDirection: 'row', gap: '16px', justifyContent: 'space-between', width: '100%', height: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="id-photo-frame" style={{ width: '85px', height: '85px', marginBottom: '8px' }}>
                          <img src={avatarUrl} alt={fullName} className="id-photo" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'; }} />
                        </div>
                        <div className="id-role-badge" style={{ marginBottom: 0 }}>
                          {category === 'visitor' ? 'VISITOR' : category.toUpperCase()}
                        </div>
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '4px 0' }}>
                        <div>
                          <h2 className="id-name" style={{ textAlign: 'left', fontSize: '15px', marginBottom: '2px' }}>{fullName}</h2>
                          <p style={{ fontSize: '10px', opacity: 0.7, margin: 0 }}>
                            {category === 'student' ? 'Grade Class:' : category === 'staff' ? 'Advisory Dept:' : 'Visit Purpose:'} <strong>{category === 'visitor' ? visitPurpose.substring(0, 18) : designation}</strong>
                          </p>
                        </div>

                        <div className="id-details-list" style={{ borderTop: 'none', paddingTop: 0, gap: '3px' }}>
                          <div className="id-detail-row">
                            <span>Cardholder ID:</span>
                            <span>{idNumber}</span>
                          </div>
                          <div className="id-detail-row">
                            <span>Blood Group:</span>
                            <span>{bloodGroup}</span>
                          </div>
                          <div className="id-detail-row">
                            <span>Expiry:</span>
                            <span>{expiryDate}</span>
                          </div>
                        </div>

                        <div className="id-barcode-container" style={{ margin: 0, alignItems: 'flex-start' }}>
                          <svg className="id-barcode-svg" viewBox="0 0 100 20" fill="currentColor" style={{ width: '60%' }}>
                            <rect x="0" width="2" height="20" /><rect x="3" width="1" height="20" /><rect x="5" width="3" height="20" /><rect x="9" width="1" height="20" /><rect x="11" width="2" height="20" /><rect x="14" width="4" height="20" /><rect x="19" width="1" height="20" /><rect x="21" width="2" height="20" /><rect x="24" width="3" height="20" /><rect x="28" width="1" height="20" /><rect x="30" width="2" height="20" /><rect x="33" width="4" height="20" /><rect x="38" width="2" height="20" /><rect x="41" width="1" height="20" /><rect x="43" width="3" height="20" /><rect x="47" width="1" height="20" /><rect x="49" width="2" height="20" /><rect x="52" width="4" height="20" /><rect x="57" width="1" height="20" /><rect x="59" width="2" height="20" /><rect x="62" width="3" height="20" /><rect x="66" width="1" height="20" /><rect x="68" width="2" height="20" /><rect x="71" width="4" height="20" /><rect x="76" width="2" height="20" /><rect x="79" width="1" height="20" /><rect x="81" width="3" height="20" /><rect x="85" width="1" height="20" /><rect x="87" width="2" height="20" /><rect x="90" width="4" height="20" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ID Back Side */}
                <div className={`id-card-back theme-${theme}`}>
                  {layout === 'portrait' ? (
                    /* Portrait Back Layout */
                    <div className="id-back-content">
                      <div className="id-back-section">
                        <span className="id-back-title">General Terms of Use</span>
                        <p className="id-terms-text">
                          This card is the property of High School and is non-transferable. It must be displayed prominently at all times on campus premises. Loss of this card must be reported immediately to the administrative desk.
                        </p>
                      </div>

                      <div className="id-back-section">
                        <span className="id-back-title">Emergency Details</span>
                        <div className="id-detail-row">
                          <span>Emergency Tel:</span>
                          <span>{phoneContact}</span>
                        </div>
                        <div className="id-detail-row">
                          <span>Authorized By:</span>
                          <span>Principal Office</span>
                        </div>
                        <div className="id-detail-row">
                          <span>Address:</span>
                          <span>100 School Ave, New York</span>
                        </div>
                      </div>

                      <div className="id-qr-sign-row">
                        <div className="id-qr-box">
                          <svg width="56" height="56" viewBox="0 0 21 21" fill="currentColor" style={{ color: 'black' }}>
                            <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H2z" /><path d="M14 0h7v7h-7zm1 1v5h5V1zm1 1h3v3h-3z" /><path d="M0 14h7v7H0zm1 1v5h5v-5zm1 1h3v3H2z" /><path d="M9 0h1v2H9zm2 0h1v1h-1zm1 2h2v1h-2zm-3 2h2v1H9zm3 0h1v2h-1zm3 8h1v1h-1zm1 2h2v1h-2zm-4 4h3v1h-3zm5 1h1v1h-1zm0-3h1v1h-1zm-6-2h2v1H9zm1-2h1v1h-1zm2 1h1v2h-1zm-4 2h1v1H8zm2 2h1v1h-1zm1-3h1v1h-1z" />
                          </svg>
                        </div>
                        <div className="id-signature-box">
                          <svg width="90" height="30" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme === 'glassmorphism' ? 'white' : 'currentColor' }}>
                            <path d="M10 25c10-2 20-15 25-15s-10 20-5 20c8 0 12-25 15-25s-8 23-3 23c6 0 14-18 18-18s-5 18-1 18c5 0 12-10 16-12" />
                          </svg>
                          <span style={{ fontSize: '9px', opacity: 0.6 }}>Principal Sign</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Landscape Back Layout */
                    <div className="id-back-content">
                      <div className="id-back-left">
                        <div className="id-back-section">
                          <span className="id-back-title" style={{ fontSize: '9px' }}>General Terms of Use</span>
                          <p className="id-terms-text" style={{ fontSize: '7.5px' }}>
                            This card is the property of High School and is non-transferable. Display prominently on campus.
                          </p>
                        </div>

                        <div className="id-back-section" style={{ gap: '2px' }}>
                          <span className="id-back-title" style={{ fontSize: '9px' }}>Emergency Details</span>
                          <div className="id-detail-row" style={{ fontSize: '9px' }}>
                            <span>Tel:</span>
                            <span>{phoneContact}</span>
                          </div>
                          <div className="id-detail-row" style={{ fontSize: '9px' }}>
                            <span>HQ:</span>
                            <span>Principal Office</span>
                          </div>
                        </div>
                      </div>

                      <div className="id-back-right">
                        <div className="id-qr-sign-row">
                          <div className="id-qr-box" style={{ width: '48px', height: '48px', padding: '3px' }}>
                            <svg width="40" height="40" viewBox="0 0 21 21" fill="currentColor" style={{ color: 'black' }}>
                              <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H2z" /><path d="M14 0h7v7h-7zm1 1v5h5V1zm1 1h3v3h-3z" /><path d="M0 14h7v7H0zm1 1v5h5v-5zm1 1h3v3H2z" /><path d="M9 0h1v2H9zm2 0h1v1h-1zm1 2h2v1h-2zm-3 2h2v1H9zm3 0h1v2h-1zm3 8h1v1h-1zm1 2h2v1h-2zm-4 4h3v1h-3zm5 1h1v1h-1zm0-3h1v1h-1zm-6-2h2v1H9zm1-2h1v1h-1zm2 1h1v2h-1zm-4 2h1v1H8zm2 2h1v1h-1zm1-3h1v1h-1z" />
                            </svg>
                          </div>
                          <div className="id-signature-box">
                            <svg width="80" height="24" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme === 'glassmorphism' ? 'white' : 'currentColor' }}>
                              <path d="M10 25c10-2 20-15 25-15s-10 20-5 20c8 0 12-25 15-25s-8 23-3 23c6 0 14-18 18-18s-5 18-1 18c5 0 12-10 16-12" />
                            </svg>
                            <span style={{ fontSize: '8px', opacity: 0.6 }}>Principal Sign</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <p style={{ fontStyle: 'italic', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px', textAlign: 'center' }}>
              💡 Hover/Click over the card to review emergency terms on the back.
            </p>
          </div>

          {/* Action trigger Suite */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Smart Printing Console</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Send this ID card to the local administrative printer. The print stylesheet isolates only the card, stripping away all system menus.
            </p>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handlePrint}
            >
              <Printer size={16} />
              Print Smart ID Card / PDF
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px', backgroundColor: 'var(--info-bg)', borderRadius: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--info)', flexShrink: 0 }} />
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                CRITICAL SECURITY NOTE: Generates official encryption barcodes automatically.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IDGenerator;
