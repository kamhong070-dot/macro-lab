# Macro Lab — World Macro Data for Edexcel IAL Economics

A free, static study website that helps students revise **Edexcel International A Level Economics (Units 2 & 4)** using **live World Bank data**. No backend, no build step, no dependencies to install — just HTML, CSS and vanilla JavaScript.

**Live demo:** `https://<your-username>.github.io/<repo-name>/` (after you deploy, see below)

## What it does

| Section | Purpose |
| --- | --- |
| **Dashboard** | Country cards with the six headline indicators (GDP growth, inflation, unemployment, current account, government debt, GDP per capita), a 20-year sparkline, and auto-generated *revision hooks* that link each data point to the theory that explains it. |
| **Compare** | Plot up to 4 countries on any of 18 World Bank indicators, with averages, ranges and an examiner-style commentary. One-click CSV export. |
| **Topics** | 20 topic notes mapped to the Edexcel IAL spec: key concepts, formulas, hand-drawn SVG diagrams (AD/AS, Phillips, Lorenz, J-curve, tariff…), chain-of-reasoning steps, analysis and evaluation points, and exam focus tips. Covers Unit 2 (macro), Unit 4 (global economy) plus micro bridge notes. |
| **Glossary** | ~100 precise definitions with "use it in a sentence" examples, plus a 10-question quiz mixing definitions, calculation drills and **live-data questions** generated from the countries you follow. |
| **Essay Lab** | A KAAE (Knowledge–Application–Analysis–Evaluation) framework, an outline builder that drafts an essay skeleton **with your chosen country's live data inserted**, and a 14-question bank with full plans and model paragraphs. |
| **Data** | A clean cross-section table of every indicator × pinned country, exportable to CSV for coursework. |

## How it works

- All macro data is fetched live from the [World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-api-queries) (18 indicators, 1990–latest, ~200 economies).
- Requests are batched (one request per indicator, up to 20 countries each) and cached in `localStorage` for 7 days, so repeat visits are instant and the API is used politely.
- Everything else — topics, glossary, essay plans — is static content in `assets/content.js`, easy to edit and extend.

## Deploy to GitHub Pages

### Option A — GitHub Actions (recommended)

1. Create a new repository on GitHub (any name, e.g. `macro-lab`).
2. Push this folder to it:

   ```bash
   cd "Macroeconomics data portal"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) deploys automatically on every push to `main`.
5. Your site is live at `https://<your-username>.github.io/<repo-name>/`.

### Option B — Deploy from branch

1. Push the files to `main` as above.
2. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.

## Local development

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any static file server works. Opening `index.html` directly from the filesystem also works in most browsers (the World Bank API allows cross-origin requests), but a local server is more reliable.

## Project structure

```
index.html            page shell and section markup
assets/styles.css     design system (no framework)
assets/content.js     indicators, topic notes, glossary, essay bank, drills
assets/app.js         data fetching, caching, charts, quiz, outline builder
.github/workflows/    GitHub Pages deployment
```

## Customising

- **Add indicators**: append an entry to `indicators` in `assets/content.js` (find codes at [data.worldbank.org](https://data.worldbank.org/indicator)).
- **Add topics or essay questions**: follow the existing object shapes in `assets/content.js`.
- **Change default countries**: edit the `presets` array.

## Notes

- This project is a study aid. It is not affiliated with or endorsed by Pearson Edexcel.
- Data © World Bank; check [data.worldbank.org](https://data.worldbank.org) for terms and update status.
- Built with vanilla JavaScript and [Chart.js](https://www.chartjs.org).
