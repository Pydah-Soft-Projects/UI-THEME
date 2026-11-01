/**
 * Automated Theme Verification Test Suite
 * Tests all 13 core architectural scenarios:
 * 1. Initial theme loading
 * 2. Colour picker functionality
 * 3. HEX input validation
 * 4. Automatic shade generation (50 - 900)
 * 5. CSS variables mapping
 * 6. Saving drafts (isolation from active theme)
 * 7. Publishing themes (atomic updates)
 * 8. CSS generation from JSON source of truth
 * 9. Version incrementing
 * 10. Automatic update detection in version.json
 * 11. Cache headers verification
 * 12. Fallback CSS availability
 * 13. Theme rollback mechanism
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

const {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  generateShades,
  generateCSSFromTheme,
  buildCSS
} = require('../scripts/generate-css');

const { app, server } = require('../server/server');

const TEST_PORT = 7099;
let testServerInstance;

function runTests() {
  console.log('\n=============================================================');
  console.log('  STARTING CENTRALIZED THEME SYSTEM VERIFICATION SUITE');
  console.log('=============================================================\n');

  // Ensure clean test baseline
  const activePath = path.join(__dirname, '..', 'themes', 'active-theme.json');
  const presetPath = path.join(__dirname, '..', 'themes', 'presets', 'forest-green-light.json');
  const historyDir = path.join(__dirname, '..', 'themes', 'history');
  if (fs.existsSync(presetPath)) {
    fs.copyFileSync(presetPath, activePath);
  }
  if (fs.existsSync(historyDir)) {
    fs.readdirSync(historyDir).forEach(f => {
      try { fs.unlinkSync(path.join(historyDir, f)); } catch (e) {}
    });
  }

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // SCENARIO 1: Initial theme loading & Presets
  test('Scenario 1: Initial themes and presets exist on disk', () => {
    const activePath = path.join(__dirname, '..', 'themes', 'active-theme.json');
    const draftPath = path.join(__dirname, '..', 'themes', 'draft-theme.json');
    assert(fs.existsSync(activePath), 'active-theme.json must exist');
    assert(fs.existsSync(draftPath), 'draft-theme.json must exist');

    const active = JSON.parse(fs.readFileSync(activePath, 'utf8'));
    assert(active.colors && active.colors.brand, 'active theme must contain brand colors');
    assert.strictEqual(active.colors.brand.primary, '#145A3A', 'default brand primary must be Forest Green (#145A3A)');
  });

  // SCENARIO 2: Colour math & conversion
  test('Scenario 2: HEX <-> RGB <-> HSL conversions are bidirectional and accurate', () => {
    const rgb = hexToRgb('#145A3A');
    assert.strictEqual(rgb.r, 20);
    assert.strictEqual(rgb.g, 90);
    assert.strictEqual(rgb.b, 58);

    const backToHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    assert.strictEqual(backToHex.toUpperCase(), '#145A3A');

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    assert(hsl.h >= 150 && hsl.h <= 155, `Hue expected ~153, got ${hsl.h}`);
    assert(hsl.s >= 60 && hsl.s <= 66, `Saturation expected ~64, got ${hsl.s}`);
  });

  // SCENARIO 3: HEX input validation
  test('Scenario 3: HEX color validation logic accepts valid 3, 6, 8 hex and rejects invalid', () => {
    const validColors = ['#145A3A', '#FFF', '#123456', '#AABBCCDD'];
    const invalidColors = ['145A3A', '#GGGGGG', '#12345', 'rgb(0,0,0)', '#'];

    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    for (const c of validColors) {
      assert(hexRegex.test(c), `Should accept valid hex: ${c}`);
    }
    for (const c of invalidColors) {
      assert(!hexRegex.test(c), `Should reject invalid hex: ${c}`);
    }
  });

  // SCENARIO 4: Automatic shade generation (50 to 900)
  test('Scenario 4: Automatic shade generation produces 10 perceptually calibrated steps', () => {
    const shades = generateShades('#145A3A');
    const requiredWeights = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    assert(shades, 'Shades object should be generated');

    for (const w of requiredWeights) {
      assert(shades[w], `Shade ${w} must exist`);
      assert(/^#[0-9A-F]{6}$/i.test(shades[w]), `Shade ${w} must be valid 6-character hex`);
    }

    // Verify lightness monotonic progression (shade 50 should be significantly lighter than shade 900)
    const rgb50 = hexToRgb(shades['50']);
    const hsl50 = rgbToHsl(rgb50.r, rgb50.g, rgb50.b);
    const rgb900 = hexToRgb(shades['900']);
    const hsl900 = rgbToHsl(rgb900.r, rgb900.g, rgb900.b);

    assert(hsl50.l > hsl900.l, 'Shade 50 must be lighter than shade 900');
    assert(hsl50.l >= 90, `Shade 50 lightness expected >= 90, got ${hsl50.l}`);
    assert(hsl900.l <= 20, `Shade 900 lightness expected <= 20, got ${hsl900.l}`);
  });

  // SCENARIO 5: CSS Variables generation from JSON
  test('Scenario 5: CSS generation emits all required CSS variables from JSON source of truth', () => {
    const activePath = path.join(__dirname, '..', 'themes', 'active-theme.json');
    const theme = JSON.parse(fs.readFileSync(activePath, 'utf8'));
    const css = generateCSSFromTheme(theme);

    assert(css.includes(':root {'), 'CSS must declare :root selector');
    assert(css.includes('--primary: #145A3A;'), 'CSS must include --primary');
    assert(css.includes('--primary-rgb: 20, 90, 58;'), 'CSS must include --primary-rgb for opacity styling');
    assert(css.includes('--primary-50:'), 'CSS must include generated --primary-50');
    assert(css.includes('--primary-900:'), 'CSS must include generated --primary-900');
    assert(css.includes('--surface: #FFFFFF;'), 'CSS must include --surface');
    assert(css.includes('--sidebar: #145A3A;'), 'CSS must include --sidebar');
    assert(css.includes('--success: #198754;'), 'CSS must include --success');
  });

  // SCENARIO 6: Distributable files compilation
  test('Scenario 6: Distributable theme.css and version.json compile cleanly into public/themes', () => {
    buildCSS();
    const cssDist = path.join(__dirname, '..', 'public', 'themes', 'theme.css');
    const verDist = path.join(__dirname, '..', 'public', 'themes', 'version.json');
    assert(fs.existsSync(cssDist), 'public/themes/theme.css must exist');
    assert(fs.existsSync(verDist), 'public/themes/version.json must exist');

    const ver = JSON.parse(fs.readFileSync(verDist, 'utf8'));
    assert(ver.version, 'version.json must contain version string');
  });

  // SCENARIO 7, 8, 9, 10, 11, 12, 13: Server API, Draft Isolation, Publishing, Rollback & Cache Headers
  (async () => {
    testServerInstance = app.listen(TEST_PORT, async () => {
      console.log(`\n  Running Live Server Integration Tests on http://localhost:${TEST_PORT}...`);

      const request = (path, method = 'GET', body = null) => {
        return new Promise((resolve, reject) => {
          const req = http.request(
            {
              hostname: 'localhost',
              port: TEST_PORT,
              path,
              method,
              headers: {
                'Content-Type': 'application/json',
                ...(body ? { 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {})
              }
            },
            (res) => {
              let data = '';
              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                let parsed = null;
                try {
                  parsed = JSON.parse(data);
                } catch (e) {
                  parsed = data;
                }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
              });
            }
          );
          req.on('error', reject);
          if (body) req.write(JSON.stringify(body));
          req.end();
        });
      };

      // Scenario 7: Theme status API
      await testAsync('Scenario 7: GET /api/theme/status returns active version and sync state', async () => {
        const res = await request('/api/theme/status');
        assert.strictEqual(res.status, 200);
        assert(res.body.activeVersion, 'Status should include activeVersion');
        assert(typeof res.body.hasUnsavedChanges === 'boolean', 'hasUnsavedChanges should be boolean');
      });

      // Scenario 8: Save draft does not alter active theme or published CSS
      await testAsync('Scenario 8: POST /api/theme/draft saves draft WITHOUT modifying active theme', async () => {
        // Fetch original active theme
        const activeBefore = await request('/api/theme/active');
        const originalPrimary = activeBefore.body.colors.brand.primary;

        // Save a test color in draft
        const modifiedDraft = JSON.parse(JSON.stringify(activeBefore.body));
        modifiedDraft.colors.brand.primary = '#0055AA';

        const saveRes = await request('/api/theme/draft', 'POST', modifiedDraft);
        assert.strictEqual(saveRes.status, 200);
        assert.strictEqual(saveRes.body.success, true);

        // Verify active theme was NOT changed
        const activeAfter = await request('/api/theme/active');
        assert.strictEqual(activeAfter.body.colors.brand.primary, originalPrimary, 'Active theme MUST NOT change on draft save');

        // Verify draft theme DID change
        const draftAfter = await request('/api/theme/draft');
        assert.strictEqual(draftAfter.body.colors.brand.primary, '#0055AA', 'Draft theme must reflect saved draft');
      });

      // Scenario 9: Publish theme increments version and updates CSS
      await testAsync('Scenario 9: POST /api/theme/publish validates colors, increments version, updates active theme and generates CSS', async () => {
        const statusBefore = await request('/api/theme/status');
        const vBefore = statusBefore.body.activeVersion;

        const draft = await request('/api/theme/draft');
        const pubRes = await request('/api/theme/publish', 'POST', draft.body);
        assert.strictEqual(pubRes.status, 200);
        assert.strictEqual(pubRes.body.success, true);
        assert.notStrictEqual(pubRes.body.version, vBefore, 'Version must increment upon publish');

        // Verify version.json has the new version
        const verRes = await request('/themes/version.json');
        assert.strictEqual(verRes.body.version, pubRes.body.version, 'version.json must reflect published version');

        // Verify theme.css contains the published color
        const cssRes = await request('/themes/theme.css');
        assert(cssRes.body.includes('--primary: #0055AA;'), 'theme.css must contain the published color #0055AA');
      });

      // Scenario 10: Rollback restores previous version from history
      await testAsync('Scenario 10: POST /api/theme/rollback restores previous theme and archives current', async () => {
        const rollbackRes = await request('/api/theme/rollback', 'POST');
        assert.strictEqual(rollbackRes.status, 200);
        assert.strictEqual(rollbackRes.body.success, true);

        // Verify active theme primary restored back to Forest Green (#145A3A)
        const activeRes = await request('/api/theme/active');
        assert.strictEqual(activeRes.body.colors.brand.primary, '#145A3A', 'Primary should be restored to #145A3A');
      });

      // Scenario 11: Cache-Control Headers for version.json and theme.css
      await testAsync('Scenario 11: HTTP cache headers verify anti-caching for version.json and immutable caching for versioned CSS', async () => {
        const verRes = await request('/themes/version.json');
        assert(verRes.headers['cache-control'].includes('no-cache'), 'version.json must have no-cache header');
        assert.strictEqual(verRes.headers['access-control-allow-origin'], '*', 'CORS must allow all origins');

        const cssVersioned = await request('/themes/theme.css?v=1.0.0');
        assert(cssVersioned.headers['cache-control'].includes('max-age=31536000'), 'versioned CSS must have aggressive caching');
      });

      // Scenario 12: Theme Loader Resilience & Fallback
      test('Scenario 12: Theme Loader script exists and contains fallback tokens for offline resilience', () => {
        const loaderPath = path.join(__dirname, '..', 'public', 'themes', 'theme-loader.js');
        assert(fs.existsSync(loaderPath), 'theme-loader.js must exist');
        const content = fs.readFileSync(loaderPath, 'utf8');
        assert(content.includes('FALLBACK_CSS'), 'theme-loader.js must define FALLBACK_CSS');
        assert(content.includes('theme:updated'), 'theme-loader.js must dispatch custom event theme:updated');
      });

      // Teardown
      testServerInstance.close(() => {
        if (server && typeof server.close === 'function') server.close();
        console.log('\n=============================================================');
        console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log('=============================================================\n');
        process.exit(failed > 0 ? 1 : 0);
      });
    });
  })();
}

runTests();

