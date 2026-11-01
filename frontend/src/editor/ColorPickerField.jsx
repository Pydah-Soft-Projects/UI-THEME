import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { isValidHex, formatRgbString, formatHslString } from '../utils/colorUtils';

export default function ColorPickerField({
  label,
  tokenKey,
  value,
  defaultValue,
  onChange,
  onSelectBaseForShades,
  isSelectedForShades
}) {
  const [inputValue, setInputValue] = useState(value);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleTextChange = (e) => {
    const raw = e.target.value;
    setInputValue(raw);
    if (isValidHex(raw)) {
      onChange(raw);
    }
  };

  const handleColorChange = (e) => {
    const val = e.target.value.toUpperCase();
    setInputValue(val);
    onChange(val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    if (defaultValue) {
      setInputValue(defaultValue);
      onChange(defaultValue);
    }
  };

  const isInvalid = !isValidHex(inputValue);
  const isChangedFromDefault = defaultValue && defaultValue.toUpperCase() !== value.toUpperCase();

  return (
    <div className={`color-field-card ${isSelectedForShades ? 'selected-for-shades' : ''}`}>
      <div className="color-field-header">
        <div className="color-field-title-wrap">
          <label className="color-field-label">{label}</label>
          <span className="color-token-code">{tokenKey}</span>
        </div>

        <div className="color-field-actions">
          {onSelectBaseForShades && (
            <button
              type="button"
              className={`btn-action-pill ${isSelectedForShades ? 'active' : ''}`}
              title="Generate 10 shades from this color"
              onClick={() => onSelectBaseForShades(value, label)}
            >
              Shades
            </button>
          )}

          {isChangedFromDefault && (
            <button
              type="button"
              className="btn-icon"
              title={`Reset to default (${defaultValue})`}
              onClick={handleReset}
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="color-field-body">
        {/* Visual Swatch & Native Picker Input */}
        <div className="color-swatch-wrapper">
          <input
            type="color"
            value={isValidHex(value) ? value.slice(0, 7) : '#000000'}
            onChange={handleColorChange}
            className="native-color-input"
            aria-label={`Color picker for ${label}`}
          />
          <div
            className="color-swatch-display"
            style={{ backgroundColor: isValidHex(value) ? value : '#ccc' }}
          />
        </div>

        {/* HEX Input */}
        <div className="color-hex-input-wrap">
          <span className="hex-prefix">#</span>
          <input
            type="text"
            value={inputValue.replace('#', '')}
            onChange={(e) => handleTextChange({ target: { value: '#' + e.target.value } })}
            maxLength={8}
            className={`hex-text-input ${isInvalid ? 'input-error' : ''}`}
            placeholder="145A3A"
          />
          <button
            type="button"
            className="btn-copy-hex"
            title="Copy HEX to clipboard"
            onClick={handleCopy}
          >
            {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Color Formats Display: RGB & HSL */}
      <div className="color-specs-row">
        <div className="spec-item" title="RGB Channels">
          <span className="spec-label">RGB</span>
          <span className="spec-value">{formatRgbString(value)}</span>
        </div>
        <div className="spec-item" title="HSL Values">
          <span className="spec-label">HSL</span>
          <span className="spec-value">{formatHslString(value)}</span>
        </div>
      </div>
    </div>
  );
}

