# Chandan Prajapati: portfolio

A static site with no build step and no framework. Dark by default, with a cream light theme behind the toggle.

| File | What it is |
| --- | --- |
| `index.html` | Home: hero, query stream, stats band, how I work, selected work, more work, experience, skills, contact |
| `work.html` | One page per project, rendered from `projects.js` (`work.html?p=pnl-statement`) |
| `projects.js` | **All seven projects**: index row, sticky-panel copy, case study, architecture diagram, numbers, lessons, and the small schematic illustrations (`VIZ`) |
| `app.js` | Theme, scroll progress, background and hero networks, query stream, counters, the work index and its sticky panel |
| `work.js` | Project-page renderer and the hoverable diagram |
| `styles.css` | Everything visual. Tokens at the top: light is `:root`, dark is `:root[data-theme="dark"]` |
| `resume.html` | Web resume; "Save as PDF" prints one A4 page |
| `headshot.jpg` | Hero photo, 720 × 720, shown in a circle |
| `vercel.json` | `cleanUrls`, so `/work?p=…` and `/resume` work without `.html` |

## Edit

- **A project's words or numbers**: `projects.js`. Each entry holds everything shown for that project, on the home page and on its own page.
- **Add a project**: append an entry to `PROJECTS` with a new `id`. The index, filters, panel and prev/next links pick it up.
- **A diagram**: nodes sit on a 998-wide grid in columns at x = 20 / 280 / 540 / 800 (178 × 66 each). Edges go from `f` to `t`; `fo` / `to` nudge an end up or down when two edges share a side.
- **The query stream**: `EVENTS` in `app.js`. It's labelled "simulated illustration" on the page, so keep it that way.
- **The photo**: replace `headshot.jpg` with any square image.
- **Fonts**: Nunito Sans, JetBrains Mono and Instrument Serif, from Google Fonts.

## Honesty rules

- Business figures (revenue, GMV, balances, spend) stay inside the company.
- Every count says where it came from; counts were taken from the codebase in September 2026.
- Illustrations are schematic, and the page says so.

## Preview

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321.

## Deploy

The site deploys from GitHub (`chandan232/chandan-prajapati`) through Vercel's Git integration: Framework Preset "Other", default settings. Every push to `main` redeploys.
