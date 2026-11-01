import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Globe } from 'lucide-react';

export default function DocsModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const htmlSnippet = `<!-- Add to public/index.html <head> of any connected portal -->
<script 
  src="http://localhost:7000/themes/theme-loader.js" 
  data-theme-server="http://localhost:7000"
  data-poll-interval="10">
</script>`;

  const reactSnippet = `// In React App.jsx / main.jsx
import { useEffect } from 'react';

useEffect(() => {
  const handleThemeUpdate = (e) => {
    console.log('Central theme updated:', e.detail.version);
  };
  window.addEventListener('theme:updated', handleThemeUpdate);
  return () => window.removeEventListener('theme:updated', handleThemeUpdate);
}, []);`;

  const tailwindSnippet = `// In tailwind.config.js - Map Tailwind colors directly to CSS variables
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          500: 'var(--primary-500)',
          900: 'var(--primary-900)',
        },
        surface: 'var(--surface)',
        background: 'var(--background)',
        sidebar: 'var(--sidebar)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      }
    }
  }
};`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-items-center gap-2">
            <Code2 size={18} className="text-forest-green" />
            <h3 className="modal-title">Centralized Theme Portal Integration Guide</h3>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body doc-modal-content">
          <section className="mb-4">
            <h4 className="doc-section-title">1. One-Line Script Tag Integration</h4>
            <p className="doc-text">
              Add this lightweight script tag inside your existing portal's <code>index.html</code> <code>&lt;head&gt;</code>.
              It automatically loads the central CSS variables, checks for updates every 10–30 seconds, and atomically swaps stylesheets without reloading the page.
            </p>
            <div className="code-block-wrapper">
              <pre><code>{htmlSnippet}</code></pre>
              <button 
                type="button" 
                className="btn-copy-code"
                onClick={() => handleCopy(htmlSnippet, 1)}
              >
                {copiedIndex === 1 ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
          </section>

          <section className="mb-4">
            <h4 className="doc-section-title">2. Tailwind CSS Integration</h4>
            <p className="doc-text">
              If your existing portal uses Tailwind CSS, map existing color utilities to CSS variables in <code>tailwind.config.js</code>:
            </p>
            <div className="code-block-wrapper">
              <pre><code>{tailwindSnippet}</code></pre>
              <button 
                type="button" 
                className="btn-copy-code"
                onClick={() => handleCopy(tailwindSnippet, 2)}
              >
                {copiedIndex === 2 ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
          </section>

          <section className="mb-2">
            <h4 className="doc-section-title">3. Listening for Theme Update Events in React</h4>
            <div className="code-block-wrapper">
              <pre><code>{reactSnippet}</code></pre>
              <button 
                type="button" 
                className="btn-copy-code"
                onClick={() => handleCopy(reactSnippet, 3)}
              >
                {copiedIndex === 3 ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

