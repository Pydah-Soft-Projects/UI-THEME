/**
 * Runtime Theme Loader
 * 
 * Lightweight, zero-dependency theme client for connected applications.
 * Automatically loads centralized theme CSS, polls for updates, and swaps stylesheets
 * seamlessly without page reload or FOUC (Flash of Unstyled Content).
 * Caches full active CSS to localStorage for robust offline resilience,
 * guaranteeing the last synced theme is displayed even when the central server is unavailable.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var instance = factory();
    root.ThemeLoader = instance;
    // Backward compatibility for existing portals
    root.PydahThemeLoader = instance;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var STYLE_ID_ACTIVE = 'app-theme-active';
  var STYLE_ID_CACHED = 'app-theme-cached';
  var STYLE_ID_FALLBACK = 'app-theme-fallback';
  var STORAGE_VERSION_KEY = 'app_theme_version';
  var STORAGE_CSS_KEY = 'app_theme_css';

  // Fallback CSS variables if central server is completely unreachable and NO cache exists
  var FALLBACK_CSS = [
    ':root, :root:root {',
    '  --primary: #145A3A;',
    '  --primary-hover: #10452E;',
    '  --primary-light: #E5F2E9;',
    '  --primary-rgb: 20, 90, 58;',
    '  --secondary: #287A50;',
    '  --secondary-rgb: 40, 122, 80;',
    '  --accent: #0E8388;',
    '  --background: #F7F9F7;',
    '  --surface: #FFFFFF;',
    '  --sidebar: #145A3A;',
    '  --sidebar-text: #FFFFFF;',
    '  --sidebar-muted: #A1CBB7;',
    '  --navbar: #FFFFFF;',
    '  --navbar-border: #E5EAE6;',
    '  --text-primary: #252B27;',
    '  --text-secondary: #5B645E;',
    '  --text-muted: #8D9790;',
    '  --border: #E5EAE6;',
    '  --border-strong: #CBD5CE;',
    '  --success: #198754;',
    '  --warning: #F0AD4E;',
    '  --danger: #DC3545;',
    '  --info: #0D6EFD;',
    '}'
  ].join('\n');

  var state = {
    initialized: false,
    themeServer: '',
    pollInterval: 10, // seconds
    currentVersion: null,
    pollTimer: null,
    status: 'idle', // 'idle' | 'loading' | 'active' | 'error'
    lastCheck: null,
    consecutiveFailures: 0
  };

  /**
   * Enhances CSS specificity to ensure cached theme rules take precedence over any
   * bundled :root declarations during Vite hydration or page reload.
   */
  function enhanceSpecificity(css) {
    if (!css) return '';
    return css.replace(/:root\b/g, ':root, :root:root');
  }

  /**
   * Immediately applies cached CSS from localStorage
   */
  function applyCachedTheme() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    try {
      var cachedCss = localStorage.getItem(STORAGE_CSS_KEY);
      if (cachedCss) {
        var existing = document.getElementById(STYLE_ID_CACHED);
        var target = document.head || document.documentElement;
        if (!existing && target) {
          var style = document.createElement('style');
          style.id = STYLE_ID_CACHED;
          style.textContent = enhanceSpecificity(cachedCss);
          target.appendChild(style);
        } else if (existing) {
          existing.textContent = enhanceSpecificity(cachedCss);
          if (target && existing.parentNode === target) {
            target.appendChild(existing);
          }
        }
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Attempt instant application synchronously as script evaluates
  applyCachedTheme();

  // Re-verify immediately on DOMContentLoaded in case head was modified during hydration
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', applyCachedTheme);
  }

  /**
   * Helper to inspect current script element configuration
   */
  function detectScriptConfig() {
    if (typeof document === 'undefined') return {};
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (s.src && s.src.indexOf('theme-loader.js') !== -1) {
        var base = '';
        try {
          var url = new URL(s.src, window.location.href);
          base = url.origin;
        } catch (e) {
          base = '';
        }
        return {
          themeServer: s.getAttribute('data-theme-server') || base || '',
          pollInterval: parseInt(s.getAttribute('data-poll-interval'), 10) || 10
        };
      }
    }
    return {};
  }

  /**
   * Dispatches theme lifecycle events
   */
  function dispatchEvent(name, detail) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      try {
        var evt = new CustomEvent(name, { detail: detail });
        window.dispatchEvent(evt);
      } catch (e) {
        var legacyEvt = document.createEvent('CustomEvent');
        legacyEvt.initCustomEvent(name, false, false, detail);
        window.dispatchEvent(legacyEvt);
      }
    }
  }

  function broadcastUpdate(detail) {
    dispatchEvent('theme:updated', detail);
    dispatchEvent('pydah:theme-updated', detail);
  }

  /**
   * Injects fallback CSS ONLY if no theme has ever been cached in localStorage
   */
  function injectFallbackCSS() {
    // 1. If we have a cached theme, preserve it! Never override!
    if (applyCachedTheme()) {
      console.info('[ThemeLoader] Server unavailable. Successfully using last synced theme from cache.');
      return;
    }

    // 2. Only if no theme was ever synced (first visit offline), inject fallback tokens
    var existingFallback = document.getElementById(STYLE_ID_FALLBACK);
    if (!existingFallback) {
      var target = document.head || document.documentElement;
      if (target) {
        var style = document.createElement('style');
        style.id = STYLE_ID_FALLBACK;
        style.textContent = FALLBACK_CSS;
        target.appendChild(style);
        console.warn('[ThemeLoader] Central server unreachable and no cached theme found. Injected fallback theme CSS.');
      }
    }
  }

  function removeFallbackCSS() {
    var fallback = document.getElementById(STYLE_ID_FALLBACK);
    if (fallback && fallback.parentNode) {
      fallback.parentNode.removeChild(fallback);
    }
  }

  /**
   * Directly fetches CSS text, caches it in localStorage, and updates style element
   */
  function applyThemeStylesheet(serverBase, version, onComplete) {
    var serverUrl = serverBase.replace(/\/$/, '');
    var cssUrl = serverUrl + '/themes/theme.css?v=' + encodeURIComponent(version) + '&_t=' + Date.now();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', cssUrl, true);
    xhr.timeout = 5000;

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        var cssText = xhr.responseText;
        var formatted = enhanceSpecificity(cssText);

        // 1. Immediately cache in localStorage for offline resilience
        try {
          localStorage.setItem(STORAGE_CSS_KEY, cssText);
          localStorage.setItem(STORAGE_VERSION_KEY, version);
        } catch (e) {}

        // 2. Inject or update active style tag at end of head
        var target = document.head || document.documentElement;
        var activeStyle = document.getElementById(STYLE_ID_CACHED);
        if (!activeStyle && target) {
          activeStyle = document.createElement('style');
          activeStyle.id = STYLE_ID_CACHED;
          target.appendChild(activeStyle);
        }
        if (activeStyle) {
          activeStyle.textContent = formatted;
          if (target && activeStyle.parentNode === target) {
            target.appendChild(activeStyle);
          }
        }

        removeFallbackCSS();

        state.currentVersion = version;
        state.status = 'active';
        state.consecutiveFailures = 0;

        console.info('[ThemeLoader] Successfully applied & cached theme version: ' + version);

        broadcastUpdate({
          version: version,
          url: cssUrl,
          timestamp: new Date().toISOString()
        });

        if (onComplete) onComplete(null, version);
      } else {
        injectFallbackCSS();
        if (onComplete) onComplete(new Error('Failed to fetch theme CSS'));
      }
    };

    xhr.onerror = function (err) {
      injectFallbackCSS();
      if (onComplete) onComplete(err);
    };

    xhr.ontimeout = function () {
      injectFallbackCSS();
      if (onComplete) onComplete(new Error('Theme CSS fetch timed out'));
    };

    try {
      xhr.send();
    } catch (err) {
      injectFallbackCSS();
      if (onComplete) onComplete(err);
    }
  }

  /**
   * Fetches version.json from target serverUrl
   */
  function fetchVersionFromUrl(serverUrl, timeoutMs, callback) {
    var cleanBase = serverUrl.replace(/\/$/, '');
    var versionUrl = cleanBase + '/themes/version.json?_t=' + Date.now();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', versionUrl, true);
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    xhr.setRequestHeader('Pragma', 'no-cache');
    xhr.timeout = timeoutMs || 2500;

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          callback(null, data, cleanBase);
        } catch (e) {
          callback(new Error('Invalid version JSON response'));
        }
      } else {
        callback(new Error('HTTP status ' + xhr.status + ' while fetching theme version'));
      }
    };

    xhr.onerror = function () {
      callback(new Error('Network error connecting to ' + cleanBase));
    };

    xhr.ontimeout = function () {
      callback(new Error('Timeout connecting to ' + cleanBase));
    };

    try {
      xhr.send();
    } catch (err) {
      callback(err);
    }
  }

  /**
   * Checks for remote version changes and swaps if updated
   */
  function checkAndSyncTheme(force, onComplete) {
    state.lastCheck = new Date();

    // Primary target: Central Theme Server
    fetchVersionFromUrl(state.themeServer, 2000, function (err, data, resolvedBase) {
      if (!err && data && data.version) {
        state.consecutiveFailures = 0;
        var remoteVersion = data.version;
        if (force || remoteVersion !== state.currentVersion) {
          console.log('[ThemeLoader] New theme detected (' + state.currentVersion + ' -> ' + remoteVersion + '). Updating...');
          applyThemeStylesheet(resolvedBase, remoteVersion, onComplete);
        } else {
          if (onComplete) onComplete(null, state.currentVersion);
        }
        return;
      }

      // Secondary target: local host fallback if remote server is unreachable
      var localBase = typeof window !== 'undefined' ? window.location.origin : '';
      if (localBase && localBase !== state.themeServer.replace(/\/$/, '')) {
        fetchVersionFromUrl(localBase, 1500, function (fallbackErr, fallbackData, fallbackResolvedBase) {
          if (!fallbackErr && fallbackData && fallbackData.version) {
            var fbVersion = fallbackData.version;
            // Only update from local fallback if local has a valid version and we have no cached version or forced
            if (!state.currentVersion || force) {
              applyThemeStylesheet(fallbackResolvedBase, fbVersion, onComplete);
              return;
            }
          }
          // Remote server is down, keep the active cached theme
          injectFallbackCSS();
          if (onComplete) onComplete(err);
        });
        return;
      }

      // Remote server is down, maintain cached theme
      injectFallbackCSS();
      if (onComplete) onComplete(err);
    });
  }

  /**
   * Starts background polling loop
   */
  function startPolling() {
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
    }

    var intervalMs = Math.max(5, state.pollInterval) * 1000;
    state.pollTimer = setInterval(function () {
      checkAndSyncTheme(false);
    }, intervalMs);
  }

  /**
   * Initialize Theme Loader
   */
  function init(options) {
    if (state.initialized) {
      return state;
    }

    var detected = detectScriptConfig();
    options = options || {};

    state.themeServer = options.themeServer || detected.themeServer || (typeof window !== 'undefined' ? window.location.origin : '');
    state.pollInterval = options.pollInterval || detected.pollInterval || 10;
    state.initialized = true;

    try {
      var cachedVer = localStorage.getItem(STORAGE_VERSION_KEY);
      if (cachedVer) {
        state.currentVersion = cachedVer;
      }
    } catch (e) {}

    // Apply last synced theme from cache immediately
    applyCachedTheme();

    checkAndSyncTheme(true, function (err) {
      if (err) {
        console.warn('[ThemeLoader] Remote theme server offline. Operating in resilient cached mode with last synced theme.');
      }
      startPolling();
    });

    return state;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    var detected = detectScriptConfig();
    if (detected.themeServer) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          init(detected);
        });
      } else {
        init(detected);
      }
    }
  }

  return {
    init: init,
    checkNow: function (callback) {
      checkAndSyncTheme(true, callback);
    },
    getVersion: function () {
      return state.currentVersion;
    },
    getState: function () {
      return {
        initialized: state.initialized,
        themeServer: state.themeServer,
        pollInterval: state.pollInterval,
        currentVersion: state.currentVersion,
        lastCheck: state.lastCheck,
        status: state.status,
        failures: state.consecutiveFailures
      };
    },
    setServer: function (url) {
      state.themeServer = url;
      checkAndSyncTheme(true);
    }
  };
});
