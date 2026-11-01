import React, { useState } from 'react';
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
  Laptop,
  Tablet,
  Smartphone,
  ExternalLink,
  BookOpen,
  Award,
  Settings,
  Layers,
  X
} from 'lucide-react';

export default function LivePreview({ cssVariables = {}, themeName = 'Active Theme' }) {
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'forms' | 'elements'

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

  return (
    <div className="preview-container">
      {/* Preview Header & Viewport Controls */}
      <div className="preview-toolbar">
        <div className="preview-toolbar-title">
          <span className="live-indicator-dot" />
          <span className="font-semibold text-xs uppercase tracking-wider">Live Educational ERP Preview</span>
          <span className="preview-theme-label">({themeName})</span>
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
          className={`preview-canvas viewport-${viewportMode}`}
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
              </div>

              <nav className="erp-nav-list">
                <div className="erp-nav-group-title">MAIN MENU</div>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveNav('dashboard')}
                >
                  <Layers size={16} />
                  <span>Dashboard</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'students' ? 'active' : ''}`}
                  onClick={() => setActiveNav('students')}
                >
                  <GraduationCap size={16} />
                  <span>Students ERP</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'academics' ? 'active' : ''}`}
                  onClick={() => setActiveNav('academics')}
                >
                  <BookOpen size={16} />
                  <span>Academics & Exams</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'fees' ? 'active' : ''}`}
                  onClick={() => setActiveNav('fees')}
                >
                  <CreditCard size={16} />
                  <span>Fee Management</span>
                </button>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'faculty' ? 'active' : ''}`}
                  onClick={() => setActiveNav('faculty')}
                >
                  <Users size={16} />
                  <span>Faculty Directory</span>
                </button>

                <div className="erp-nav-group-title mt-4">ADMINISTRATION</div>
                <button
                  type="button"
                  className={`erp-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveNav('settings')}
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

            {/* ERP Main Body */}
            <main className="erp-main-content">
              {/* Top Navbar */}
              <header className="erp-navbar">
                <div className="erp-navbar-left">
                  <div className="erp-search-wrap">
                    <Search size={14} className="erp-search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search roll no, faculty or course..." 
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
                    <h2 className="erp-page-title">Institutional Overview</h2>
                    <p className="erp-page-sub">Central Educational Academy • Engineering Campus</p>
                  </div>

                  <div className="erp-sub-tabs">
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
                </div>

                {/* TAB 1: Overview Cards */}
                {activeTab === 'overview' && (
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
                {activeTab === 'students' && (
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
                {activeTab === 'forms' && (
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
                        <div className="flex gap-4 mt-2">
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
                {activeTab === 'elements' && (
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

