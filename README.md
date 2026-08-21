# ADN Semiconductors Static Website

Production-ready static corporate website for ADN Semiconductors, built with semantic HTML, modular CSS/JavaScript, and markdown collection-driven content for Insights, Careers, and Services.

The site is implemented as a multi-page static website.

## Project Structure

- `index.html` - Home page.
- `services.html` - Services page.
- `culture.html` - Static Culture page (single-page content managed directly in HTML).
- `insights.html` - Insights page (markdown collection rendered).
- `careers.html` - Careers page (markdown collection rendered).
- `contact.html` - Contact Us page.
- `detail.html` - Reusable detail page for services, insights, and career entries via query params.
- `css/styles.css` - Public site design tokens, layout, components, and responsive behavior.
- `js/main.js` - Public site interactions and markdown-driven rendering.
- `js/detail.js` - Shared renderer for detail pages driven by `type` and `id` query parameters.
- `js/content-service.js` - Shared markdown collection loading, normalization, and utility functions.
- `content/insights/` - Insight/news markdown entries and optional images.
- `content/careers/` - Career role markdown entries and optional images.
- Services and People content is inlined directly in `js/content-service.js` (no `content/services/` or `content/people/` markdown collections).
- `serve.py` - Cross-platform local server launcher.

## Run Locally

Use a local static server so markdown collection fetch requests work correctly.

### Quick Start

From the project root:

- Python script (cross-platform):

```bash
python serve.py
```

Optional custom port:

```bash
python serve.py --port 8080
```

Note: local server responses are no-cache for non-image files, and images are cached for 1 day. Service worker caching is disabled on localhost so local content edits appear immediately without changing ports.

### Option 1: Python

```bash
python -m http.server 5500
```

Then open:

- Home: `http://localhost:5500/`
- About: `http://localhost:5500/index.html#about-us`
- Services: `http://localhost:5500/services.html`
- Culture: `http://localhost:5500/culture.html`
- Insights: `http://localhost:5500/insights.html`
- Careers: `http://localhost:5500/careers.html`
- Contact: `http://localhost:5500/contact.html`

### Option 2: VS Code Live Server

Open `index.html` and start Live Server.

## Content Management

Insights and Careers content is sourced from markdown collections under `content/`. Services and People content is inlined directly in `js/content-service.js`.

## Scalable Routing Model

- Detail URLs are generated at runtime using one reusable page:
  - `detail.html?type=services&id=<service-id>`
  - `detail.html?type=insights&id=<insight-id>`
  - `detail.html?type=careers&id=<role-id>`
- This avoids creating one static HTML file per entry and scales automatically as collections grow.

## Navigation Scalability

- The Services dropdown is populated dynamically from the service records inlined in `js/content-service.js`.
- Adding a new service updates:
  - Services listing cards
  - Services dropdown submenu
  - Service detail route generation

### Insights Content

- Manifest file: `content/insights/index.md`
- Entry files: one markdown file per insight item.
- Frontmatter keys supported:
  - `id`
  - `type`
  - `title`
  - `summary`
  - `date` (`YYYY-MM-DD` recommended)
  - `author`
  - `url`
  - `image` (optional)

### Careers Content

- Manifest file: `content/careers/index.md`
- Entry files: one markdown file per role.
- Frontmatter keys supported:
  - `id`
  - `title`
  - `location`
  - `team`
  - `type`
  - `summary`
  - `requirements` (pipe-delimited, example: `Req A | Req B | Req C`)
  - `image` (optional)

### Services Content

- Services and their detail bodies are inlined as `SERVICE_RECORDS` in `js/content-service.js` (no markdown manifest).
- Fields supported per record:
  - `id`
  - `title`
  - `summary`
  - `image` (optional)
  - `heroImage` (optional)
  - `body` (markdown)

## Static Hosting Readiness

This project is ready for static hosting platforms (including GitHub Pages):

- No backend runtime required.
- All content is client-rendered from local markdown collections.
- Responsive and accessible baseline included.
- Content is organized by collection folder with per-entry markdown files and optional images.
