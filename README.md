# Centralized Theme Editor & Runtime Theme Management

A centralized color management system and zero-downtime runtime distribution engine for connected web applications.

> **Single Focus**: Theme colors and runtime CSS distribution. Eliminates hardcoded colors across all educational ERP portals without requiring frontend rebuilds or redeployments.

---

## 1. Architecture Overview

```
                                  ┌────────────────────────┐
                                  │      Theme Editor      │
                                  │ (React + Vite : 4001)  │
                                  └───────────┬────────────┘
                                              │ (REST API)
                                              ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        Local Distribution Server                          │
│                           (Node.js / Express : 4000)                      │
│                                                                           │
│  themes/active-theme.json   ──────────►  scripts/generate-css.js          │
│  themes/draft-theme.json                         │                        │
│  themes/history/ (Rollback)                      ▼                        │
│                                         public/themes/theme.css           │
│                                         public/themes/version.json        │
│                                         public/themes/theme-loader.js     │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │ (Atomic CSS Swaps)      │ (Atomic CSS Swaps)      │ (Atomic CSS Swaps)
            ▼                         ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
   │ Student Portal  │       │ Faculty Portal  │       │ Accounts Portal │
   │ (:4002 Sample)  │       │ (Connected App) │       │ (Connected App) │
   └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Key Principles
1. **JSON as Single Source of Truth**: Themes are stored in `themes/active-theme.json` and `themes/draft-theme.json`. Distributable CSS is generated directly from this JSON.
2. **Draft & Publish Isolation**: Edits in the Theme Editor only touch `draft-theme.json`. Connected portals are untouched until the theme is explicitly published.
3. **Atomic Zero-FOUC Swaps**: `theme-loader.js` preloads new stylesheets in a staging element and swaps them only after the `onload` event fires.
4. **Zero Backend Database**: No MongoDB or MySQL. Powered by clean JSON configs and static file hosting.
5. **No Portal Rebuilds**: When a new theme is published, connected portals receive updated colors in real-time.

---

## 2. Project Directory Structure

```
UI-THEME/
├── frontend/                     # Theme Editor Dashboard (React + Vite)
│   ├── src/
│   │   ├── components/           # Header, CreateThemeModal, DocsModal
│   │   ├── editor/               # ThemeOverview, ColorEditor, ColorPickerField, ShadeGenerator, PresetSelector
│   │   ├── preview/              # LivePreview (Educational ERP preview with device viewport toggle)
│   │   ├── utils/                # colorUtils.js (HSL color math, contrast calculations, shade generator)
│   │   ├── App.jsx               # Editor root & reactive state
│   │   └── App.css               # Clean Light UI with Forest Green accents (#145A3A)
│   └── package.json
│
├── server/
│   └── server.js                 # Lightweight API & Distribution Server (Port 5001)
│
├── themes/
│   ├── active-theme.json         # Current production theme
│   ├── draft-theme.json          # Working draft theme
│   ├── presets/                  # 9 Built-in Presets (Light & Dark collegiate palettes)
│   └── history/                  # Auto-archived backups for one-click rollback
│
├── public/
│   └── themes/
│       ├── theme.css             # Compiled CSS custom properties (:root)
│       ├── version.json          # Polling target with strict anti-caching headers
│       └── theme-loader.js       # Client runtime theme loader SDK
│
├── sample-portal/                # Reference connected React portal demonstrating real-time updates
│   ├── src/
│   │   ├── App.jsx               # Demonstrates zero hardcoded colors
│   │   └── App.css               # Consumes var(--primary), var(--surface), etc.
│   └── index.html                # Connected via single <script> tag
│
├── scripts/
│   └── generate-css.js           # CLI compiler: theme JSON -> CSS custom properties
│
├── deployment/
│   └── nginx.conf                # Production Nginx reverse-proxy & caching configuration
│
├── tests/
│   └── theme-engine.test.js      # Automated test suite (13 critical scenarios verified)
│
├── package.json
└── README.md
```

---

## 3. Quick Start (Local Development)

### Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v9+

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
npm --prefix frontend install
npm --prefix sample-portal install
```

### 2. Start the Local Development Suite
You can start all three services simultaneously with a single command:
```bash
npm run dev
```

Or start them individually in separate terminals:

```bash
# Terminal 1: Local Theme Distribution & API Server (Port 4000)
npm run server

# Terminal 2: Theme Editor Dashboard (Port 4001)
npm run editor

# Terminal 3: Sample Connected Portal (Port 4002)
npm run portal
```

### 3. Open in Browser
- **Theme Editor**: [http://localhost:4001](http://localhost:4001)
- **Sample Connected Portal**: [http://localhost:4002](http://localhost:4002)
- **Central CSS Distribution**: [http://localhost:4000/themes/theme.css](http://localhost:4000/themes/theme.css)
- **Version Polling Target**: [http://localhost:4000/themes/version.json](http://localhost:4000/themes/version.json)

### Presets Library (9 Institutional Palettes)
The system includes 9 carefully crafted presets tailored for educational institutions:
1. **Forest Green Light**: Flagship institutional brand theme with deep forest green accents (`#145A3A`) and crisp white surfaces.
2. **Forest Green Dark**: High-contrast dark mode with emerald green accents (`#2ECC71`) and deep green-slate surfaces.
3. **Default Light**: Clean, neutral slate and modern royal blue palette (`#2563EB`).
4. **Royal Navy Classic**: Prestigious academic palette with deep oxford navy (`#1E3A8A`) and cool slate backgrounds.
5. **Midnight Obsidian Dark**: Ultra-modern deep dark mode (`#0B0F19`) with neon indigo (`#6366F1`) and cyan accents.
6. **Crimson & Amber Heritage**: Collegiate heritage university aesthetic with rich crimson (`#8B1E28`), warm parchment, and gold.
7. **Teal & Sage Polytechnic**: Technical institute palette with deep ocean teal (`#0D5C75`) and sage green (`#2A9D8F`).
8. **Charcoal & Bronze Executive**: Refined executive business school theme with charcoal slate (`#334155`) and rich bronze.
9. **Emerald Light**: Fresh, vibrant campus emerald green (`#059669`) with mint accents.

---

## 4. How to Test Live Multi-Portal Updates

1. Open [http://localhost:4001](http://localhost:4001) (Theme Editor) and [http://localhost:4002](http://localhost:4002) (Sample Portal) side-by-side in your browser.
2. In the **Theme Editor**, change the **Primary Brand** colour (e.g., from Forest Green `#145A3A` to Indigo `#2563EB` or pick from **Presets**).
3. Notice the **Live Educational ERP Preview** immediately updates in the editor.
4. Notice the **Sample Portal** has NOT changed yet (draft isolation).
5. Click **"Save Draft"** — the draft is persisted to disk, but the connected portal is still untouched.
6. Click **"Publish Theme"** — the theme engine validates colors, generates `theme.css`, increments the version in `version.json`, and saves a rollback snapshot.
7. Within 5 seconds, watch the **Sample Portal automatically update its colours in real-time** without reloading the page!
8. Click **"Rollback"** in the Theme Editor to instantly restore the previous theme.

---

## 5. Integrating Existing Portals

Integrating any existing React, Vue, Angular, or Vanilla HTML portal requires zero architectural redesign and zero component rewrites.

### Step 1: Add the Runtime Loader to `index.html`
Place this script in your portal's `index.html` `<head>`:

```html
<!-- Runtime Theme Loader -->
<script 
  src="http://localhost:4000/themes/theme-loader.js" 
  data-theme-server="http://localhost:4000"
  data-poll-interval="30">
</script>
```

> **Production note**: Change `data-theme-server` to your production URL (e.g. `https://themes.yourdomain.com`) or inject it via an environment variable.

### Step 2: Use CSS Variables in Your Portal CSS
Replace hardcoded hex values with standard theme CSS variables:

```css
/* Buttons */
.btn-primary {
  background-color: var(--primary);
  color: #ffffff;
}
.btn-primary:hover {
  background-color: var(--primary-hover);
}

/* Surfaces & Layout */
.app-container {
  background-color: var(--background);
  color: var(--text-primary);
}
.sidebar {
  background-color: var(--sidebar);
  color: var(--sidebar-text);
}
.card {
  background-color: var(--surface);
  border: 1px solid var(--border);
}

/* Badges & Semantics */
.badge-success {
  background-color: var(--success-light);
  color: var(--success);
}
```

### Step 3: Tailwind CSS Integration (If Portal Uses Tailwind)
In your portal's `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          900: 'var(--primary-900)',
        },
        surface: 'var(--surface)',
        background: 'var(--background)',
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          text: 'var(--sidebar-text)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      }
    }
  }
};
```

### Step 4 (Optional): React Theme Event Listener
If your React application needs to perform actions whenever a theme update occurs:

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const onThemeUpdate = (e) => {
      console.log('Central theme version updated to:', e.detail.version);
    };

    window.addEventListener('theme:updated', onThemeUpdate);
    return () => window.removeEventListener('theme:updated', onThemeUpdate);
  }, []);

  return <YourExistingApp />;
}
```

---

## 6. Theme Tokens Reference

| Category | Token Key | Description |
|---|---|---|
| **Brand** | `--primary` | Main institutional brand color |
| | `--primary-hover` | Hover state for primary buttons / actions |
| | `--primary-light` | Light tint for active tabs, selected states, badges |
| | `--primary-rgb` | Raw R, G, B channels for CSS opacity functions |
| | `--secondary` | Complementary brand accent |
| | `--accent` | Highlight & callout color |
| **Shades** | `--primary-50` to `--primary-900` | 10 perceptually generated lightness steps |
| | `--secondary-50` to `--secondary-900` | 10 secondary shade steps |
| **Surfaces** | `--background` | Main page canvas background |
| | `--surface` | Dashboard card, modal, and table background |
| | `--sidebar` | Navigation sidebar background |
| | `--sidebar-text` | Contrast text for sidebar items |
| | `--navbar` | Top header bar background |
| **Typography** | `--text-primary` | Main headings and high-emphasis body text |
| | `--text-secondary` | Labels, table headers, descriptions |
| | `--text-muted` | Sub-hints, timestamps, placeholders |
| **Borders** | `--border` | Subtle divider lines and card borders |
| | `--border-strong` | Input boundaries, active outlines |
| **Semantic** | `--success` / `--success-light` | Approved, active, fees paid |
| | `--warning` / `--warning-light` | Pending verification, alerts |
| | `--danger` / `--danger-light` | Overdue fees, errors, suspended |
| | `--info` / `--info-light` | Academic notices, informational alerts |

---

## 7. Production Deployment (AWS Lightsail / Nginx)

### Required GitHub Repository Secrets
Under your GitHub repository settings (**Settings > Secrets and variables > Actions**), configure these two secrets:
* `SERVER_IP`: The public IPv4 address of your AWS Lightsail instance (e.g. `13.x.x.x`).
* `SSH_KEY`: The private SSH key (PEM) for `ec2-user`.

### How Deployment Works
1. **GitHub Actions Runner**: Builds the frontend SPA (`frontend/dist/`) and uploads it via `rsync` using `SERVER_IP` and `SSH_KEY`.
2. **Lightsail Server (`ec2-user`)**:
   - Pulls the latest code from `main` (safeguarding your server-published themes and history).
   - Installs backend dependencies if `package.json` changed.
   - Compiles `theme.css`.
   - Deploys the frontend build to `/var/www/themes/frontend/`.
   - Deploys static theme assets to `/var/www/themes/public/`.
   - Reloads the PM2 process via `ecosystem.config.js` on port `4000`.
3. **Nginx Reverse Proxy**: Uses `deployment/nginx.conf` for `theme.pydah.edu.in` to serve static distribution files directly and proxy `/api/` to port 4000.

---

## 8. Verification & Automated Tests

To run the automated verification suite covering all 13 required scenarios:

```bash
npm test
```
Or directly:
```bash
node tests/theme-engine.test.js
```
