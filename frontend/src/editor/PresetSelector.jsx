import React, { useState, useMemo } from 'react';
import { Check, Sparkles, Search, Sun, Moon } from 'lucide-react';

export default function PresetSelector({
  presets = [],
  currentThemeId,
  onSelectPreset,
  onClose
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'light' | 'dark'

  const filteredPresets = useMemo(() => {
    return presets.filter(preset => {
      const isDark = preset.id.includes('dark') || preset.name.toLowerCase().includes('dark');
      if (filterMode === 'light' && isDark) return false;
      if (filterMode === 'dark' && !isDark) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          preset.name.toLowerCase().includes(query) ||
          (preset.description && preset.description.toLowerCase().includes(query)) ||
          preset.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [presets, filterMode, searchTerm]);

  return (
    <div className="preset-selector-container">
      <div className="preset-header">
        <div>
          <div className="flex-items-center gap-2">
            <Sparkles size={16} className="text-forest-green" />
            <h3 className="font-semibold text-sm">Theme Presets Library ({presets.length} Available)</h3>
          </div>
          <span className="text-xs text-muted">
            Select any preset to immediately load its complete palette into your working draft.
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="preset-controls-bar">
          <div className="preset-search-wrap">
            <Search size={13} className="text-muted" />
            <input
              type="text"
              placeholder="Search presets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="preset-search-input"
            />
          </div>

          <div className="preset-filter-pills">
            <button
              type="button"
              className={`preset-pill ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All ({presets.length})
            </button>
            <button
              type="button"
              className={`preset-pill ${filterMode === 'light' ? 'active' : ''}`}
              onClick={() => setFilterMode('light')}
            >
              <Sun size={11} /> Light
            </button>
            <button
              type="button"
              className={`preset-pill ${filterMode === 'dark' ? 'active' : ''}`}
              onClick={() => setFilterMode('dark')}
            >
              <Moon size={11} /> Dark
            </button>
          </div>
        </div>
      </div>

      <div className="preset-grid">
        {filteredPresets.map((preset) => {
          const isSelected = currentThemeId === preset.id;
          const brand = preset.colors?.brand?.primary || '#145A3A';
          const secondary = preset.colors?.brand?.secondary || '#287A50';
          const bg = preset.colors?.backgrounds?.background || '#F7F9F7';
          const surface = preset.colors?.backgrounds?.surface || '#FFFFFF';
          const accent = preset.colors?.brand?.accent || '#0E8388';
          const text = preset.colors?.typography?.textPrimary || '#252B27';
          const isDark = preset.id.includes('dark');

          return (
            <div
              key={preset.id}
              className={`preset-card ${isSelected ? 'active-preset' : ''}`}
              onClick={() => onSelectPreset(preset)}
            >
              <div className="preset-card-header">
                <div className="flex-items-center gap-2">
                  <span
                    className="preset-primary-dot"
                    style={{ backgroundColor: brand }}
                  />
                  <span className="preset-name">{preset.name}</span>
                </div>
                {isSelected ? (
                  <span className="preset-badge"><Check size={11} /> Active Draft</span>
                ) : (
                  <span className="preset-type-chip">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                )}
              </div>

              <p className="preset-desc">{preset.description}</p>

              {/* Color swatches preview bar */}
              <div className="preset-palette-row">
                <div className="palette-pill" style={{ backgroundColor: brand }} title={`Primary: ${brand}`} />
                <div className="palette-pill" style={{ backgroundColor: secondary }} title={`Secondary: ${secondary}`} />
                <div className="palette-pill" style={{ backgroundColor: accent }} title={`Accent: ${accent}`} />
                <div className="palette-pill" style={{ backgroundColor: bg }} title={`Background: ${bg}`} />
                <div className="palette-pill" style={{ backgroundColor: surface }} title={`Surface: ${surface}`} />
                <div className="palette-pill" style={{ backgroundColor: text }} title={`Text: ${text}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
