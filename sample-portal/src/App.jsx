import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Award, 
  FileText, 
  CheckCircle, 
  Radio, 
  RefreshCw, 
  ArrowUpRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import './App.css';

export default function App() {
  const [themeVersion, setThemeVersion] = useState('Loading...');
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Initial check
    const loader = window.ThemeLoader || window.PydahThemeLoader;
    if (loader) {
      const ver = loader.getVersion();
      if (ver) setThemeVersion(ver);
    }

    // Listen to theme swap event from runtime loader
    const handleThemeUpdate = (e) => {
      console.log('[Connected Portal] Central theme updated event received:', e.detail);
      setThemeVersion(e.detail.version);
      setLastUpdated(new Date().toLocaleTimeString());
      setUpdateCount(prev => prev + 1);
    };

    window.addEventListener('theme:updated', handleThemeUpdate);
    window.addEventListener('pydah:theme-updated', handleThemeUpdate);
    return () => {
      window.removeEventListener('theme:updated', handleThemeUpdate);
      window.removeEventListener('pydah:theme-updated', handleThemeUpdate);
    };
  }, []);

  const handleManualCheck = () => {
    setIsChecking(true);
    const loader = window.ThemeLoader || window.PydahThemeLoader;
    if (loader) {
      loader.checkNow(() => {
        setIsChecking(false);
      });
    } else {
      setTimeout(() => setIsChecking(false), 500);
    }
  };

  return (
    <div className="portal-container">
      {/* Top Banner indicating Central Theme Connection */}
      <div className="theme-status-banner">
        <div className="banner-left">
          <span className="live-pulse" />
          <span className="banner-title">CONNECTED PORTAL:</span>
          <span className="banner-desc">Consuming Centralized Theme CSS from <code>http://localhost:7000/themes/theme.css</code></span>
        </div>

        <div className="banner-right">
          <div className="status-pill">
            <Radio size={13} className="text-success" />
            <span>Active Version: <strong>v{themeVersion}</strong></span>
          </div>
          <div className="status-pill">
            <span>Live Swaps: <strong>{updateCount}</strong></span>
          </div>
          <button 
            type="button" 
            className="btn-sync-check" 
            onClick={handleManualCheck}
            disabled={isChecking}
          >
            <RefreshCw size={12} className={isChecking ? 'spin' : ''} />
            <span>{isChecking ? 'Checking...' : 'Check Now'}</span>
          </button>
        </div>
      </div>

      {/* Portal Header */}
      <header className="portal-header">
        <div className="portal-header-content">
          <div className="portal-brand">
            <div className="portal-logo">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="portal-title">Pydah College of Engineering & Technology</h1>
              <span className="portal-subtitle">Student & Faculty Academic Portal</span>
            </div>
          </div>

          <div className="portal-user-meta">
            <span className="academic-term-chip">Semester VI • 2026</span>
            <div className="avatar-chip">AS</div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="portal-layout">
        {/* Left Sidebar */}
        <aside className="portal-sidebar">
          <nav className="portal-nav">
            <a href="#overview" className="nav-link active">Academic Overview</a>
            <a href="#courses" className="nav-link">My Enrolled Courses</a>
            <a href="#attendance" className="nav-link">Attendance & Leaves</a>
            <a href="#grades" className="nav-link">Semester Results</a>
            <a href="#fees" className="nav-link">Fee Receipts</a>
            <a href="#library" className="nav-link">Digital Library</a>
          </nav>

          <div className="portal-sidebar-box">
            <ShieldCheck size={18} />
            <div className="box-text">
              <span className="box-title">Theme Runtime</span>
              <span className="box-desc">Automated polling active (5s dev cycle). Stylesheet swaps seamlessly with zero FOUC.</span>
            </div>
          </div>
        </aside>

        {/* Center Dashboard View */}
        <main className="portal-main">
          {/* Metrics Row */}
          <div className="portal-cards-grid">
            <div className="portal-card stat-card">
              <div className="stat-header">
                <span className="stat-title">Current Semester SGPA</span>
                <Award size={18} className="text-primary-var" />
              </div>
              <div className="stat-value">8.92</div>
              <span className="stat-sub positive">Top 5% in CSE Department</span>
            </div>

            <div className="portal-card stat-card">
              <div className="stat-header">
                <span className="stat-title">Overall Attendance</span>
                <Calendar size={18} className="text-secondary-var" />
              </div>
              <div className="stat-value">91.4%</div>
              <span className="stat-sub">Eligible for all lab finals</span>
            </div>

            <div className="portal-card stat-card">
              <div className="stat-header">
                <span className="stat-title">Fee Clearance</span>
                <CreditCard size={18} className="text-primary-var" />
              </div>
              <div className="stat-value">Cleared</div>
              <span className="stat-sub positive">No pending dues</span>
            </div>
          </div>

          {/* Sample Table with Live Theme Colours */}
          <div className="portal-card mt-4">
            <div className="card-header-row">
              <h3 className="card-heading">Current Semester Enrolled Subjects</h3>
              <button type="button" className="btn-primary-var">
                Download Hall Ticket
              </button>
            </div>

            <div className="table-responsive">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Title</th>
                    <th>Credits</th>
                    <th>Internal Marks</th>
                    <th>Attendance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="code-cell">CS601PC</td>
                    <td>Design & Analysis of Algorithms</td>
                    <td>4.0</td>
                    <td>28 / 30</td>
                    <td>94%</td>
                    <td><span className="badge-var-success">Registered</span></td>
                  </tr>
                  <tr>
                    <td className="code-cell">CS602PC</td>
                    <td>Machine Learning & Deep Neural Nets</td>
                    <td>4.0</td>
                    <td>29 / 30</td>
                    <td>96%</td>
                    <td><span className="badge-var-success">Registered</span></td>
                  </tr>
                  <tr>
                    <td className="code-cell">CS603PC</td>
                    <td>Compiler Design & Optimization</td>
                    <td>3.0</td>
                    <td>26 / 30</td>
                    <td>88%</td>
                    <td><span className="badge-var-success">Registered</span></td>
                  </tr>
                  <tr>
                    <td className="code-cell">CS604PE</td>
                    <td>Cloud Computing Architecture</td>
                    <td>3.0</td>
                    <td>27 / 30</td>
                    <td>90%</td>
                    <td><span className="badge-var-success">Registered</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="portal-card-actions mt-4">
              <button type="button" className="btn-primary-var">Primary Action</button>
              <button type="button" className="btn-secondary-var">Secondary Action</button>
              <button type="button" className="btn-outline-var">Outline Button</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

