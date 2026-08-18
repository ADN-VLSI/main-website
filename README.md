# ADN Semiconductors Static Website

Production-ready static corporate website for ADN Semiconductors, built with semantic HTML, modular CSS/JavaScript, and local JSON-driven content for Insights and Careers.

## Project Structure

- `index.html` - Public website with all required sections.
- `css/styles.css` - Public site design tokens, layout, components, and responsive behavior.
- `js/main.js` - Public site interactions and JSON-driven rendering.
- `js/content-service.js` - Shared data loading, normalization, and JSON export utilities.
- `data/insights.json` - Insights/news content source.
- `data/careers.json` - Careers/job listings content source.
- `admin/index.html` - Local-only content maintenance interface.
- `admin/admin.css` - Admin UI styles.
- `admin/admin.js` - Admin editor logic with import/export workflows.

## Run Locally

Use a local static server so JSON fetch requests work correctly.

### Option 1: Python

```bash
python -m http.server 5500
```

Then open:

- Public site: `http://localhost:5500/`
- Admin tools: `http://localhost:5500/admin/`

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
