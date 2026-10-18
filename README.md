# Macroeconomics Data Portal

A lightweight web application that fetches and displays macroeconomic indicators from the World Bank API.

## Features
- **Default Countries**: USA, China, UK, Norway, and India are pinned.
- **Dynamic Search**: Add any other country or region by name.
- **Data Visualization**: 10-year GDP growth rate trends using Chart.js.
- **Economic Insights**: Brief summaries of major economies including strengths and weaknesses.
- **Responsive Design**: Works on mobile and desktop.

## How to Deploy (Make it available on the internet)

Since this is a static website (HTML, CSS, and JavaScript only), you can host it for free using several services:

### 1. GitHub Pages (Recommended)
1. Create a new repository on [GitHub](https://github.com).
2. Upload all files from this folder (`index.html`, `assets/`).
3. Go to **Settings** > **Pages**.
4. Under **Build and deployment**, set the source to `Deploy from a branch` and select `main` (or `master`).
5. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

### 2. Vercel / Netlify (Easiest)
1. Create an account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Drag and drop the folder containing these files into their deployment area.
3. They will provide you with a random URL (e.g., `macro-data.vercel.app`) which you can customize.

## Local Development
If you want to run it locally:
```bash
# Using Python
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

## Data Source
- [World Bank API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-api-queries)
