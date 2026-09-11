# Chandan Prajapati: portfolio

A static site: `index.html`, `styles.css`, `app.js` and `assets/`. No build step, no framework.

## Edit

- **Words**: everything is in `index.html`. Each project in *Selected work* is an `<article class="chapter">`, and its build notes live in the matching `<template id="tpl-…">` near the bottom.
- **Charts**: `app.js` → `VIZ` (one function per chart). All chart data is synthetic and labelled that way on the page.
- **Hero dashboard**: `app.js` → "Hero dashboard". The statement lines are in `BASE_LINES`; net is derived from them, so the preview always ties out.
- **Colours and type**: `styles.css` → the tokens at the top (`--accent`, `--bg`, …). Dark is the default; the light values sit under `[data-theme="light"]`.
- **Resume**: `resume.html` is the web resume. Its "Save as PDF" button prints an A4 page.
- **Fonts**: Geist, Geist Mono and Instrument Serif load from Google Fonts (the `<link>` in `index.html`).

## Preview

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321.

## Deploy

The site deploys from GitHub (`chandan232/chandan-prajapati`) through Vercel's Git integration. No build step: Framework Preset "Other", default settings. Every push to `main` redeploys.

Any other static host works too (Netlify, GitHub Pages).
