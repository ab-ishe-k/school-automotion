import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Users, 
  CheckCircle, 
  HelpCircle, 
  Mail, 
  MapPin, 
  Phone,
  Sparkles,
  Play,
  Star,
  ChevronDown,
  Lock,
  Calendar,
  CreditCard,
  ClipboardList,
  Check,
  TrendingUp,
  Menu,
  X,
  Landmark,
  ShieldAlert,
  Award,
  FileSpreadsheet,
  Eye
} from 'lucide-react';

const plans = [
  {
    name: "Starter Tier",
    desc: "Perfect for single school branches trying to digitize basic registers and notice boards.",
    price: "$99",
    period: "/ month",
    popular: false,
    features: [
      "Access up to 500 student records",
      "Interactive role dashboards",
      "Notice board broadcasts",
      "Daily attendance registers",
      "Basic email notifications"
    ]
  },
  {
    name: "Standard Tier",
    desc: "Best for growing educational institutes requiring complete fees collection and homework portals.",
    price: "$249",
    period: "/ month",
    popular: true,
    features: [
      "Access up to 2,000 student records",
      "Fees & billing invoice grids",
      "Academics & homework submission desks",
      "Google Sheets real-time synclogs",
      "Biometric attendance integration"
    ]
  },
  {
    name: "Premium Tier",
    desc: "Complete operational suite for university systems or school networks with advanced logs.",
    price: "$499",
    period: "/ month",
    popular: false,
    features: [
      "Unlimited student & staff records",
      "Unified payroll & expense desks",
      "Multi-campus sync channels",
      "Complete operator audit trails",
      "Custom integration API desk"
    ]
  }
];

const testimonials = [
  {
    rating: 5,
    quote: "Digitizing our tuition invoices and staff logs using HighSchool ERP reduced our administrative load by over 40% in just one semester.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    author: "Ms. Clara Thorne",
    role: "Vice Principal, Vance Academy"
  },
  {
    rating: 5,
    quote: "Our parents love the digital invoice billing and teacher appointment scheduler. The real-time Google Sheets sync keeps our records perfect.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    author: "Mr. Marcus Davis",
    role: "Academic Coordinator"
  }
];

const faqs = [
  {
    q: "How does the real-time Google Sheets sync work?",
    a: "Every transaction, registration, or audit event broadcasts a JSON payload to a configured Google Apps Script Webhook, instantly appending rows dynamically in your sheets."
  },
  {
    q: "Is there a limit on student records we can upload?",
    a: "Our Starter plans support up to 500 records. Enterprise plans remove all restrictions, allowing unlimited student, staff, and transaction data."
  },
  {
    q: "Does the system support local database deployments?",
    a: "Yes. You can host the REST API Node/Express engine and MongoDB database on your local servers, or deploy them directly to cloud instances like Render or Railway."
  }
];

const LandingPage = ({ onEnterPortal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('analytics');
  const [activeRoleTab, setActiveRoleTab] = useState('principal');
  const [faqOpen, setFaqOpen] = useState({});
  const [currency, setCurrency] = useState('USD');

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Custom IntersectionObserver for Framer Motion-like scroll reveals
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-up');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 3000);
  };

  // 9 Modules Config
  const features = [
    {
      title: "Student Management",
      desc: "Maintain detailed directories, emergency contacts, parent linkage, and custom academic profile histories in one place.",
      icon: <Users size={22} className="text-blue-400" />
    },
    {
      title: "Attendance Tracking",
      desc: "Take daily roll calls via interactive grids. Generate visual percentage summary reports and automated absence email warnings.",
      icon: <CheckCircle size={22} className="text-emerald-400" />
    },
    {
      title: "Fee Collection",
      desc: "Manage custom tuition invoices, schedule bus fee installments, track transactions, and export print-ready PDF bills.",
      icon: <CreditCard size={22} className="text-cyan-400" />
    },
    {
      title: "Payroll Management",
      desc: "Track staff attendance logs, compile monthly work profiles, run salary pay slips, and calculate total school expenses.",
      icon: <Landmark size={22} className="text-indigo-400" />
    },
    {
      title: "Staff Audit Logs",
      desc: "Supervise all critical administrative events, data modifications, and configuration updates with full operator audit transparency.",
      icon: <ShieldAlert size={22} className="text-rose-400" />
    },
    {
      title: "Visitor Management",
      desc: "Register walk-in registries, capture caller query purposes, and maintain visitor safety records at the reception desk.",
      icon: <Eye size={22} className="text-amber-400" />
    },
    {
      title: "Smart ID Cards",
      desc: "Generate professional student and staff security badges with dynamic barcodes and QR codes exported as high-res vector PDFs.",
      icon: <Award size={22} className="text-violet-400" />
    },
    {
      title: "Academic Scheduling",
      desc: "Designate subjects to classrooms, assign class teachers, and draft midterm/final examination schedules efficiently.",
      icon: <Calendar size={22} className="text-teal-400" />
    },
    {
      title: "Reports & Analytics",
      desc: "Unlock unified metrics on current collections, attendance averages, grade transcripts, and pending complaints ratios.",
      icon: <FileSpreadsheet size={22} className="text-sky-400" />
    }
  ];

  // 5 Roles Config
  const roles = {
    principal: {
      name: "Principal (Super Admin)",
      tagline: "Executive Overlord Portal",
      benefit: "Full administrative transparency and fiscal analytics.",
      permissions: ["Access total audit trail", "Configure database sync rules", "Review global financial summaries", "Oversee staff profiles"],
      color: "#3b82f6",
      metric: { label: "Campus Collection Today", val: "$45,280", trend: "+14% vs target" }
    },
    teacher: {
      name: "Class Teacher",
      tagline: "Classroom Management Panel",
      benefit: "Saves up to 10 hours a week on basic administrative grids.",
      permissions: ["Record student attendance", "Upload homework files", "Input final exam scores", "File leave applications"],
      color: "#10b981",
      metric: { label: "Homework Uploads Completed", val: "28 / 32", trend: "Grade 11-A" }
    },
    accountant: {
      name: "Finance Accountant",
      tagline: "Fiscal Desk & Invoicing",
      benefit: "Eliminates double-billing and speeds up fee collection.",
      permissions: ["Generate custom fee structures", "Reconcile payment transactions", "Export billing summaries", "Send automatic due notices"],
      color: "#06b6d4",
      metric: { label: "Pending Installments", val: "$2,650", trend: "Due in 6 days" }
    },
    student: {
      name: "Student Portal",
      tagline: "Learning & Progress Dashboard",
      benefit: "All course materials, timetables, and report cards in one spot.",
      permissions: ["Submit homework responses", "Check daily class schedule", "Review transcript averages", "Submit academic queries"],
      color: "#8b5cf6",
      metric: { label: "Mean Attendance Grade", val: "96.4%", trend: "Calculus Track" }
    },
    parent: {
      name: "Parent Portal",
      tagline: "Parental Oversight Console",
      benefit: "Keeps parents directly aligned with their child's updates.",
      permissions: ["Track student check-in/out stats", "Pay bills via virtual invoice link", "Book teacher appointments", "Submit transport queries"],
      color: "#f59e0b",
      metric: { label: "Linked Student", val: "Liam Chen", trend: "Grade 11-A" }
    }
  };

  // Mock Showcase Data
  const showcaseTabs = {
    analytics: {
      title: "Real-Time Campus Analytics",
      desc: "Monitor financial cash flows, attendance trends, and departmental budgets in a unified dashboard.",
      badge: "Financial Core",
      data: (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-850">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Monthly Billing</span>
              <span className="text-lg font-extrabold text-white">$45,280</span>
              <span className="text-[8px] text-emerald-400 font-semibold block mt-0.5">↑ 12% vs last semester</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-850">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Attendance Avg</span>
              <span className="text-lg font-extrabold text-white">96.8%</span>
              <span className="text-[8px] text-emerald-400 font-semibold block mt-0.5">High campus check-in</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-850">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Audit Score</span>
              <span className="text-lg font-extrabold text-white">99.9%</span>
              <span className="text-[8px] text-indigo-400 font-semibold block mt-0.5">Zero discrepancies</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850/80">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Collections vs Forecast</span>
              <span className="text-[8px] text-slate-500">Academic Season 2026</span>
            </div>
            <div className="h-32 flex items-end gap-3 pt-4 border-b border-slate-850">
              <div className="w-full bg-slate-900 rounded-t h-[50%] relative flex justify-center"><div className="w-1/2 bg-indigo-500/80 rounded-t absolute bottom-0 h-[70%]" /></div>
              <div className="w-full bg-slate-900 rounded-t h-[75%] relative flex justify-center"><div className="w-1/2 bg-indigo-500/80 rounded-t absolute bottom-0 h-[85%]" /></div>
              <div className="w-full bg-slate-900 rounded-t h-[95%] relative flex justify-center"><div className="w-1/2 bg-cyan-400/90 rounded-t absolute bottom-0 h-[100%]" /></div>
              <div className="w-full bg-slate-900 rounded-t h-[65%] relative flex justify-center"><div className="w-1/2 bg-indigo-500/80 rounded-t absolute bottom-0 h-[60%]" /></div>
            </div>
            <div className="flex justify-between text-[8px] text-slate-500 mt-2 px-1 font-bold">
              <span>GRADE 8</span>
              <span>GRADE 9</span>
              <span>GRADE 10</span>
              <span>GRADE 11</span>
            </div>
          </div>
        </div>
      )
    },
    students: {
      title: "Interactive Student Registry",
      desc: "Instantly lookup student files, fee records, attendance percentages, and linked parent contact details.",
      badge: "Registrar Core",
      data: (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-550/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">LC</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Liam Chen</h5>
                <span className="text-[9px] text-slate-500">ID: STD-88201 • Grade 11-A</span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Active</span>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-550/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">ED</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Emily Davis</h5>
                <span className="text-[9px] text-slate-500">ID: STD-10928 • Grade 10-B</span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Active</span>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-550/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xs font-bold">BA</div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Baby Aarav</h5>
                <span className="text-[9px] text-slate-500">ID: STD-10101 • Nursery</span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Active</span>
          </div>
        </div>
      )
    },
    sheetSync: {
      title: "Real-Time Google Sheets Sync",
      desc: "Eliminate manual data entries. Any change in the ERP automatically broadcasts to Google Sheets via customized Webhooks.",
      badge: "Google Cloud Sync",
      data: (
        <div className="flex flex-col gap-3 font-mono text-[10px]">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-emerald-400 overflow-x-auto leading-relaxed">
            <span className="text-slate-500">// Google Apps Script API Call</span><br />
            <span className="text-white">function</span> <span className="text-cyan-400">doGet</span>(e) &#123;<br />
            &nbsp;&nbsp;<span className="text-white">var</span> sheet = SpreadsheetApp.getActiveSpreadsheet();<br />
            &nbsp;&nbsp;sheet.getSheetByName(<span className="text-indigo-300">"students"</span>).appendRow([<br />
            &nbsp;&nbsp;&nbsp;&nbsp;e.parameter.id, e.parameter.name, e.parameter.status<br />
            &nbsp;&nbsp;]);<br />
            &nbsp;&nbsp;<span className="text-white">return</span> ContentService.createTextOutput(<span className="text-indigo-300">"SUCCESS"</span>);<br />
            &#125;
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 flex items-center gap-2">
            <CheckCircle size={14} />
            <span>Sync active. 14 database collections currently linked to spreadsheets.</span>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="saas-landing-container min-h-screen overflow-x-hidden relative">
      
      {/* 🚀 Glassmorphism Sticky Navbar */}
      <nav className="saas-navbar px-6 py-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-650 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/20">
              <BookOpen className="text-white" size={20} />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              HighSchool ERP
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="saas-nav-link">Features</a>
            <a href="#showcase" className="saas-nav-link">Workspace Demo</a>
            <a href="#roles" className="saas-nav-link">Roles</a>
            <a href="#pricing" className="saas-nav-link">Pricing</a>
            <a href="#faq" className="saas-nav-link">Support FAQ</a>
          </div>

          {/* Action Button & Hamburger */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onEnterPortal}
              className="saas-btn-primary"
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '12px' }}
            >
              Access Portal
              <ArrowRight size={13} />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[100%] left-0 right-0 bg-[#0b1220]/95 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex flex-col gap-4 z-50">
            <a href="#features" className="saas-nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#showcase" className="saas-nav-link" onClick={() => setMobileMenuOpen(false)}>Workspace Demo</a>
            <a href="#roles" className="saas-nav-link" onClick={() => setMobileMenuOpen(false)}>Roles</a>
            <a href="#pricing" className="saas-nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="saas-nav-link" onClick={() => setMobileMenuOpen(false)}>Support FAQ</a>
          </div>
        )}
      </nav>

      {/* 🔮 Full-Screen Modern Hero Section */}
      <section className="relative pt-32 pb-24 px-6 z-10 overflow-hidden">
        {/* Glow Blobs */}
        <div className="hero-glow-blob top-12 left-1/2 -translate-x-1/2" />
        <div className="hero-glow-blob bottom-0 right-10" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-950 border border-slate-850 text-blue-400 text-xs font-bold tracking-wide mb-8 shadow-sm reveal-up">
            <Sparkles size={12} className="animate-pulse text-cyan-400" />
            <span>The Enterprise ERP Platform for Modern Schools & Colleges</span>
          </div>

          <h1 className="hero-headline mb-8 reveal-up">
            Automate Operations.<br />
            Empower Classrooms.
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-450 max-w-3xl mx-auto mb-16 leading-relaxed font-medium reveal-up" style={{ color: '#94a3b8' }}>
            Unify billing pipelines, academic gradebooks, visitor registries, staff payroll, and print-ready smart identity card generation in a secure, high-performance SaaS suite.
          </p>

          {/* Dual CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto sm:max-w-none mb-24 reveal-up">
            <button 
              onClick={onEnterPortal}
              className="saas-btn-primary w-full sm:w-auto"
            >
              Get Started Free
              <ArrowRight size={14} />
            </button>
            <a 
              href="#contact"
              className="saas-btn-secondary w-full sm:w-auto"
            >
              Book Interactive Demo
            </a>
          </div>

          {/* Trust statistics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-900 max-w-4xl mx-auto reveal-up">
            <div className="text-center">
              <span className="text-2xl md:text-3xl font-extrabold text-white block">200+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Schools Active</span>
            </div>
            <div className="text-center">
              <span className="text-2xl md:text-3xl font-extrabold text-white block">50,000+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Students Managed</span>
            </div>
            <div className="text-center">
              <span className="text-2xl md:text-3xl font-extrabold text-white block">$2.5M+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Transacted Annually</span>
            </div>
            <div className="text-center">
              <span className="text-2xl md:text-3xl font-extrabold text-white block">99.99%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Guaranteed Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🖥️ Interactive Dashboard Showcase Panel */}
      <section id="showcase" className="py-24 px-6 relative z-10 border-t border-slate-900/60 bg-slate-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto pb-12 reveal-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              Interactive System Showcase
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Premium Operational Console
            </h2>
            <p className="text-slate-400 text-sm">
              Toggle through core modules below to preview how our unified database logs transaction histories and sheet updates in real-time.
            </p>
          </div>

          {/* Interactive tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12 bg-slate-900/40 p-1.5 rounded-xl border border-slate-850 max-w-md mx-auto reveal-up">
            <button
              onClick={() => setActiveShowcaseTab('analytics')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeShowcaseTab === 'analytics' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fiscal Center
            </button>
            <button
              onClick={() => setActiveShowcaseTab('students')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeShowcaseTab === 'students' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student Directory
            </button>
            <button
              onClick={() => setActiveShowcaseTab('sheetSync')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeShowcaseTab === 'sheetSync' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spreadsheet Webhook
            </button>
          </div>

          {/* Browser frame mockup showcase */}
          <div className="browser-frame p-6 reveal-up relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left explanation block */}
              <div className="lg:col-span-4 flex flex-col justify-between p-2 items-center text-center">
                <div className="w-full flex flex-col items-center">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase tracking-wider inline-block mb-4">
                    {showcaseTabs[activeShowcaseTab].badge}
                  </span>
                  <h4 className="text-xl font-bold text-white mb-4">
                    {showcaseTabs[activeShowcaseTab].title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-8">
                    {showcaseTabs[activeShowcaseTab].desc}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-slate-500 font-mono">WORKSPACE INTERFACE ONLINE</span>
                </div>
              </div>

              {/* Right preview block */}
              <div className="lg:col-span-8 p-6 rounded-xl border border-slate-850 bg-[#070b13]/60 shadow-inner flex flex-col justify-center min-h-[300px] transition-all duration-300">
                {showcaseTabs[activeShowcaseTab].data}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 📚 Premium 9 Features Grid */}
      <section id="features" className="py-24 px-6 border-t border-slate-900/60 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 reveal-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              Comprehensive Modules
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Built For Enterprise Operations
            </h2>
            <p className="text-slate-400 text-sm">
              Explore the modules powering school management software, ensuring complete security and clean operations.
            </p>
          </div>

          {/* Grid of 9 Cards */}
          <div className="saas-feature-grid reveal-up">
            {features.map((feat, idx) => (
              <div key={idx} className="saas-feature-card">
                <div className="saas-card-glow" />
                <div className="w-10 h-10 rounded-lg bg-slate-900/80 border border-slate-850 flex items-center justify-center mb-6 shadow-sm mx-auto">
                  {feat.icon}
                </div>
                <h3 className="text-center text-base font-bold text-white mb-2.5">{feat.title}</h3>
                <p className="text-center text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 👥 Role-Based Access Section */}
      <section id="roles" className="py-24 px-6 border-t border-slate-900/60 bg-slate-950/20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 reveal-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              Fine-Grained Permissions
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Secure Role-Based Workspaces
            </h2>
            <p className="text-slate-400 text-sm">
              Our ERP secures views using JWT authorization signatures. Switch below to preview configuration rights per role.
            </p>
          </div>

          {/* Switcher Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-14 border-b border-slate-900 pb-4 reveal-up">
            {Object.keys(roles).map((key) => (
              <button
                key={key}
                onClick={() => setActiveRoleTab(key)}
                className={`saas-role-tab-btn ${activeRoleTab === key ? 'active' : ''}`}
              >
                {roles[key].name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Active Role Content Card */}
          <div className="role-preview-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch reveal-up">
            
            {/* Description details */}
            <div className="lg:col-span-5 flex flex-col justify-between items-center text-center">
              <div className="w-full flex flex-col items-center">
                <span 
                  className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-block mb-4 border"
                  style={{ 
                    color: roles[activeRoleTab].color, 
                    borderColor: `${roles[activeRoleTab].color}30`,
                    backgroundColor: `${roles[activeRoleTab].color}08`
                  }}
                >
                  {roles[activeRoleTab].tagline}
                </span>
                <h3 className="text-2xl font-bold text-white mb-3 text-center">{roles[activeRoleTab].name}</h3>
                <p className="text-slate-450 text-xs mb-8 leading-relaxed text-center" style={{ color: '#cbd5e1' }}>
                  {roles[activeRoleTab].benefit}
                </p>

                <div className="flex flex-col gap-3 items-center">
                  {roles[activeRoleTab].permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 justify-center">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Check size={9} />
                      </div>
                      <span className="font-medium text-slate-300 leading-none">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-850/80 w-full flex justify-center">
                <button 
                  onClick={onEnterPortal}
                  className="saas-btn-primary"
                  style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '11px' }}
                >
                  Test Role Workspace
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Simulated mini dashboard console */}
            <div className="lg:col-span-7 p-6 rounded-xl border border-slate-850 bg-[#070b13]/60 shadow-lg flex flex-col justify-between min-h-[250px]">
              <div className="flex items-center justify-between border-b border-slate-850/80 pb-3 mb-4">
                <span className="text-[9px] font-mono text-slate-500">active_role_feed_preview.json</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Access Approved</span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850/80 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">{roles[activeRoleTab].metric.label}</span>
                    <span className="text-2xl font-extrabold text-white">{roles[activeRoleTab].metric.val}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                    {roles[activeRoleTab].metric.trend}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🏷️ Redesigned Pricing Section */}
      <section id="pricing" className="py-24 px-6 border-t border-slate-900/60 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 reveal-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              Licensing Rates
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Flexible Plans for Any Scale
            </h2>
            <p className="text-slate-400 text-sm">
              Deploy our automation portal locally or in the cloud. Choose the tier that matches your institutional requirements.
            </p>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center justify-center gap-3 mb-12 reveal-up">
            <span className="text-xs text-slate-400 font-semibold">Select Currency:</span>
            <div className="inline-flex bg-slate-900/40 p-1 rounded-xl border border-slate-850">
              <button 
                onClick={() => setCurrency('USD')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                USD ($)
              </button>
              <button 
                onClick={() => setCurrency('INR')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currency === 'INR' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                INR (₹)
              </button>
              <button 
                onClick={() => setCurrency('EUR')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currency === 'EUR' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EUR (€)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div 
                key={idx}
                className={`p-8 rounded-2xl border flex flex-col relative transition-all duration-300 reveal-up ${
                  plan.popular 
                    ? 'bg-[#0d1527] border-blue-500 shadow-xl shadow-blue-500/5' 
                    : 'bg-slate-900/30 border-slate-850 hover:border-slate-800'
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}
                
                <h3 className="text-lg font-bold text-white mb-2 text-center">{plan.name}</h3>
                <p className="text-slate-405 text-xs mb-6 leading-relaxed text-center" style={{ color: '#cbd5e1' }}>{plan.desc}</p>
                
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-4xl font-black text-white">
                    {currency === 'USD' ? plan.price : currency === 'INR' ? `₹${(parseInt(plan.price.replace('$', ''), 10) * 80).toLocaleString('en-IN')}` : `€${Math.round(parseInt(plan.price.replace('$', ''), 10) * 0.9).toLocaleString('de-DE')}`}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{plan.period}</span>
                </div>

                <hr className="border-slate-850 mb-6" />

                <ul className="flex flex-col gap-4 mb-8 flex-1 items-center">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                      <div className="w-4.5 h-4.5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                        <Check size={10} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={onEnterPortal}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all ${
                    plan.popular
                      ? 'bg-blue-650 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/20'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-250 border border-slate-800'
                  }`}
                >
                  Get Started Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 💬 Trusted by Educators Testimonials */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 reveal-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              User Testimonials
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
              Trusted by Educators
            </h2>
            <p className="text-slate-400 text-sm">
              Read how academic directors and classroom supervisors utilize our ERP portal to automate administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 reveal-up">
            {testimonials.map((test, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl border border-slate-850 bg-slate-900/30 flex flex-col gap-6 relative"
              >
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: test.rating }).map((_, sIdx) => (
                    <Star key={sIdx} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-slate-300 text-xs leading-relaxed italic flex-1 text-center">
                  "{test.quote}"
                </p>

                <div className="flex flex-col items-center gap-3 pt-4 border-t border-slate-850/50">
                  <img src={test.avatar} alt={test.author} className="w-10 h-10 rounded-full object-cover border border-slate-800" />
                  <div className="text-center">
                    <h4 className="text-xs font-bold text-white">{test.author}</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ❓ Support FAQ Accordion Section */}
      <section id="faq" className="py-24 px-6 border-t border-slate-900/60 bg-slate-950/20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20 reveal-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              FAQ Lobby
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm">
              Answers to technical queries regarding routing, databases, sheet synclogs, and deployment configurations.
            </p>
          </div>

          <div className="flex flex-col gap-6 reveal-up">
            {faqs.map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div 
                   key={idx}
                  className="rounded-xl border border-slate-850 bg-[#0c111d]/50 overflow-hidden transition-all duration-300"
                >
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-900/10"
                  >
                    <span className="text-sm font-semibold text-white flex items-center gap-3">
                      <HelpCircle size={16} className="text-blue-450 flex-shrink-0" style={{ color: '#60a5fa' }} />
                      {faq.q}
                    </span>
                    <ChevronDown 
                      size={16} 
                      className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-xs text-slate-400 border-t border-slate-850/50 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ✉️ Contact Form Section */}
      <section id="contact" className="Saas-contact py-24 px-6 border-t border-slate-900 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Details Column */}
          <div className="lg:col-span-5 flex flex-col justify-center reveal-up">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4 text-center">
              Connect With Us
            </h2>
            <p className="text-slate-400 text-xs mb-8 leading-relaxed font-medium text-center max-w-sm mx-auto">
              Have inquiries about deploying the ERP automation platform on your school's domain, or want to sync your custom biometric logs?
            </p>

            <div className="flex flex-col items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  <Mail size={14} />
                </div>
                <span>support@highschool.edu</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  <Phone size={14} />
                </div>
                <span>+1 (555) 019-2026</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  <MapPin size={14} />
                </div>
                <span>100 Technology Way, Silicon Valley</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 reveal-up">
            <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-850">
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400">Your Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Liam Chen"
                      className="px-4 py-3 rounded-lg bg-[#070b13] border border-slate-850 focus:border-blue-500 text-xs outline-none text-white transition-all font-medium"
                      value={contactForm.name}
                      onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400">Work Email Address</label>
                    <input 
                      type="email" 
                      placeholder="liam.chen@school.edu"
                      className="px-4 py-3 rounded-lg bg-[#070b13] border border-slate-850 focus:border-blue-500 text-xs outline-none text-white transition-all font-medium"
                      value={contactForm.email}
                      onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400">Inquiry Message</label>
                  <textarea 
                    rows={4}
                    placeholder="Enter details about your institute, student count, and requested automation services..."
                    className="px-4 py-3 rounded-lg bg-[#070b13] border border-slate-850 focus:border-blue-500 text-xs outline-none text-white transition-all resize-none font-medium"
                    value={contactForm.message}
                    onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitted}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
                >
                  {submitted ? 'Inquiry Sent Successfully! ✓' : 'Send Inquiry Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 🧭 Footer */}
      <footer className="bg-slate-950 py-12 px-6 border-t border-slate-900 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <BookOpen size={16} />
            </div>
            <span className="font-extrabold text-white text-sm">HighSchool ERP</span>
          </div>

          <p className="text-center sm:text-left font-medium">
            © {new Date().getFullYear()} School Automation Software. All rights reserved. Encrypted with TLS 1.3 & SHA-256.
          </p>

          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-slate-350" style={{ color: '#94a3b8' }}>Privacy Policy</a>
            <a href="#" className="hover:text-slate-350" style={{ color: '#94a3b8' }}>Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
