# ADN Semiconductors Static Website

Production-ready static corporate website for ADN Semiconductors, built with semantic HTML, modular CSS/JavaScript, and local JSON-driven content for Insights and Careers.

The site is implemented as a multi-page static website.

## Project Structure

- `index.html` - Home page.
- `about.html` - About Us page.
- `services.html` - Services page.
- `insights.html` - Insights page (JSON-rendered).
- `careers.html` - Careers page (JSON-rendered).
- `contact.html` - Contact Us page.
- `css/styles.css` - Public site design tokens, layout, components, and responsive behavior.
- `js/main.js` - Public site interactions and JSON-driven rendering.
- `js/content-service.js` - Shared data loading, normalization, and JSON export utilities.
- `data/insights.json` - Insights/news content source.
- `data/careers.json` - Careers/job listings content source.
- `admin/index.html` - Local-only content maintenance interface.
- `admin/admin.css` - Admin UI styles.
- `admin/admin.js` - Admin editor logic with import/export workflows.
- `scripts/serve.py` - Cross-platform local server launcher.
- `scripts/serve.sh` - macOS/Linux shell launcher.
- `scripts/serve.bat` - Windows launcher.

## Run Locally

Use a local static server so JSON fetch requests work correctly.

### Quick Start Scripts

From the project root:

- Windows (Command Prompt):

```bat
scripts\serve.bat
```

- macOS/Linux:

```bash
bash scripts/serve.sh
```

- Python script (cross-platform):

```bash
python scripts/serve.py
```

Optional custom port:

```bash
python scripts/serve.py --port 8080
```

### Option 1: Python

```bash
python -m http.server 5500
```

Then open:

- Home: `http://localhost:5500/`
- About: `http://localhost:5500/about.html`
- Services: `http://localhost:5500/services.html`
- Insights: `http://localhost:5500/insights.html`
- Careers: `http://localhost:5500/careers.html`
- Contact: `http://localhost:5500/contact.html`
- Admin tools: `http://localhost:5500/admin/`

## Accessing the Admin Panel

After starting any local server, open:

- `http://127.0.0.1:5500/admin/`

If you run on a different port, replace `5500` with your selected port.

### Option 2: VS Code Live Server

Open `index.html` and start Live Server.

## Content Management

All public dynamic content is sourced from local JSON files in `data/`.

### Insights Content

- Source file: `data/insights.json`
- Root key: `insights`
- Each entry supports:
  - `id`
  - `type`
  - `title`
  - `summary`
  - `date` (`YYYY-MM-DD` recommended)
  - `author`
  - `url`

### Careers Content

- Source file: `data/careers.json`
- Root key: `roles`
- Each entry supports:
  - `id`
  - `title`
  - `location`
  - `team`
  - `type`
  - `summary`
  - `requirements` (array of strings)
  - `applyUrl`

## Using the Local Admin Tools

Open `admin/index.html` from your local server.

### What You Can Do

- Add, edit, and remove Insights entries.
- Add, edit, and remove Careers entries.
- Import JSON for each dataset.
- Export updated JSON for each dataset.
- Export a combined snapshot containing both datasets.

### Import/Export Workflow

1. Open admin tools.
2. Update entries in the form UI.
3. Export `insights.json` and/or `careers.json`.
4. Replace files under `data/` with exported versions.
5. Commit the JSON changes to git.

## Static Hosting Readiness

This project is ready for static hosting platforms (including GitHub Pages):

- No backend runtime required.
- All content is client-rendered from local JSON files.
- Responsive and accessible baseline included.
- Public/admin paths are separated.
