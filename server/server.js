/**
 * Centralized Theme Server
 * Lightweight Node.js server for Theme API, Draft Management,
 * Publishing Engine & Static Theme Asset Distribution.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { generateCSSFromTheme, buildCSS } = require('../scripts/generate-css');

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Cache-Control', 'Pragma']
}));
app.use(express.json({ limit: '2mb' }));

// Directories
// Application directory (managed by GitHub - code & templates)
const ROOT_DIR = path.join(__dirname, '..');
const APP_THEMES_DIR = path.join(ROOT_DIR, 'themes');
const PRESETS_DIR = path.join(APP_THEMES_DIR, 'presets');
const APP_PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Runtime data directory (managed by Theme Editor - persistent state)
// Configurable via THEME_DATA_DIR (e.g. /var/lib/ui-theme on production)
const DATA_DIR = process.env.THEME_DATA_DIR
  ? path.resolve(process.env.THEME_DATA_DIR)
  : ROOT_DIR;

const THEMES_DIR = process.env.THEME_DATA_DIR ? path.join(DATA_DIR, 'themes') : path.join(ROOT_DIR, 'themes');
const HISTORY_DIR = path.join(THEMES_DIR, 'history');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const PUBLIC_DIR = process.env.THEME_DATA_DIR ? path.join(DATA_DIR, 'public') : path.join(ROOT_DIR, 'public');
const PUBLIC_THEMES_DIR = path.join(PUBLIC_DIR, 'themes');

// Helper functions for reading & atomic writing
const ACTIVE_FILE = path.join(THEMES_DIR, 'active-theme.json');
const DRAFT_FILE = path.join(THEMES_DIR, 'draft-theme.json');
const VERSION_FILE = path.join(PUBLIC_THEMES_DIR, 'version.json');
const VERSION_FILE_ROOT = path.join(PUBLIC_DIR, 'version.json');
const CSS_FILE = path.join(PUBLIC_THEMES_DIR, 'theme.css');

function readJsonFile(filePath, fallback = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
  }
  return fallback;
}

/**
 * Atomic file writer using write-then-rename to ensure zero partial reads by clients
 */
function writeJsonFile(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(7)}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

// Initialise and seed runtime data directory if needed
function initializeDataDirectory() {
  [THEMES_DIR, HISTORY_DIR, BACKUPS_DIR, PUBLIC_DIR, PUBLIC_THEMES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Seed active-theme.json from app template if not present in runtime data dir
  if (!fs.existsSync(ACTIVE_FILE)) {
    const seedActive = path.join(APP_THEMES_DIR, 'active-theme.json');
    if (fs.existsSync(seedActive)) {
      console.log(`[Theme Server] Seeding active-theme.json into runtime data directory...`);
      fs.copyFileSync(seedActive, ACTIVE_FILE);
    }
  }

  // Seed draft-theme.json
  if (!fs.existsSync(DRAFT_FILE)) {
    const seedDraft = path.join(APP_THEMES_DIR, 'draft-theme.json');
    if (fs.existsSync(seedDraft)) {
      fs.copyFileSync(seedDraft, DRAFT_FILE);
    } else if (fs.existsSync(ACTIVE_FILE)) {
      fs.copyFileSync(ACTIVE_FILE, DRAFT_FILE);
    }
  }

  // Copy theme-loader.js SDK into runtime public directory
  const seedLoader = path.join(APP_PUBLIC_DIR, 'theme-loader.js');
  const targetLoader = path.join(PUBLIC_DIR, 'theme-loader.js');
  const targetThemesLoader = path.join(PUBLIC_THEMES_DIR, 'theme-loader.js');
  if (fs.existsSync(seedLoader)) {
    try {
      if (!fs.existsSync(targetLoader) || fs.statSync(seedLoader).mtimeMs > (fs.statSync(targetLoader).mtimeMs || 0)) {
        fs.copyFileSync(seedLoader, targetLoader);
      }
      if (!fs.existsSync(targetThemesLoader) || fs.statSync(seedLoader).mtimeMs > (fs.statSync(targetThemesLoader).mtimeMs || 0)) {
        fs.copyFileSync(seedLoader, targetThemesLoader);
      }
    } catch (e) {
      console.warn(`[Theme Server] Warning copying theme-loader.js:`, e.message);
    }
  }

  // Generate initial CSS if missing
  if (!fs.existsSync(CSS_FILE) && fs.existsSync(ACTIVE_FILE)) {
    try {
      console.log(`[Theme Server] Compiling initial CSS in runtime public directory...`);
      buildCSS(ACTIVE_FILE, CSS_FILE);
    } catch (e) {
      console.warn(`[Theme Server] Warning generating initial CSS:`, e.message);
    }
  }
}

initializeDataDirectory();

function incrementSemver(ver) {
  if (!ver || typeof ver !== 'string') return '1.0.1';
  const parts = ver.split('.').map(p => parseInt(p, 10));
  if (parts.length === 3 && !parts.some(isNaN)) {
    parts[2] += 1;
    return parts.join('.');
  }
  return `${ver}.1`;
}

function validateColorHex(hex) {
  if (!hex || typeof hex !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex.trim());
}

function validateThemeColors(colors) {
  const errors = [];
  if (!colors || typeof colors !== 'object') {
    return ['Invalid colors payload: expected object'];
  }

  const sections = ['brand', 'backgrounds', 'typography', 'borders', 'semantic'];
  for (const sec of sections) {
    if (!colors[sec] || typeof colors[sec] !== 'object') {
      errors.push(`Missing color group: "${sec}"`);
      continue;
    }
    for (const [key, value] of Object.entries(colors[sec])) {
      if (!validateColorHex(value)) {
        errors.push(`Invalid HEX color for ${sec}.${key}: "${value}"`);
      }
    }
  }

  return errors;
}

// ================================================================
// Theme API Endpoints
// ================================================================

/**
 * GET /api/theme/status
 * Returns current active theme info, draft info, version, and sync status
 */
app.get('/api/theme/status', (req, res) => {
  const active = readJsonFile(ACTIVE_FILE);
  const draft = readJsonFile(DRAFT_FILE, active);
  const versionData = readJsonFile(VERSION_FILE, { version: active.version || '1.0.0' });

  // Calculate if draft has changes compared to active
  const activeStr = JSON.stringify(active.colors || {});
  const draftStr = JSON.stringify(draft.colors || {});
  const hasUnsavedChanges = activeStr !== draftStr;

  // Count available backups in history
  let historyCount = 0;
  if (fs.existsSync(HISTORY_DIR)) {
    historyCount = fs.readdirSync(HISTORY_DIR).filter(f => f.endsWith('.json')).length;
  }

  res.json({
    activeVersion: versionData.version || active.version || '1.0.0',
    lastPublished: versionData.lastPublished || active.lastPublished || null,
    activeTheme: {
      id: active.id || 'active-theme',
      name: active.name || 'Forest Green Light',
      description: active.description
    },
    draftTheme: {
      id: draft.id || 'draft-theme',
      name: draft.name || 'Working Draft'
    },
    hasUnsavedChanges,
    historyCount,
    serverTime: new Date().toISOString()
  });
});

/**
 * GET /api/theme/active
 * Returns current published active theme JSON
 */
app.get('/api/theme/active', (req, res) => {
  const active = readJsonFile(ACTIVE_FILE);
  res.json(active);
});

/**
 * GET /api/theme/draft
 * Returns current draft theme JSON
 */
app.get('/api/theme/draft', (req, res) => {
  const draft = readJsonFile(DRAFT_FILE);
  res.json(draft);
});

/**
 * POST /api/theme/draft
 * Saves changes to draft-theme.json WITHOUT modifying active theme or published CSS
 */
app.post('/api/theme/draft', (req, res) => {
  try {
    const draftData = req.body;
    if (!draftData || !draftData.colors) {
      return res.status(400).json({ error: 'Invalid draft payload: colors object required' });
    }

    const currentDraft = readJsonFile(DRAFT_FILE);
    const updated = {
      ...currentDraft,
      ...draftData,
      id: 'draft-theme',
      updatedAt: new Date().toISOString()
    };

    writeJsonFile(DRAFT_FILE, updated);
    console.log('[Theme Server] Draft theme updated successfully.');
    res.json({
      success: true,
      message: 'Draft saved successfully without affecting published portals',
      draft: updated
    });
  } catch (err) {
    console.error('Error saving draft:', err);
    res.status(500).json({ error: 'Failed to save draft theme' });
  }
});

/**
 * POST /api/theme/publish
 * Validates colors, archives previous active theme, updates active-theme.json,
 * increments version, compiles CSS, and updates version.json.
 */
app.post('/api/theme/publish', (req, res) => {
  try {
    const payload = req.body || {};
    const sourceTheme = payload.colors ? payload : readJsonFile(DRAFT_FILE);

    // 1. Validation
    const validationErrors = validateThemeColors(sourceTheme.colors);
    if (validationErrors.length > 0) {
      return res.status(422).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // 2. Read current active for archiving
    const currentActive = readJsonFile(ACTIVE_FILE);
    const currentVersion = currentActive.version || '1.0.0';

    // 3. Backup previous version to history
    if (currentActive && currentActive.colors) {
      const timestamp = Date.now();
      const backupFilename = `active-theme-v${currentVersion}-${timestamp}.json`;
      writeJsonFile(path.join(HISTORY_DIR, backupFilename), currentActive);
    }

    // 4. Increment version
    const nextVersion = payload.customVersion || incrementSemver(currentVersion);
    const publishedAt = new Date().toISOString();

    const newActiveTheme = {
      ...sourceTheme,
      id: 'active-theme',
      name: payload.name || sourceTheme.name || 'Active Theme',
      version: nextVersion,
      lastPublished: publishedAt
    };

    // 5. Save active-theme.json
    writeJsonFile(ACTIVE_FILE, newActiveTheme);

    // 6. Also update draft-theme.json to stay in sync
    writeJsonFile(DRAFT_FILE, {
      ...newActiveTheme,
      id: 'draft-theme'
    });

    // 7. Compile CSS to public/themes/theme.css
    buildCSS(ACTIVE_FILE, CSS_FILE);

    // 8. Update version.json
    const versionPayload = {
      version: nextVersion,
      themeId: newActiveTheme.id,
      themeName: newActiveTheme.name,
      lastPublished: publishedAt,
      timestamp: Date.now()
    };
    writeJsonFile(VERSION_FILE, versionPayload);
    writeJsonFile(VERSION_FILE_ROOT, versionPayload);

    console.log(`[Theme Server] Theme published successfully! Version bumped to v${nextVersion}`);

    res.json({
      success: true,
      message: `Theme published successfully as version v${nextVersion}`,
      version: nextVersion,
      lastPublished: publishedAt,
      theme: newActiveTheme
    });
  } catch (err) {
    console.error('Error publishing theme:', err);
    res.status(500).json({ error: 'Failed to publish theme: ' + err.message });
  }
});

/**
 * POST /api/theme/rollback
 * Restores the previous published theme from history
 */
app.post('/api/theme/rollback', (req, res) => {
  try {
    if (!fs.existsSync(HISTORY_DIR)) {
      return res.status(404).json({ error: 'No history archives found' });
    }

    const historyFiles = fs.readdirSync(HISTORY_DIR)
      .filter(f => f.startsWith('active-theme-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (historyFiles.length === 0) {
      return res.status(404).json({ error: 'No previous theme versions available for rollback' });
    }

    const latestBackupFile = historyFiles[0];
    const restoredTheme = readJsonFile(path.join(HISTORY_DIR, latestBackupFile));

    // Archive current active before restoring
    const currentActive = readJsonFile(ACTIVE_FILE);
    if (currentActive && currentActive.colors) {
      const timestamp = Date.now();
      writeJsonFile(path.join(HISTORY_DIR, `pre-rollback-v${currentActive.version}-${timestamp}.json`), currentActive);
    }

    // Increment version upon restore so connected portals reload immediately
    const nextVersion = incrementSemver(currentActive.version || '1.0.0');
    const publishedAt = new Date().toISOString();

    restoredTheme.version = nextVersion;
    restoredTheme.lastPublished = publishedAt;

    writeJsonFile(ACTIVE_FILE, restoredTheme);
    writeJsonFile(DRAFT_FILE, restoredTheme);

    buildCSS(ACTIVE_FILE, CSS_FILE);

    const versionPayload = {
      version: nextVersion,
      themeId: restoredTheme.id,
      themeName: restoredTheme.name,
      lastPublished: publishedAt,
      timestamp: Date.now(),
      rollbackSource: latestBackupFile
    };
    writeJsonFile(VERSION_FILE, versionPayload);
    writeJsonFile(VERSION_FILE_ROOT, versionPayload);

    // Remove the consumed backup file
    try {
      fs.unlinkSync(path.join(HISTORY_DIR, latestBackupFile));
    } catch (e) {}

    console.log(`[Theme Server] Rolled back to ${latestBackupFile}, new active version is v${nextVersion}`);

    res.json({
      success: true,
      message: `Theme rolled back successfully. Active version is now v${nextVersion}`,
      version: nextVersion,
      theme: restoredTheme
    });
  } catch (err) {
    console.error('Error rolling back theme:', err);
    res.status(500).json({ error: 'Failed to rollback theme: ' + err.message });
  }
});

/**
 * GET /api/theme/presets
 * Returns list of available theme presets
 */
app.get('/api/theme/presets', (req, res) => {
  try {
    const presets = [];
    if (fs.existsSync(PRESETS_DIR)) {
      const files = fs.readdirSync(PRESETS_DIR).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const data = readJsonFile(path.join(PRESETS_DIR, file));
        if (data && data.id) {
          presets.push(data);
        }
      }
    }
    res.json(presets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load presets' });
  }
});

// ================================================================
// Distribution & Static Asset Serving
// ================================================================

// Explicit endpoint for version.json to guarantee strict no-cache headers
app.get(['/themes/version.json', '/version.json'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const versionData = readJsonFile(VERSION_FILE, { version: '1.0.0', timestamp: Date.now() });
  res.json(versionData);
});

// Explicit endpoint for theme.css
app.get(['/themes/theme.css', '/theme.css'], (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/css');

  // If request contains ?v=... parameter, enable caching; otherwise revalidate
  if (req.query.v) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  }

  if (fs.existsSync(CSS_FILE)) {
    res.sendFile(CSS_FILE);
  } else {
    // Generate if missing
    try {
      const css = buildCSS(ACTIVE_FILE, CSS_FILE);
      res.send(css);
    } catch (e) {
      res.status(500).send('/* Error generating theme CSS */');
    }
  }
});

// Explicit endpoint for theme-loader.js
app.get(['/themes/theme-loader.js', '/theme-loader.js'], (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache');
  const loaderFile = path.join(PUBLIC_THEMES_DIR, 'theme-loader.js');
  res.sendFile(loaderFile);
});

// Serve everything else from public folder statically
app.use(express.static(PUBLIC_DIR));
if (PUBLIC_DIR !== APP_PUBLIC_DIR) {
  app.use(express.static(APP_PUBLIC_DIR));
}

// Process crash resilience guards
process.on('uncaughtException', (err) => {
  console.error('[Theme Server UncaughtException]:', err.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Theme Server UnhandledRejection]:', reason);
});

// Start server function
function startServer(port = PORT) {
  const srv = app.listen(port, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`Centralized Theme Server is running on port ${port}`);
    console.log(`Runtime Data Directory: ${DATA_DIR}`);
    console.log(`Theme CSS Distribution: http://localhost:${port}/themes/theme.css`);
    console.log(`Version Endpoint:       http://localhost:${port}/themes/version.json`);
    console.log(`Theme Loader Script:    http://localhost:${port}/themes/theme-loader.js`);
    console.log(`Theme API Status:       http://localhost:${port}/api/theme/status`);
    console.log(`====================================================`);
  });

  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Theme Server Error] Port ${port} is already in use. Please free port ${port} or specify PORT=<number>.`);
    } else {
      console.error(`[Theme Server Error]:`, err.message);
    }
  });

  return srv;
}

let server = null;
if (require.main === module) {
  server = startServer();
}

module.exports = { app, startServer, server };

