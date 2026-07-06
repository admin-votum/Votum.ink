# Votum.ink

> *What actually happened.*

Votum is a bias-free U.S. political news and data platform. It aggregates news from across the political spectrum, labels every source transparently, and distills each article into a single true sentence — The Point.

No algorithmic amplification. No engagement mechanics. No ads in the product. Just information, presented honestly, and trusted to the reader.

---

## What it does

**Interactive Electoral Map** — click any U.S. state to surface its news feed, polling data, Senate composition, and governor. Hover for instant stats.

**Multi-source News Feed** — pulls from GNews, Newsdata, and Perigon simultaneously. Deduped, sorted by freshness, labeled by source lean across the full Left → Center → Right spectrum.

**The Point** — every article reduced to its single true sentence by Claude AI. No scaffolding. No bait. Sorted by source credibility score.

**Votum Analysis** — each article is analyzed for:
- Source credibility score (0–100)
- Coverage spread across the political spectrum
- Bias flags — emotionally charged language, single source, missing context
- Counter story — the opposing perspective on the same event

**2026 Midterm Watch** — live Senate and House balance tracker. State-level Senate composition and governor data.

---

## Architecture

```
votum/
  index.html              # Main map + news feed
  the-point.html          # The Point standalone feed
  netlify.toml            # Netlify configuration
  netlify/
    functions/
      analyze.js          # Claude API proxy — article analysis
      news.js             # News API proxy — multi-source aggregation
```

All API keys stored as Netlify environment variables. Zero credentials in the browser.

---

## Stack

- Vanilla HTML/CSS/JS — no framework, fast, accessible
- D3 + TopoJSON — US electoral map
- GNews, Newsdata.io, Perigon — news aggregation
- Claude Sonnet (Anthropic) — bias analysis, The Point
- Netlify — hosting + serverless functions

---

## Environment Variables

```
ANTHROPIC_KEY   — Anthropic Claude API
GNEWS_KEY       — GNews API
NEWSDATA_KEY    — Newsdata.io API
PERIGON_KEY     — Perigon API
```

---

## Mission

Most political news is optimized for engagement, not understanding. Votum is optimized for truth.

The goal is maximum autonomy — a platform that surfaces information cleanly, labels it honestly, and gets out of the way. No editorial slant. No human thumb on the scale. The reader decides.

*Votum* — Latin for "the formal expression of a citizen's will."
*.ink* — the news.
