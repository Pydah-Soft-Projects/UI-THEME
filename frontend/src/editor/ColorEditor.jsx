import React, { useState } from 'react';
import ColorPickerField from './ColorPickerField';
import ShadeGenerator from './ShadeGenerator';
import { Palette, Layout, Type, Square, AlertCircle } from 'lucide-react';

export default function ColorEditor({
  theme,
  defaultTheme,
  onChangeColor,
  onBatchUpdate
}) {
  const [selectedBaseForShades, setSelectedBaseForShades] = useState({
    hex: theme?.colors?.brand?.primary || '#145A3A',
    label: 'Primary Brand'
  });
  const [activeTab, setActiveTab] = useState('brand');

  const colors = theme?.colors || {};
  const defaultColors = defaultTheme?.colors || {};

  const handleFieldChange = (section, key, newHex) => {
    onChangeColor(section, key, newHex);
    // If updating primary, also update shade generator base if currently pointing to primary
    if (section === 'brand' && key === 'primary' && selectedBaseForShades.label === 'Primary Brand') {
      setSelectedBaseForShades(prev => ({ ...prev, hex: newHex }));
    }
  };

  const tabs = [
    { id: 'brand', label: 'Brand & Accents', icon: Palette, count: 5 },
    { id: 'backgrounds', label: 'Surfaces & Layout', icon: Layout, count: 4 },
    { id: 'typography', label: 'Typography', icon: Type, count: 3 },
    { id: 'borders', label: 'Borders & Outlines', icon: Square, count: 2 },
    { id: 'semantic', label: 'Semantic States', icon: AlertCircle, count: 4 }
  ];

  return (
    <div className="color-editor-container">
      {/* Automatic Shade Generator Displayed Above */}
      <ShadeGenerator
        baseColor={selectedBaseForShades.hex}
        baseLabel={selectedBaseForShades.label}
        onApplyAsPrimary={(hex) => handleFieldChange('brand', 'primary', hex)}
        onApplyAsSecondary={(hex) => handleFieldChange('brand', 'secondary', hex)}
        onApplyAsAccent={(hex) => handleFieldChange('brand', 'accent', hex)}
      />

      {/* Editor Section Navigation Tabs */}
      <div className="editor-nav-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`editor-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span className="tab-badge">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="editor-tab-content">
        {activeTab === 'brand' && (
          <div className="color-fields-grid">
            <ColorPickerField
              label="Primary"
              tokenKey="--primary"
              value={colors.brand?.primary || '#145A3A'}
              defaultValue={defaultColors.brand?.primary}
              onChange={(v) => handleFieldChange('brand', 'primary', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.brand?.primary}
            />
            <ColorPickerField
              label="Primary Hover"
              tokenKey="--primary-hover"
              value={colors.brand?.primaryHover || '#10452E'}
              defaultValue={defaultColors.brand?.primaryHover}
              onChange={(v) => handleFieldChange('brand', 'primaryHover', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.brand?.primaryHover}
            />
            <ColorPickerField
              label="Primary Light"
              tokenKey="--primary-light"
              value={colors.brand?.primaryLight || '#E5F2E9'}
              defaultValue={defaultColors.brand?.primaryLight}
              onChange={(v) => handleFieldChange('brand', 'primaryLight', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.brand?.primaryLight}
            />
            <ColorPickerField
              label="Secondary"
              tokenKey="--secondary"
              value={colors.brand?.secondary || '#287A50'}
              defaultValue={defaultColors.brand?.secondary}
              onChange={(v) => handleFieldChange('brand', 'secondary', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.brand?.secondary}
            />
            <ColorPickerField
              label="Accent"
              tokenKey="--accent"
              value={colors.brand?.accent || '#0E8388'}
              defaultValue={defaultColors.brand?.accent}
              onChange={(v) => handleFieldChange('brand', 'accent', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.brand?.accent}
            />
          </div>
        )}

        {activeTab === 'backgrounds' && (
          <div className="color-fields-grid">
            <ColorPickerField
              label="Application Background"
              tokenKey="--background"
              value={colors.backgrounds?.background || '#F7F9F7'}
              defaultValue={defaultColors.backgrounds?.background}
              onChange={(v) => handleFieldChange('backgrounds', 'background', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.backgrounds?.background}
            />
            <ColorPickerField
              label="Surface"
              tokenKey="--surface"
              value={colors.backgrounds?.surface || '#FFFFFF'}
              defaultValue={defaultColors.backgrounds?.surface}
              onChange={(v) => handleFieldChange('backgrounds', 'surface', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.backgrounds?.surface}
            />
            <ColorPickerField
              label="Sidebar"
              tokenKey="--sidebar"
              value={colors.backgrounds?.sidebar || '#145A3A'}
              defaultValue={defaultColors.backgrounds?.sidebar}
              onChange={(v) => handleFieldChange('backgrounds', 'sidebar', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.backgrounds?.sidebar}
            />
            <ColorPickerField
              label="Navbar"
              tokenKey="--navbar"
              value={colors.backgrounds?.navbar || '#FFFFFF'}
              defaultValue={defaultColors.backgrounds?.navbar}
              onChange={(v) => handleFieldChange('backgrounds', 'navbar', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.backgrounds?.navbar}
            />
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="color-fields-grid">
            <ColorPickerField
              label="Primary Text"
              tokenKey="--text-primary"
              value={colors.typography?.textPrimary || '#252B27'}
              defaultValue={defaultColors.typography?.textPrimary}
              onChange={(v) => handleFieldChange('typography', 'textPrimary', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.typography?.textPrimary}
            />
            <ColorPickerField
              label="Secondary Text"
              tokenKey="--text-secondary"
              value={colors.typography?.textSecondary || '#5B645E'}
              defaultValue={defaultColors.typography?.textSecondary}
              onChange={(v) => handleFieldChange('typography', 'textSecondary', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.typography?.textSecondary}
            />
            <ColorPickerField
              label="Muted Text"
              tokenKey="--text-muted"
              value={colors.typography?.textMuted || '#8D9790'}
              defaultValue={defaultColors.typography?.textMuted}
              onChange={(v) => handleFieldChange('typography', 'textMuted', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.typography?.textMuted}
            />
          </div>
        )}

        {activeTab === 'borders' && (
          <div className="color-fields-grid">
            <ColorPickerField
              label="Default Border"
              tokenKey="--border"
              value={colors.borders?.border || '#E5EAE6'}
              defaultValue={defaultColors.borders?.border}
              onChange={(v) => handleFieldChange('borders', 'border', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.borders?.border}
            />
            <ColorPickerField
              label="Strong Border"
              tokenKey="--border-strong"
              value={colors.borders?.borderStrong || '#CBD5CE'}
              defaultValue={defaultColors.borders?.borderStrong}
              onChange={(v) => handleFieldChange('borders', 'borderStrong', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.borders?.borderStrong}
            />
          </div>
        )}

        {activeTab === 'semantic' && (
          <div className="color-fields-grid">
            <ColorPickerField
              label="Success"
              tokenKey="--success"
              value={colors.semantic?.success || '#198754'}
              defaultValue={defaultColors.semantic?.success}
              onChange={(v) => handleFieldChange('semantic', 'success', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.semantic?.success}
            />
            <ColorPickerField
              label="Warning"
              tokenKey="--warning"
              value={colors.semantic?.warning || '#F0AD4E'}
              defaultValue={defaultColors.semantic?.warning}
              onChange={(v) => handleFieldChange('semantic', 'warning', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.semantic?.warning}
            />
            <ColorPickerField
              label="Danger"
              tokenKey="--danger"
              value={colors.semantic?.danger || '#DC3545'}
              defaultValue={defaultColors.semantic?.danger}
              onChange={(v) => handleFieldChange('semantic', 'danger', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.semantic?.danger}
            />
            <ColorPickerField
              label="Info"
              tokenKey="--info"
              value={colors.semantic?.info || '#0D6EFD'}
              defaultValue={defaultColors.semantic?.info}
              onChange={(v) => handleFieldChange('semantic', 'info', v)}
              onSelectBaseForShades={(hex, label) => setSelectedBaseForShades({ hex, label })}
              isSelectedForShades={selectedBaseForShades.hex === colors.semantic?.info}
            />
          </div>
        )}
      </div>
    </div>
  );
}

