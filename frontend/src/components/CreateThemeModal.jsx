import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function CreateThemeModal({ isOpen, onClose, onCreate }) {
  const [themeName, setThemeName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrimary, setBasePrimary] = useState('#145A3A');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!themeName.trim()) return;

    onCreate({
      name: themeName.trim(),
      description: description.trim() || 'Custom institutional theme',
      basePrimary
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-items-center gap-2">
            <Sparkles size={18} className="text-forest-green" />
            <h3 className="modal-title">Create New Theme</h3>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group mb-3">
              <label className="form-label">Theme Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Autumn Crimson, Polytechnic Modern"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief description of the intended campus or portal application"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Base Primary Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={basePrimary}
                  onChange={(e) => setBasePrimary(e.target.value.toUpperCase())}
                  className="native-color-picker-input"
                />
                <input
                  type="text"
                  value={basePrimary}
                  onChange={(e) => setBasePrimary(e.target.value.toUpperCase())}
                  className="form-input font-mono"
                  style={{ width: '120px' }}
                />
                <span className="text-xs text-muted">Theme will automatically generate shades from this base.</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-modal-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-primary" disabled={!themeName.trim()}>
              Create Working Theme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

