import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ThemeOverview from './editor/ThemeOverview';
import ColorEditor from './editor/ColorEditor';
import PresetSelector from './editor/PresetSelector';
import LivePreview from './preview/LivePreview';
import CreateThemeModal from './components/CreateThemeModal';
import DocsModal from './components/DocsModal';
import { generateCssVariablesMap, generateShades } from './utils/colorUtils';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import './App.css';

export default function App() {
  const [status, setStatus] = useState(null);
  const [activeTheme, setActiveTheme] = useState(null);
  const [draftTheme, setDraftTheme] = useState(null);
  const [presets, setPresets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial data
  const loadThemeData = async () => {
    try {
      setIsLoading(true);
      const [statusRes, draftRes, activeRes, presetsRes] = await Promise.all([
        fetch('/api/theme/status').then(r => r.json()),
        fetch('/api/theme/draft').then(r => r.json()),
        fetch('/api/theme/active').then(r => r.json()),
        fetch('/api/theme/presets').then(r => r.json())
      ]);

      setStatus(statusRes);
      setDraftTheme(draftRes);
      setActiveTheme(activeRes);
      setPresets(presetsRes);
    } catch (err) {
      console.error('Failed to load theme state:', err);
      showToast('Could not connect to Theme Server on port 7000', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThemeData();
  }, []);

  // Determine if draft has changes vs published active theme
  const isDraftDirty = useMemo(() => {
    if (!draftTheme || !activeTheme) return false;
    return JSON.stringify(draftTheme.colors) !== JSON.stringify(activeTheme.colors);
  }, [draftTheme, activeTheme]);

  // Compute live CSS variables from current draft
  const liveCssVariables = useMemo(() => {
    if (!draftTheme || !draftTheme.colors) return {};
    return generateCssVariablesMap(draftTheme.colors);
  }, [draftTheme]);

  // Handle color change in draft
  const handleColorChange = (section, key, newHex) => {
    setDraftTheme(prev => {
      if (!prev || !prev.colors) return prev;
      return {
        ...prev,
        colors: {
          ...prev.colors,
          [section]: {
            ...prev.colors[section],
            [key]: newHex
          }
        }
      };
    });
  };

  // Save Draft (does NOT update active theme or CSS)
  const handleSaveDraft = async () => {
    if (!draftTheme) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/theme/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftTheme)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save draft');

      showToast('Draft theme saved safely to disk without modifying published CSS.');
      // Refresh status
      const statusRes = await fetch('/api/theme/status').then(r => r.json());
      setStatus(statusRes);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Theme
  const handlePublish = async () => {
    if (!draftTheme) return;
    try {
      setIsPublishing(true);
      const res = await fetch('/api/theme/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftTheme)
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.details ? data.details.join('; ') : data.error;
        throw new Error(msg || 'Failed to publish theme');
      }

      showToast(`Theme published successfully! Distributed as version v${data.version}`);
      setActiveTheme(data.theme);
      setDraftTheme(data.theme);
      // Refresh status
      const statusRes = await fetch('/api/theme/status').then(r => r.json());
      setStatus(statusRes);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Reset Draft changes
  const handleResetChanges = () => {
    if (activeTheme) {
      setDraftTheme(JSON.parse(JSON.stringify(activeTheme)));
      showToast('Draft reset to current published theme.');
    }
  };

  // Rollback to previous theme
  const handleRollback = async () => {
    if (!window.confirm('Restore previous published theme version from archive? Connected portals will update automatically.')) {
      return;
    }
    try {
      setIsRollingBack(true);
      const res = await fetch('/api/theme/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rollback');

      showToast(data.message);
      setActiveTheme(data.theme);
      setDraftTheme(data.theme);
      // Refresh status
      const statusRes = await fetch('/api/theme/status').then(r => r.json());
      setStatus(statusRes);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsRollingBack(false);
    }
  };

  // Apply Preset
  const handleSelectPreset = (preset) => {
    setDraftTheme(prev => ({
      ...prev,
      name: `${preset.name} (Draft)`,
      colors: JSON.parse(JSON.stringify(preset.colors))
    }));
    setShowPresets(false);
    showToast(`Loaded preset "${preset.name}" into working draft.`);
  };

  // Create New Theme
  const handleCreateNewTheme = ({ name, description, basePrimary }) => {
    const shades = generateShades(basePrimary) || {};
    const newTheme = {
      id: `theme-${Date.now()}`,
      name,
      description,
      version: '1.0.0',
      colors: {
        brand: {
          primary: basePrimary,
          primaryHover: shades[600] || '#10452E',
          primaryLight: shades[100] || '#E5F2E9',
          secondary: shades[700] || '#287A50',
          accent: '#0E8388'
        },
        backgrounds: {
          background: '#F7F9F7',
          surface: '#FFFFFF',
          sidebar: basePrimary,
          sidebarText: '#FFFFFF',
          sidebarMuted: shades[200] || '#A1CBB7',
          navbar: '#FFFFFF',
          navbarBorder: '#E5EAE6'
        },
        typography: {
          textPrimary: '#252B27',
          textSecondary: '#5B645E',
          textMuted: '#8D9790'
        },
        borders: {
          border: '#E5EAE6',
          borderStrong: '#CBD5CE'
        },
        semantic: {
          success: '#198754',
          warning: '#F0AD4E',
          danger: '#DC3545',
          info: '#0D6EFD'
        }
      }
    };

    setDraftTheme(newTheme);
    showToast(`New theme draft "${name}" created. You can now edit and publish.`);
  };

  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner-forest" />
        <p className="mt-3 font-semibold text-forest-green">Loading Theme Engine...</p>
      </div>
    );
  }

  return (
    <div className="theme-editor-app">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header onOpenDocs={() => setShowDocsModal(true)} />

      {/* Top Overview & Action Control Bar */}
      <ThemeOverview
        status={status}
        isDraftDirty={isDraftDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        isRollingBack={isRollingBack}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onResetChanges={handleResetChanges}
        onRollback={handleRollback}
        onCreateNewTheme={() => setShowCreateModal(true)}
        onTogglePresets={() => setShowPresets(!showPresets)}
        showPresets={showPresets}
      />

      {/* Presets Drawer if toggled */}
      {showPresets && (
        <PresetSelector
          presets={presets}
          currentThemeId={draftTheme?.id}
          onSelectPreset={handleSelectPreset}
          onClose={() => setShowPresets(false)}
        />
      )}

      {/* Two-Column Editor & Live Preview Workspace */}
      <div className="theme-workspace-grid">
        {/* Left Column: Colour Configuration Editor & Automatic Shade Generator */}
        <section className="workspace-column editor-column">
          <div className="column-header">
            <h2 className="column-title">Theme Palette Editor</h2>
            <span className="text-xs text-muted">Instant reactive binding to live ERP preview</span>
          </div>

          <ColorEditor
            theme={draftTheme}
            defaultTheme={activeTheme}
            onChangeColor={handleColorChange}
          />
        </section>

        {/* Right Column: Educational ERP Live Preview */}
        <section className="workspace-column preview-column">
          <LivePreview
            cssVariables={liveCssVariables}
            themeName={draftTheme?.name || 'Current Draft'}
          />
        </section>
      </div>

      {/* Modals */}
      <CreateThemeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateNewTheme}
      />

      <DocsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />
    </div>
  );
}

