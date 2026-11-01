import React, { useState } from 'react';
import { Palette, ExternalLink, HelpCircle, Terminal } from 'lucide-react';

export default function Header({ onOpenDocs }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo-container">
          <Palette className="brand-logo-icon" size={20} />
        </div>
        <div>
          <div className="brand-title-wrap">
            <h1 className="brand-title">ThemeSuite</h1>
            <span className="brand-badge">Theme Engine</span>
          </div>
          <p className="brand-subtitle">
            Centralized Colour Management & Zero-Downtime Runtime Distribution
          </p>
        </div>
      </div>

      <div className="header-meta">
        <div className="endpoint-pill" title="Public distribution CSS endpoint">
          <span className="endpoint-label">CSS Endpoint:</span>
          <code>/themes/theme.css</code>
        </div>

        <button 
          type="button" 
          className="btn-header-secondary"
          onClick={onOpenDocs}
        >
          <HelpCircle size={15} />
          <span>Integration Guide</span>
        </button>
      </div>
    </header>
  );
}

