import React, { useState } from 'react';
import { 
  Save, 
  UploadCloud, 
  RotateCcw, 
  History, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Layers
} from 'lucide-react';

export default function ThemeOverview({
  status,
  isDraftDirty,
  isSaving,
  isPublishing,
  isRollingBack,
  onSaveDraft,
  onPublish,
  onResetChanges,
  onRollback,
  onCreateNewTheme,
  onTogglePresets,
  showPresets
}) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);

  const activeVersion = status?.activeVersion || '1.0.0';
  const lastPublished = status?.lastPublished 
    ? new Date(status.lastPublished).toLocaleString()
    : 'Never';
  const historyCount = status?.historyCount || 0;

  return (
    <div className="theme-overview-panel">
      {/* Overview Metadata Bar */}
      <div className="overview-meta-bar">
        <div className="overview-item">
          <span className="overview-label">Active Theme</span>
          <div className="overview-value-wrap">
            <span className="overview-value font-bold">{status?.activeTheme?.name || 'Forest Green Light'}</span>
            <span className="version-pill">v{activeVersion}</span>
          </div>
        </div>

        <div className="overview-item">
          <span className="overview-label">Last Published</span>
          <div className="overview-value-wrap text-muted">
            <Clock size={13} />
            <span className="overview-value text-xs">{lastPublished}</span>
          </div>
        </div>

        <div className="overview-item">
          <span className="overview-label">Working Status</span>
          <div className="overview-value-wrap">
            {isDraftDirty ? (
              <span className="status-badge status-modified">
                <AlertTriangle size={12} /> Unsaved Draft Edits
              </span>
            ) : (
              <span className="status-badge status-synced">
                <CheckCircle2 size={12} /> Active & Draft In Sync
              </span>
            )}
          </div>
        </div>

        <div className="overview-item">
          <span className="overview-label">Snapshots Available</span>
          <div className="overview-value-wrap">
            <span className="overview-value text-xs">{historyCount} backup versions</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="overview-actions-bar">
        <div className="actions-left">
          <button
            type="button"
            className="btn-overview btn-secondary"
            onClick={onCreateNewTheme}
          >
            <PlusCircle size={15} />
            <span>Create Theme</span>
          </button>

          <button
            type="button"
            className={`btn-overview btn-secondary ${showPresets ? 'active' : ''}`}
            onClick={onTogglePresets}
          >
            <Layers size={15} />
            <span>Presets</span>
          </button>

          {historyCount > 0 && (
            <button
              type="button"
              className="btn-overview btn-secondary text-warning"
              onClick={onRollback}
              disabled={isRollingBack}
              title="Restore previous published theme from archive"
            >
              <History size={15} />
              <span>{isRollingBack ? 'Restoring...' : 'Rollback'}</span>
            </button>
          )}

          {isDraftDirty && (
            <button
              type="button"
              className="btn-overview btn-secondary text-danger"
              onClick={() => {
                if (window.confirm('Reset all draft changes to the currently published active theme?')) {
                  onResetChanges();
                }
              }}
              title="Discard draft changes and revert to active theme"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="actions-right">
          <button
            type="button"
            className="btn-overview btn-save-draft"
            onClick={onSaveDraft}
            disabled={isSaving}
            title="Save draft to disk without updating active theme or CSS"
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            className="btn-overview btn-publish"
            onClick={onPublish}
            disabled={isPublishing}
            title="Publish theme, bump version, and distribute CSS to connected portals"
          >
            <UploadCloud size={16} />
            <span>{isPublishing ? 'Publishing...' : 'Publish Theme'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

