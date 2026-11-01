/**
 * Precision Color Math & Shade Generation Utilities
 */

export function isValidHex(hex) {
  if (!hex || typeof hex !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex.trim());
}

export function hexToRgb(hex) {
  if (!isValidHex(hex)) {
    return { r: 0, g: 0, b: 0 };
  }
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex.slice(0, 6), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = v => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

export function formatRgbString(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatHslString(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Calculates WCAG relative luminance
 */
export function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Returns accessible text color (White or Dark) based on background luminance
 */
export function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lum = getLuminance(r, g, b);
  return lum > 0.35 ? '#1E293B' : '#FFFFFF';
}

/**
 * Generates 10 perceptually calibrated shades (50, 100, 200, 300, 400, 500, 600, 700, 800, 900)
 */
export function generateShades(baseHex) {
  if (!isValidHex(baseHex)) {
    return null;
  }
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const lightnessMap = {
    50: 96,
    100: 91,
    200: 82,
    300: 71,
    400: 59,
    500: Math.max(26, Math.min(50, hsl.l)),
    600: 41,
    700: 31,
    800: 21,
    900: 13
  };

  const shades = {};
  for (const [weight, targetL] of Object.entries(lightnessMap)) {
    let sat = hsl.s;
    if (weight === '50') sat = Math.max(16, sat * 0.45);
    else if (weight === '100') sat = Math.max(22, sat * 0.65);
    else if (weight === '200') sat = Math.max(28, sat * 0.85);
    else if (weight === '900') sat = Math.min(95, sat * 0.95);

    const shadeRgb = hslToRgb(hsl.h, sat, targetL);
    shades[weight] = rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);
  }

  return shades;
}

/**
 * Converts theme colors object into CSS variables object for dynamic styling
 */
export function generateCssVariablesMap(colors) {
  if (!colors || !colors.brand) return {};

  const pRgb = hexToRgb(colors.brand.primary);
  const sRgb = hexToRgb(colors.brand.secondary);
  const pShades = generateShades(colors.brand.primary) || {};
  const sShades = generateShades(colors.brand.secondary) || {};

  return {
    '--primary': colors.brand.primary,
    '--primary-hover': colors.brand.primaryHover,
    '--primary-light': colors.brand.primaryLight,
    '--primary-rgb': `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`,
    '--secondary': colors.brand.secondary,
    '--secondary-rgb': `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`,
    '--accent': colors.brand.accent || '#0E8388',

    '--primary-50': pShades[50] || '#f0fdf4',
    '--primary-100': pShades[100] || '#dcfce7',
    '--primary-200': pShades[200] || '#bbf7d0',
    '--primary-300': pShades[300] || '#86efac',
    '--primary-400': pShades[400] || '#4ade80',
    '--primary-500': pShades[500] || colors.brand.primary,
    '--primary-600': pShades[600] || colors.brand.primaryHover,
    '--primary-700': pShades[700] || '#15803d',
    '--primary-800': pShades[800] || '#166534',
    '--primary-900': pShades[900] || '#14532d',

    '--background': colors.backgrounds.background,
    '--surface': colors.backgrounds.surface,
    '--sidebar': colors.backgrounds.sidebar,
    '--sidebar-text': colors.backgrounds.sidebarText || '#FFFFFF',
    '--sidebar-muted': colors.backgrounds.sidebarMuted || '#A1CBB7',
    '--navbar': colors.backgrounds.navbar,
    '--navbar-border': colors.backgrounds.navbarBorder || colors.borders.border,

    '--text-primary': colors.typography.textPrimary,
    '--text-secondary': colors.typography.textSecondary,
    '--text-muted': colors.typography.textMuted,

    '--border': colors.borders.border,
    '--border-strong': colors.borders.borderStrong,

    '--success': colors.semantic.success,
    '--warning': colors.semantic.warning,
    '--danger': colors.semantic.danger,
    '--info': colors.semantic.info,
    '--success-light': `${colors.semantic.success}1A`,
    '--warning-light': `${colors.semantic.warning}1A`,
    '--danger-light': `${colors.semantic.danger}1A`,
    '--info-light': `${colors.semantic.info}1A`
  };
}

