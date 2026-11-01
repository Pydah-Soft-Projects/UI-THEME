import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { generateShades, getContrastColor } from '../utils/colorUtils';

export default function ShadeGenerator({
  baseColor,
  baseLabel = 'Selected Base',
  onApplyAsPrimary,
  onApplyAsSecondary,
  onApplyAsAccent
}) {
  const [copiedWeight, setCopiedWeight] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState('500');

  const shades = generateShades(baseColor);

  if (!shades) {
    return (
      <div className="shade-generator-card empty">
        <p>Invalid color selected for shade generation.</p>
      </div>
    );
  }

  const handleCopy = (weight, hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedWeight(weight);
    setTimeout(() => setCopiedWeight(null), 1500);
  };

  const selectedHex = shades[selectedWeight] || baseColor;

  return (
    <div className="shade-generator-card">
      <div className="shade-header">
        <div className="shade-title-wrap">
          <div className="flex-items-center gap-2">
            <Sparkles size={16} className="text-forest-green" />
            <h3 className="shade-title">Automatic Shade Generator (50 – 900)</h3>
          </div>
          <p className="shade-subtitle">
            Derived from <span className="font-semibold">{baseLabel}</span> (<code>{baseColor}</code>) using perceptual HSL lightness scaling.
          </p>
        </div>

        {/* Action buttons for selected shade */}
        <div className="shade-assign-actions">
          <span className="text-xs text-muted">Use Shade {selectedWeight} ({selectedHex}):</span>
          <button
            type="button"
            className="btn-shade-apply"
            onClick={() => onApplyAsPrimary(selectedHex)}
          >
            Apply as Primary
          </button>
          <button
            type="button"
            className="btn-shade-apply"
            onClick={() => onApplyAsSecondary(selectedHex)}
          >
            Apply as Secondary
          </button>
          <button
            type="button"
            className="btn-shade-apply"
            onClick={() => onApplyAsAccent(selectedHex)}
          >
            Apply as Accent
          </button>
        </div>
      </div>

      {/* 10 Swatches Grid */}
      <div className="shade-swatches-grid">
        {Object.entries(shades).map(([weight, hex]) => {
          const isSelected = selectedWeight === weight;
          const isCopied = copiedWeight === weight;
          const textColor = getContrastColor(hex);

          return (
            <div
              key={weight}
              className={`shade-swatch-item ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelectedWeight(weight)}
            >
              <div
                className="shade-swatch-color"
                style={{ backgroundColor: hex, color: textColor }}
              >
                <span className="shade-weight-badge">{weight}</span>
                <button
                  type="button"
                  className="shade-copy-btn"
                  title={`Copy ${hex}`}
                  style={{ color: textColor }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(weight, hex);
                  }}
                >
                  {isCopied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>

              <div className="shade-swatch-meta">
                <span className="shade-hex-code">{hex}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

