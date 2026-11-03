import React, { useEffect, useRef, useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  CalendarCheck, 
  Search, 
  Bell, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  MoreVertical,
  FileText,
  Laptop,
  Tablet,
  Smartphone,
  ExternalLink,
  BookOpen,
  Award,
  Settings,
  Layers,
  X,
  Menu
} from 'lucide-react';

const SECTION_PREVIEW_TABS = {
  brand: 'overview',
  backgrounds: 'overview',
  typography: 'students',
  borders: 'forms',
  semantic: 'elements'
};

const PREVIEW_PAGES = {
  dashboard: {
    title: 'Institutional Overview',
    description: 'Central Educational Academy • Engineering Campus'
  },
  students: {
    title: 'Student Records',
    description: 'Enrollment, academic standing, and student services'
  },
  academics: {
    title: 'Academics & Exams',
    description: 'Courses, schedules, assessments, and results'
  },
  attendance: {
    title: 'Attendance & Leaves',
    description: 'Attendance trends, course records, and leave requests'
  },
  grades: {
    title: 'Semester Results',
    description: 'Assessment outcomes, grades, and academic progress'
  },
  fees: {
    title: 'Fee Management',
    description: 'Collections, invoices, and outstanding balances'
  },
  faculty: {
    title: 'Faculty Directory',
    description: 'Staff profiles, departments, and availability'
  },
  settings: {
    title: 'Institute Settings',
    description: 'Campus profile, preferences, and portal configuration'
  },
  library: {
    title: 'Digital Library',
    description: 'Browse academic resources and manage your reading list'
  }
};

const sampleCourses = [
  { code: 'CS601PC', course: 'Design & Analysis of Algorithms', faculty: 'Dr. K. Suresh', credits: '4.0', schedule: 'Mon, Wed · 09:00' },
  { code: 'CS602PC', course: 'Machine Learning & Deep Neural Nets', faculty: 'Prof. S. Kavitha', credits: '4.0', schedule: 'Tue, Thu · 11:00' },
  { code: 'CS603PC', course: 'Compiler Design & Optimization', faculty: 'Dr. M. Ramesh', credits: '3.0', schedule: 'Mon, Fri · 14:00' },
  { code: 'CS604PE', course: 'Cloud Computing Architecture', faculty: 'Prof. P. Nair', credits: '3.0', schedule: 'Wed, Fri · 10:00' }
];

const sampleFaculty = [
  { name: 'Dr. K. Suresh', role: 'Professor · Computer Science', email: 'suresh.k@pydah.edu', status: 'Available' },
  { name: 'Prof. S. Kavitha', role: 'Associate Professor · AI & ML', email: 'kavitha.s@pydah.edu', status: 'In class' },
  { name: 'Dr. M. Ramesh', role: 'Professor · Information Technology', email: 'ramesh.m@pydah.edu', status: 'Available' },
  { name: 'Prof. P. Nair', role: 'Assistant Professor · Computer Science', email: 'nair.p@pydah.edu', status: 'On leave' }
];

export default function LivePreview({
  cssVariables = {},
  themeName = 'Active Theme',
  highlightSection = null,
  highlightLabel = null,
  highlightRequest = 0
}) {
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'forms' | 'elements'
  const [isHighlighting, setIsHighlighting] = useState(false);
  const previousSection = useRef(highlightSection);
  const previousHighlightRequest = useRef(highlightRequest);
  const previousCssVariables = useRef(cssVariables);
  const highlightTimer = useRef(null);
  const highlightFrame = useRef(null);

  const pulseHighlight = () => {
    if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    if (highlightFrame.current) window.cancelAnimationFrame(highlightFrame.current);

    setIsHighlighting(false);
    highlightFrame.current = window.requestAnimationFrame(() => {
      setIsHighlighting(true);
      highlightTimer.current = window.setTimeout(() => {
        setIsHighlighting(false);
        highlightTimer.current = null;
      }, 1100);
      highlightFrame.current = null;
    });
  };

  useEffect(() => {
    const previewTab = SECTION_PREVIEW_TABS[highlightSection];
    if (previewTab) setActiveTab(previewTab);

    const sectionChanged = previousSection.current !== highlightSection;
    const requestedHighlight = previousHighlightRequest.current !== highlightRequest;
    if (sectionChanged) {
      previousSection.current = highlightSection;
    }
    previousHighlightRequest.current = highlightRequest;

    if (highlightSection && (sectionChanged || requestedHighlight)) {
      pulseHighlight();
    }
  }, [highlightSection, highlightRequest]);

  useEffect(() => {
    if (previousCssVariables.current !== cssVariables) {
      previousCssVariables.current = cssVariables;
      if (highlightSection) pulseHighlight();
    }
  }, [cssVariables, highlightSection]);

  useEffect(() => () => {
    if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    if (highlightFrame.current) window.cancelAnimationFrame(highlightFrame.current);
  }, []);

  const sampleStudents = [
    { roll: '23ENG0101', name: 'Aarav Sharma', branch: 'CSE (AI & ML)', year: '3rd Year', feeStatus: 'Paid', status: 'Active' },
    { roll: '23ENG0142', name: 'Pooja Reddy', branch: 'ECE', year: '2nd Year', feeStatus: 'Pending', status: 'Pending' },
    { roll: '22ENG0089', name: 'Vikram Varma', branch: 'Mechanical', year: '4th Year', feeStatus: 'Paid', status: 'Active' },
    { roll: '24ENG0211', name: 'Sneha Patel', branch: 'Data Science', year: '1st Year', feeStatus: 'Overdue', status: 'Warning' }
  ];

  const getContainerWidth = () => {
    switch (viewportMode) {
      case 'mobile': return '390px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const selectPreviewPage = (page) => {
    setActiveNav(page);
    if (page === 'dashboard') setActiveTab('overview');
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="preview-container">
      {/* Preview Header & Viewport Controls */}
      <div className="preview-toolbar">
        <div className="preview-toolbar-title">
          <span className="live-indicator-dot" />
          <span className="font-semibold text-xs uppercase tracking-wider">Live Educational ERP Preview</span>
          <span className="preview-theme-label">({themeName})</span>
          {highlightLabel && (
            <span className="preview-impact-label">
              Showing changes for <strong>{highlightLabel}</strong>
            </span>
          )}
        </div>

        <div className="preview-toolbar-controls">
          <div className="viewport-toggle-group">
            <button
              type="button"
              className={`btn-viewport ${viewportMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewportMode('desktop')}
              title="Desktop View (100%)"
            >
              <Laptop size={14} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              className={`btn-viewport ${viewportMode === 'tablet' ? 'active' : ''}`}
              onClick={() => setViewportMode('tablet')}
              title="Tablet View (768px)"
            >
              <Tablet size={14} />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              className={`btn-viewport ${viewportMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewportMode('mobile')}
              title="Mobile View (390px)"
            >
              <Smartphone size={14} />
              <span>Mobile</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-preview-modal-trigger"
            onClick={() => setShowModal(true)}
          >
            Preview Modal
          </button>
        </div>
      </div>

      {/* Viewport Frame with Injected CSS Variables */}
      <div className="preview-canvas-wrapper">
        <div 
          className={`preview-canvas viewport-${viewportMode}${viewportMode === 'mobile' && isMobileSidebarOpen ? ' mobile-sidebar-open' : ''}${highlightSection ? ` preview-focus-${highlightSection}` : ''}${isHighlighting ? ' preview-highlight-active' : ''}`}
          style={{ 
            width: getContainerWidth(),
            ...cssVariables
          }}
        >
          {/* Simulated ERP Layout */}
          <div className="erp-app-shell">
            {/* ERP Sidebar */}
            <aside className="erp-sidebar">
              <div className="erp-sidebar-header">
                <div className="erp-brand-icon">E</div>
                <div className="erp-brand-text">
                  <span className="erp-brand-title">EduERP</span>
                  <span className="erp-brand-subtitle">Campus Suite</span>
                </div>
                <button
                  type="button"
                  className="erp-mobile-sidebar-close"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close preview navigation"
                >
                  <X size={16} />
                </button>
              </div>

              <nav id="preview-navigation" className="erp-nav-list" aria-label="Preview pages">
                <div className="erp-nav-group-title">MAIN MENU</div>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
                  onClick={() => selectPreviewPage('dashboard')}
                  aria-current={activeNav === 'dashboard' ? 'page' : undefined}
                >
                  <Layers size={16} />
                  <span>Dashboard</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'students' ? 'active' : ''}`}
                  onClick={() => selectPreviewPage('students')}
                  aria-current={activeNav === 'students' ? 'page' : undefined}
                >
                  <GraduationCap size={16} />
                  <span>Students ERP</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'academics' ? 'active' : ''}`}
                  onClick={() => selectPreviewPage('academics')}
                  aria-current={activeNav === 'academics' ? 'page' : undefined}
                >
                  <BookOpen size={16} />
                  <span>Academics & Exams</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'attendance' ? 'active' : ''}`}
                  onClick={() => selectPreviewPage('attendance')}
                  aria-current={activeNav === 'attendance' ? 'page' : undefined}
                >
                  <CalendarCheck size={16} />
                  <span>Attendance & Leaves</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'grades' ? 'active' : ''}`}
                  onClick={() => selectPreviewPage('grades')}
                  aria-current={activeNav === 'grades' ? 'page' : undefined}
                >
                  <Award size={16} />
                  <span>Semester Results</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'fees' ? 'active' : ''}`}
                  onClick={() => selectPreviewPage('fees')}
                  aria-current={activeNav === 'fees' ? 'page' : undefined}
                >
                  <CreditCard size={16} />
                  <span>Fee Management</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'faculty' ? 'active' : ''}`}
                  onClick={() => selectPreviewPage('faculty')}
                  aria-current={activeNav === 'faculty' ? 'page' : undefined}
                >
                  <Users size={16} />
                  <span>Faculty Directory</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'library' ? 'active' : ''}`}
                  onClick={() => selectPreviewPage('library')}
                  aria-current={activeNav === 'library' ? 'page' : undefined}
                >
                  <BookOpen size={16} />
                  <span>Digital Library</span>
                </button>

                <div className="erp-nav-group-title mt-4">ADMINISTRATION</div>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
                  onClick={() => selectPreviewPage('settings')}
                  aria-current={activeNav === 'settings' ? 'page' : undefined}
                >
                  <Settings size={16} />
                  <span>Institute Settings</span>
                </button>
              </nav>

              <div className="erp-sidebar-footer">
                <div className="erp-user-badge">
                  <div className="erp-avatar">DR</div>
                  <div className="erp-user-info">
                    <span className="erp-user-name">Dr. Ramana Rao</span>
                    <span className="erp-user-role">Dean of Academics</span>
                  </div>
                </div>
              </div>
            </aside>
            {viewportMode === 'mobile' && isMobileSidebarOpen && (
              <button
                type="button"
                className="mobile-sidebar-backdrop"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close preview navigation"
              />
            )}

            {/* ERP Main Body */}
            <main className="erp-main-content">
              {/* Top Navbar */}
              <header className="erp-navbar">
                <div className="erp-navbar-left">
                  {viewportMode === 'mobile' && (
                    <button
                      type="button"
                      className="erp-mobile-menu-toggle"
                      onClick={() => setIsMobileSidebarOpen(true)}
                      aria-label="Open preview navigation"
                      aria-expanded={isMobileSidebarOpen}
                      aria-controls="preview-navigation"
                    >
                      <Menu size={17} />
                    </button>
                  )}
                  <div className="erp-search-wrap">
                    <Search size={14} className="erp-search-icon" />
                    <input 
                      type="text" 
                      placeholder={viewportMode === 'mobile' ? 'Search...' : 'Search roll no, faculty or course...'}
                      className="erp-search-input"
                    />
                  </div>
                </div>

                <div className="erp-navbar-right">
                  <div className="erp-term-badge">
                    <CalendarCheck size={14} />
                    <span>AY 2026–27 | Sem I</span>
                  </div>

                  <button type="button" className="erp-icon-btn notification-btn">
                    <Bell size={16} />
                    <span className="erp-badge-dot" />
                  </button>

                  <div className="erp-nav-avatar">P</div>
                </div>
              </header>

              {/* Page Content */}
              <div className="erp-content-body">
                {/* Page Title & ERP Tabs */}
                <div className="erp-page-header">
                  <div>
                    <h2 className="erp-page-title">{PREVIEW_PAGES[activeNav].title}</h2>
                    <p className="erp-page-sub">{PREVIEW_PAGES[activeNav].description}</p>
                  </div>

                  {activeNav === 'dashboard' && (
                    <div className="erp-sub-tabs" aria-label="Dashboard component previews">
                    <button
                      type="button"
                      className={`erp-sub-tab ${activeTab === 'overview' ? 'active' : ''}`}
                      onClick={() => setActiveTab('overview')}
                    >
                      Overview Cards
                    </button>
                    <button
                      type="button"
                      className={`erp-sub-tab ${activeTab === 'students' ? 'active' : ''}`}
                      onClick={() => setActiveTab('students')}
                    >
                      Student Table
                    </button>
                    <button
                      type="button"
                      className={`erp-sub-tab ${activeTab === 'forms' ? 'active' : ''}`}
                      onClick={() => setActiveTab('forms')}
                    >
                      Forms & Buttons
                    </button>
                    <button
                      type="button"
                      className={`erp-sub-tab ${activeTab === 'elements' ? 'active' : ''}`}
                      onClick={() => setActiveTab('elements')}
                    >
                      Alerts & Badges
                    </button>
                    </div>
                  )}
                </div>

                {/* TAB 1: Overview Cards */}
                {activeNav === 'dashboard' && activeTab === 'overview' && (
                  <>
                    <div className="erp-metric-cards-grid">
                      <div className="erp-metric-card">
                        <div className="metric-header">
                          <span className="metric-title">Total Enrolled</span>
                          <span className="metric-icon-wrap primary-icon">
                            <GraduationCap size={16} />
                          </span>
                        </div>
                        <div className="metric-value">4,850</div>
                        <div className="metric-footer positive">
                          <span>+12.4%</span> from previous semester
                        </div>
                      </div>

                      <div className="erp-metric-card">
                        <div className="metric-header">
                          <span className="metric-title">Today's Attendance</span>
                          <span className="metric-icon-wrap success-icon">
                            <CalendarCheck size={16} />
                          </span>
                        </div>
                        <div className="metric-value">94.2%</div>
                        <div className="metric-footer text-muted">
                          4,568 Students Present on campus
                        </div>
                      </div>

                      <div className="erp-metric-card">
                        <div className="metric-header">
                          <span className="metric-title">Fee Realization</span>
                          <span className="metric-icon-wrap accent-icon">
                            <CreditCard size={16} />
                          </span>
                        </div>
                        <div className="metric-value">₹2.84 Cr</div>
                        <div className="metric-footer positive">
                          <span>88.5%</span> of total dues collected
                        </div>
                      </div>

                      <div className="erp-metric-card">
                        <div className="metric-header">
                          <span className="metric-title">Faculty On Duty</span>
                          <span className="metric-icon-wrap info-icon">
                            <Users size={16} />
                          </span>
                        </div>
                        <div className="metric-value">192 / 205</div>
                        <div className="metric-footer text-muted">
                          13 on approved leave
                        </div>
                      </div>
                    </div>

                    {/* Quick ERP Table Teaser */}
                    <div className="erp-card mt-4">
                      <div className="erp-card-header">
                        <h4 className="erp-card-title">Recent Fee & Enrollment Updates</h4>
                        <button type="button" className="btn-erp-outline text-xs" onClick={() => setActiveTab('students')}>
                          View All Records
                        </button>
                      </div>
                      <div className="erp-table-responsive">
                        <table className="erp-table">
                          <thead>
                            <tr>
                              <th>Roll Number</th>
                              <th>Student Name</th>
                              <th>Department</th>
                              <th>Year</th>
                              <th>Fee Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sampleStudents.slice(0, 3).map((st) => (
                              <tr key={st.roll}>
                                <td className="font-mono text-xs font-semibold">{st.roll}</td>
                                <td>{st.name}</td>
                                <td>{st.branch}</td>
                                <td>{st.year}</td>
                                <td>
                                  <span className={`erp-badge ${st.feeStatus === 'Paid' ? 'badge-success' : st.feeStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                                    {st.feeStatus}
                                  </span>
                                </td>
                                <td>
                                  <button type="button" className="btn-erp-ghost text-xs" onClick={() => setShowModal(true)}>
                                    Inspect
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 2: Students Data Table */}
                {activeNav === 'dashboard' && activeTab === 'students' && (
                  <div className="erp-card">
                    <div className="erp-card-header">
                      <div>
                        <h4 className="erp-card-title">Student Records Management</h4>
                        <p className="text-xs text-muted">B.Tech & M.Tech Active Cohorts</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="btn-erp-secondary text-xs">Export CSV</button>
                        <button type="button" className="btn-erp-primary text-xs" onClick={() => setShowModal(true)}>+ New Admission</button>
                      </div>
                    </div>
                    <div className="erp-table-responsive">
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Department</th>
                            <th>Academic Year</th>
                            <th>Enrollment Status</th>
                            <th>Fee Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sampleStudents.map((st) => (
                            <tr key={st.roll}>
                              <td className="font-mono text-xs font-semibold">{st.roll}</td>
                              <td className="font-medium">{st.name}</td>
                              <td>{st.branch}</td>
                              <td>{st.year}</td>
                              <td>
                                <span className={`erp-badge ${st.status === 'Active' ? 'badge-primary' : st.status === 'Warning' ? 'badge-danger' : 'badge-warning'}`}>
                                  {st.status}
                                </span>
                              </td>
                              <td>
                                <span className={`erp-badge ${st.feeStatus === 'Paid' ? 'badge-success' : st.feeStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                                  {st.feeStatus}
                                </span>
                              </td>
                              <td>
                                <div className="flex gap-1">
                                  <button type="button" className="btn-erp-outline text-xs px-2 py-1" onClick={() => setShowModal(true)}>
                                    View
                                  </button>
                                  <button type="button" className="btn-erp-ghost text-xs px-2 py-1">
                                    Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: Forms & Buttons Preview */}
                {activeNav === 'dashboard' && activeTab === 'forms' && (
                  <div className="erp-card">
                    <h4 className="erp-card-title mb-3">Institutional Form Controls</h4>
                    <div className="erp-form-grid">
                      <div className="erp-form-group">
                        <label className="erp-form-label">Student Full Name</label>
                        <input type="text" className="erp-input" defaultValue="Vikram Varma" placeholder="Enter student name" />
                        <span className="erp-form-hint">Matches official SSC marks memo</span>
                      </div>

                      <div className="erp-form-group">
                        <label className="erp-form-label">Department / Branch</label>
                        <select className="erp-select" defaultValue="cse">
                          <option value="cse">Computer Science & Engineering</option>
                          <option value="aiml">Artificial Intelligence & ML</option>
                          <option value="ece">Electronics & Communication</option>
                          <option value="mech">Mechanical Engineering</option>
                        </select>
                      </div>

                      <div className="erp-form-group">
                        <label className="erp-form-label">Semester Fee Category</label>
                        <div className="erp-radio-options">
                          <label className="flex items-center gap-2 text-sm text-secondary">
                            <input type="radio" name="fee_cat" defaultChecked className="erp-radio" />
                            Convenor Quota (Govt Reimbursement)
                          </label>
                          <label className="flex items-center gap-2 text-sm text-secondary">
                            <input type="radio" name="fee_cat" className="erp-radio" />
                            Management Quota
                          </label>
                        </div>
                      </div>

                      <div className="erp-form-group">
                        <label className="erp-form-label">Hostel & Transport</label>
                        <div className="flex items-center gap-2 mt-2">
                          <input type="checkbox" id="hostel_opt" defaultChecked className="erp-checkbox" />
                          <label htmlFor="hostel_opt" className="text-sm text-secondary">Opt for Campus Hostel & Mess Facilities</label>
                        </div>
                      </div>
                    </div>

                    <div className="erp-form-actions mt-4 pt-3 border-t">
                      <button type="button" className="btn-erp-primary">
                        Save Registration
                      </button>
                      <button type="button" className="btn-erp-secondary">
                        Secondary Action
                      </button>
                      <button type="button" className="btn-erp-outline">
                        Cancel & Reset
                      </button>
                      <button type="button" className="btn-erp-danger">
                        Delete Record
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: Alerts & Badges */}
                {activeNav === 'dashboard' && activeTab === 'elements' && (
                  <div className="erp-card">
                    <h4 className="erp-card-title mb-3">Semantic Feedback & Status Badges</h4>

                    <div className="erp-alerts-stack">
                      <div className="erp-alert alert-success">
                        <CheckCircle size={16} />
                        <div>
                          <strong>Success:</strong> Examination fees for Semester V processed successfully for 420 students.
                        </div>
                      </div>

                      <div className="erp-alert alert-warning">
                        <AlertTriangle size={16} />
                        <div>
                          <strong>Warning:</strong> 18 library book returns are overdue beyond the grace period.
                        </div>
                      </div>

                      <div className="erp-alert alert-danger">
                        <XCircle size={16} />
                        <div>
                          <strong>Danger:</strong> Server backup scheduled during university portal maintenance window.
                        </div>
                      </div>

                      <div className="erp-alert alert-info">
                        <Info size={16} />
                        <div>
                          <strong>Info:</strong> Mid-term grade submissions open until Friday, 5:00 PM.
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Badge Matrix</h5>
                      <div className="flex flex-wrap gap-2">
                        <span className="erp-badge badge-primary">Primary Active</span>
                        <span className="erp-badge badge-success">Approved / Paid</span>
                        <span className="erp-badge badge-warning">Pending Review</span>
                        <span className="erp-badge badge-danger">Suspended / Due</span>
                        <span className="erp-badge badge-info">Information</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeNav === 'students' && (
                  <>
                    <div className="erp-metric-cards-grid preview-route-metrics">
                      <div className="erp-metric-card">
                        <div className="metric-header"><span className="metric-title">Active Students</span><GraduationCap size={16} /></div>
                        <div className="metric-value">4,850</div>
                        <div className="metric-footer positive">+6.8% this academic year</div>
                      </div>
                      <div className="erp-metric-card">
                        <div className="metric-header"><span className="metric-title">Attendance Average</span><CalendarCheck size={16} /></div>
                        <div className="metric-value">91.4%</div>
                        <div className="metric-footer text-muted">Across all departments</div>
                      </div>
                      <div className="erp-metric-card">
                        <div className="metric-header"><span className="metric-title">Pending Reviews</span><AlertTriangle size={16} /></div>
                        <div className="metric-value">28</div>
                        <div className="metric-footer text-muted">Admissions and documents</div>
                      </div>
                    </div>
                    <div className="erp-card mt-4">
                      <div className="erp-card-header">
                        <div>
                          <h4 className="erp-card-title">Student Directory</h4>
                          <p className="text-xs text-muted">Current academic year · 4 records shown</p>
                        </div>
                        <button type="button" className="btn-erp-primary text-xs" onClick={() => setShowModal(true)}>+ Add Student</button>
                      </div>
                      <div className="erp-table-responsive">
                        <table className="erp-table">
                          <thead><tr><th>Student</th><th>Department</th><th>Year</th><th>Attendance</th><th>Fee Status</th><th>Actions</th></tr></thead>
                          <tbody>
                            {sampleStudents.map((student, index) => (
                              <tr key={student.roll}>
                                <td><strong>{student.name}</strong><br /><span className="text-xs text-muted font-mono">{student.roll}</span></td>
                                <td>{student.branch}</td>
                                <td>{student.year}</td>
                                <td>{[94, 82, 91, 76][index]}%</td>
                                <td><span className={`erp-badge ${student.feeStatus === 'Paid' ? 'badge-success' : student.feeStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>{student.feeStatus}</span></td>
                                <td><button type="button" className="btn-erp-outline text-xs" onClick={() => setShowModal(true)}>View</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {activeNav === 'academics' && (
                  <>
                    <div className="erp-card preview-schedule-card">
                      <div>
                        <span className="text-xs text-muted">UPCOMING EXAM</span>
                        <h3 className="erp-card-title mt-1">Mid-Semester Assessment</h3>
                        <p className="text-sm text-secondary mt-1">Computer Science · Semester VI</p>
                      </div>
                      <div className="preview-schedule-date"><strong>18</strong><span>MAR</span></div>
                    </div>
                    <div className="erp-card mt-4">
                      <div className="erp-card-header">
                        <div><h4 className="erp-card-title">Course Schedule</h4><p className="text-xs text-muted">Semester VI · Computer Science & Engineering</p></div>
                        <button type="button" className="btn-erp-outline text-xs">Download timetable</button>
                      </div>
                      <div className="erp-table-responsive">
                        <table className="erp-table">
                          <thead><tr><th>Course</th><th>Course title</th><th>Faculty</th><th>Credits</th><th>Schedule</th></tr></thead>
                          <tbody>{sampleCourses.map(course => (
                            <tr key={course.code}><td className="font-mono text-xs font-semibold">{course.code}</td><td>{course.course}</td><td>{course.faculty}</td><td>{course.credits}</td><td>{course.schedule}</td></tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                    <div className="erp-alert alert-info mt-4"><Info size={16} /><span>Grade submission for the current assessment closes on Friday at 5:00 PM.</span></div>
                  </>
                )}

                {activeNav === 'attendance' && (
                  <>
                    <div className="erp-metric-cards-grid preview-route-metrics">
                      <div className="erp-metric-card"><span className="metric-title">Overall attendance</span><div className="metric-value">91.4%</div><div className="metric-footer positive">Above the 85% requirement</div></div>
                      <div className="erp-metric-card"><span className="metric-title">Present today</span><div className="metric-value">6 / 7</div><div className="metric-footer text-muted">Scheduled classes attended</div></div>
                      <div className="erp-metric-card"><span className="metric-title">Leave requests</span><div className="metric-value">1</div><div className="metric-footer text-muted">Awaiting faculty approval</div></div>
                    </div>
                    <div className="erp-card mt-4">
                      <div className="erp-card-header"><div><h4 className="erp-card-title">Course Attendance</h4><p className="text-xs text-muted">Semester VI · Updated today</p></div><button type="button" className="btn-erp-outline text-xs">Request leave</button></div>
                      <div className="erp-table-responsive">
                        <table className="erp-table">
                          <thead><tr><th>Course</th><th>Attended</th><th>Conducted</th><th>Attendance</th><th>Status</th></tr></thead>
                          <tbody>
                            {[['Algorithms', '28', '30', '93%', 'badge-success', 'On track'], ['Machine Learning', '25', '28', '89%', 'badge-success', 'On track'], ['Compiler Design', '22', '27', '81%', 'badge-warning', 'At risk'], ['Cloud Computing', '26', '28', '93%', 'badge-success', 'On track']].map(([course, attended, conducted, percent, badge, state]) => (
                              <tr key={course}><td>{course}</td><td>{attended}</td><td>{conducted}</td><td><div className="preview-attendance-value"><span>{percent}</span><span className="preview-progress-track"><span style={{ width: percent }} /></span></div></td><td><span className={`erp-badge ${badge}`}>{state}</span></td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="erp-alert alert-warning mt-4"><AlertTriangle size={16} /><span>Compiler Design is below the department target. Attend upcoming classes to improve your percentage.</span></div>
                  </>
                )}

                {activeNav === 'grades' && (
                  <>
                    <div className="erp-metric-cards-grid preview-route-metrics">
                      <div className="erp-metric-card"><span className="metric-title">Current semester SGPA</span><div className="metric-value">8.92</div><div className="metric-footer positive">Top 5% in department</div></div>
                      <div className="erp-metric-card"><span className="metric-title">Overall CGPA</span><div className="metric-value">8.64</div><div className="metric-footer text-muted">Through Semester V</div></div>
                      <div className="erp-metric-card"><span className="metric-title">Credits completed</span><div className="metric-value">102 / 160</div><div className="metric-footer text-muted">58 credits remaining</div></div>
                    </div>
                    <div className="erp-card mt-4">
                      <div className="erp-card-header"><div><h4 className="erp-card-title">Semester VI Results</h4><p className="text-xs text-muted">Internal assessment · 2026–27</p></div><span className="erp-badge badge-info">Provisional</span></div>
                      <div className="erp-table-responsive">
                        <table className="erp-table">
                          <thead><tr><th>Course</th><th>Internal</th><th>External</th><th>Total</th><th>Grade</th><th>Result</th></tr></thead>
                          <tbody>{sampleCourses.map((course, index) => {
                            const grades = [['28 / 30', '62 / 70', '90', 'A+'], ['29 / 30', '59 / 70', '88', 'A+'], ['26 / 30', '54 / 70', '80', 'A'], ['27 / 30', '56 / 70', '83', 'A']][index];
                            return <tr key={course.code}><td>{course.course}</td><td>{grades[0]}</td><td>{grades[1]}</td><td><strong>{grades[2]}</strong></td><td><span className="erp-badge badge-primary">{grades[3]}</span></td><td><span className="erp-badge badge-success">Pass</span></td></tr>;
                          })}</tbody>
                        </table>
                      </div>
                    </div>
                    <div className="erp-card mt-4"><h4 className="erp-card-title">Grade scale</h4><div className="preview-grade-scale"><span><strong>O</strong> 90–100</span><span><strong>A+</strong> 80–89</span><span><strong>A</strong> 70–79</span><span><strong>B+</strong> 60–69</span><span><strong>Pass</strong> 40–59</span></div></div>
                  </>
                )}

                {activeNav === 'fees' && (
                  <>
                    <div className="erp-metric-cards-grid preview-route-metrics">
                      <div className="erp-metric-card"><span className="metric-title">Collected this term</span><div className="metric-value">₹2.84 Cr</div><div className="metric-footer positive">88.5% of expected fees</div></div>
                      <div className="erp-metric-card"><span className="metric-title">Outstanding balance</span><div className="metric-value">₹36.9 L</div><div className="metric-footer text-muted">Across 642 accounts</div></div>
                      <div className="erp-metric-card"><span className="metric-title">Payment success</span><div className="metric-value">98.2%</div><div className="metric-footer positive">This month</div></div>
                    </div>
                    <div className="erp-card mt-4">
                      <div className="erp-card-header"><div><h4 className="erp-card-title">Recent Fee Transactions</h4><p className="text-xs text-muted">Latest student payments and invoice activity</p></div><button type="button" className="btn-erp-primary text-xs">Create invoice</button></div>
                      <div className="erp-table-responsive">
                        <table className="erp-table">
                          <thead><tr><th>Receipt</th><th>Student</th><th>Fee category</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                          <tbody>
                            {sampleStudents.map((student, index) => (
                              <tr key={student.roll}><td className="font-mono text-xs">RCPT-26{String(index + 1).padStart(3, '0')}</td><td>{student.name}</td><td>{['Tuition', 'Examination', 'Hostel', 'Transport'][index]}</td><td>{['12 Mar 2026', '11 Mar 2026', '10 Mar 2026', '09 Mar 2026'][index]}</td><td>₹{['45,000', '12,500', '28,000', '8,500'][index]}</td><td><span className={`erp-badge ${student.feeStatus === 'Paid' ? 'badge-success' : student.feeStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>{student.feeStatus}</span></td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {activeNav === 'faculty' && (
                  <>
                    <div className="erp-card-header preview-route-header">
                      <div><h4 className="erp-card-title">Faculty & Staff</h4><p className="text-xs text-muted">205 academic staff across 8 departments</p></div>
                      <button type="button" className="btn-erp-primary text-xs">+ Add faculty</button>
                    </div>
                    <div className="preview-faculty-grid">
                      {sampleFaculty.map((faculty, index) => (
                        <article className="erp-card preview-faculty-card" key={faculty.email}>
                          <div className="preview-faculty-avatar">{faculty.name.split(' ').filter(Boolean).map(part => part[0]).slice(-2).join('')}</div>
                          <div className="preview-faculty-info"><h4>{faculty.name}</h4><p>{faculty.role}</p><a href={`mailto:${faculty.email}`}>{faculty.email}</a></div>
                          <span className={`erp-badge ${faculty.status === 'Available' ? 'badge-success' : faculty.status === 'In class' ? 'badge-primary' : 'badge-warning'}`}>{faculty.status}</span>
                          <button type="button" className="btn-erp-outline text-xs" onClick={() => setShowModal(true)}>View profile</button>
                        </article>
                      ))}
                    </div>
                    <div className="erp-card mt-4"><div className="erp-card-header"><h4 className="erp-card-title">Department overview</h4><span className="erp-badge badge-info">8 departments</span></div><div className="erp-table-responsive"><table className="erp-table"><thead><tr><th>Department</th><th>Faculty</th><th>On duty</th><th>Open positions</th></tr></thead><tbody><tr><td>Computer Science & Engineering</td><td>48</td><td>44</td><td><span className="erp-badge badge-warning">2 open</span></td></tr><tr><td>Electronics & Communication</td><td>32</td><td>30</td><td><span className="erp-badge badge-success">Fully staffed</span></td></tr><tr><td>Mechanical Engineering</td><td>28</td><td>26</td><td><span className="erp-badge badge-success">Fully staffed</span></td></tr></tbody></table></div></div>
                  </>
                )}

                {activeNav === 'library' && (
                  <>
                    <div className="erp-card preview-library-toolbar">
                      <div className="erp-search-wrap"><Search size={14} className="erp-search-icon" /><input className="erp-search-input" placeholder="Search books, journals, authors..." /></div>
                      <div className="preview-library-categories"><span className="erp-badge badge-primary">All resources</span><span className="erp-badge badge-info">Textbooks</span><span className="erp-badge badge-info">Journals</span><span className="erp-badge badge-info">Digital</span></div>
                    </div>
                    <div className="erp-card-header preview-route-header mt-4"><div><h4 className="erp-card-title">Recommended for your courses</h4><p className="text-xs text-muted">Resources selected for Computer Science & Engineering</p></div><button type="button" className="btn-erp-outline text-xs">My reading list · 3</button></div>
                    <div className="preview-library-grid">
                      {[
                        ['Algorithms Unlocked', 'Thomas H. Cormen', 'Textbook', 'Available', 'badge-success', 'TU'],
                        ['Deep Learning', 'Ian Goodfellow et al.', 'Digital book', 'Read online', 'badge-info', 'DL'],
                        ['Cloud Systems Journal', 'Vol. 18 · Issue 2', 'Journal', 'New issue', 'badge-primary', 'CS'],
                        ['Compiler Design', 'Alfred V. Aho et al.', 'Textbook', 'Checked out', 'badge-warning', 'CD']
                      ].map(([title, author, type, status, badge, initials]) => (
                        <article className="erp-card preview-book-card" key={title}>
                          <div className="preview-book-cover">{initials}</div>
                          <div className="preview-book-content"><span className="text-xs text-muted">{type}</span><h4>{title}</h4><p>{author}</p><span className={`erp-badge ${badge}`}>{status}</span></div>
                          <button type="button" className="btn-erp-outline text-xs">View resource</button>
                        </article>
                      ))}
                    </div>
                    <div className="erp-card mt-4"><div className="erp-card-header"><h4 className="erp-card-title">Recently accessed</h4><button type="button" className="btn-erp-ghost text-xs">View history</button></div><div className="preview-library-recent"><span><BookOpen size={15} /> Database System Concepts</span><span className="text-xs text-muted">Today · 10:42 AM</span></div><div className="preview-library-recent"><span><FileText size={15} /> IEEE Access · Edge Computing</span><span className="text-xs text-muted">Yesterday</span></div></div>
                  </>
                )}

                {activeNav === 'settings' && (
                  <div className="preview-settings-layout">
                    <div className="erp-card">
                      <div className="erp-card-header"><div><h4 className="erp-card-title">Campus Profile</h4><p className="text-xs text-muted">Manage the details shown across your portal</p></div><span className="erp-badge badge-success">Verified</span></div>
                      <div className="erp-form-grid">
                        <div className="erp-form-group"><label className="erp-form-label">Institution name</label><input className="erp-input" defaultValue="Central Educational Academy" /></div>
                        <div className="erp-form-group"><label className="erp-form-label">Campus</label><select className="erp-select" defaultValue="engineering"><option value="engineering">Engineering Campus</option><option value="polytechnic">Polytechnic Campus</option></select></div>
                        <div className="erp-form-group"><label className="erp-form-label">Academic year</label><select className="erp-select" defaultValue="2026"><option value="2026">2026–27</option><option value="2025">2025–26</option></select></div>
                        <div className="erp-form-group"><label className="erp-form-label">Support email</label><input className="erp-input" type="email" defaultValue="support@pydah.edu" /></div>
                      </div>
                      <div className="erp-form-actions mt-4 pt-3 border-t"><button type="button" className="btn-erp-primary">Save changes</button><button type="button" className="btn-erp-outline">Cancel</button></div>
                    </div>
                    <div className="erp-card preview-runtime-card"><div className="metric-header"><h4 className="erp-card-title">Theme Runtime</h4><CheckCircle size={17} className="text-success" /></div><p className="text-sm text-secondary mt-2">Your campus is connected to the centralized theme service.</p><div className="preview-runtime-row"><span className="text-muted">Distribution endpoint</span><code>/themes/theme.css</code></div><div className="preview-runtime-row"><span className="text-muted">Active theme</span><strong>{themeName}</strong></div><div className="preview-runtime-row"><span className="text-muted">Connection</span><span className="erp-badge badge-success">Healthy</span></div><button type="button" className="btn-erp-outline mt-3">Check connection</button></div>
                  </div>
                )}
              </div>
            </main>
          </div>

          {/* Modal Preview */}
          {showModal && (
            <div className="erp-modal-backdrop" onClick={() => setShowModal(false)}>
              <div className="erp-modal-window" onClick={(e) => e.stopPropagation()}>
                <div className="erp-modal-header">
                  <h4 className="erp-modal-title">Student Fee Clearance & Hall Ticket Approval</h4>
                  <button type="button" className="erp-modal-close" onClick={() => setShowModal(false)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="erp-modal-body">
                  <p className="text-sm text-secondary mb-3">
                    You are reviewing fee clearance for <strong>Aarav Sharma (23ENG0101)</strong>.
                    Approving this status issues the digital semester exam hall ticket.
                  </p>

                  <div className="erp-summary-box">
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-muted">Total Tuition Fee:</span>
                      <span className="font-semibold text-primary">₹75,000</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-muted">Scholarship / Reimbursement:</span>
                      <span className="font-semibold text-success">- ₹35,000</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-t mt-1 pt-1">
                      <span className="font-bold text-primary">Net Amount Paid:</span>
                      <span className="font-bold text-success">₹40,000 (Cleared)</span>
                    </div>
                  </div>
                </div>

                <div className="erp-modal-footer">
                  <button type="button" className="btn-erp-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn-erp-primary" onClick={() => setShowModal(false)}>
                    Approve & Issue Hall Ticket
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
