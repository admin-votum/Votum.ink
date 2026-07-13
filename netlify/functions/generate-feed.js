// deFramed — Feed Generator
// Fast headline-only analysis — full article on demand via analyze-multi
// Runs parallel, caches in memory, serves instantly after first load

const TOP_SOURCES = [
  { url: 'https://feeds.reuters.com/reuters/topNews', source: 'Reuters' },
  { url: 'http://feeds.bbci.co.uk/news/rss.xml', source: 'BBC News' },
  { url: 'https://feeds.foxnews.com/foxnews/politics', source: 'Fox News' },
  { url: 'https://theintercept.com/feed/?rss', source: 'The Intercept' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
  { url: 'https://feeds.skynews.com/feeds/rss/world.xml', source: 'Sky News' },
  { url: 'https://rss.politico.com/politics-news.xml', source: 'Politico' },
  { url: 'https://feeds.feedburner.com/breitbart', source: 'Breitbart' },
  { url: 'https://feeds.washingtonpost.com/rss/world', source: 'Washington Post' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'NYT' },
];

function cleanHtml(str = '') {
  return str.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").trim();
}

async function fetchHeadlines() {
  const results = await Promise.allSettled(TOP_SOURCES.map(async feed => {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; deFramed/1.0)' },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return [];
      const xml = await res.text();
      const items = [];
      const matches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);
      for (const match of matches) {
        const item = match[1];
        const getTag = (tag) => {
          const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'));
          return m ? cleanHtml(m[1] || m[2] || '') : '';
        };
        const title = getTag('title');
        const link = getTag('link') || item.match(/<link[^>]*href="([^"]+)"/i)?.[1] || '';
        const pubDate = getTag('pubDate') || '';
        const image = item.match(/url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)?.[1]
                   || item.match(/<media:content[^>]+url="([^"]+)"/i)?.[1] || null;
        if (title && link && title.length > 15) {
          items.push({ title, url: link, source: feed.source, image, pubDate });
        }
      }
      return items.slice(0, 3);
    } catch(e) { return []; }
  }));

  const articles = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
  const seen = new Set();
  return articles.filter(a => {
    const key = a.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 15);
}

async function analyzeHeadline(article) {
  try {
    const baseUrl = process.env.URL || 'https://votum.ink';
    const res = await fetch(`${baseUrl}/.netlify/functions/analyze-multi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        source: article.source,
        description: '',
      }),
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json();
    if (!data.models?.length) return null;

    const overalls = data.models.map(m => m.overall || 50);
    const spreadVal = Math.max(...overalls) - Math.min(...overalls);
    const spread = spreadVal < 15 ? { desc: 'Five minds largely agree.', color: '#3A7A4A' }
      : spreadVal < 30 ? { desc: 'Models find different things worth noting.', color: '#7A7A4A' }
      : spreadVal < 45 ? { desc: 'Significant disagreement. The debate itself is the signal.', color: '#8A4A3A' }
      : { desc: 'Not a warning — an invitation. Read as a judge reads a contested case.', color: '#8A3A6A' };

    return {
      id: article.url,
      headline: article.title,
      source: article.source,
      url: article.url,
      image: article.image,
      publishedAt: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
      models: data.models,
      spreadVal,
      signal: spread.desc,
      spreadColor: spread.color,
      headlineOnly: true,
      analyzedAt: new Date().toISOString(),
    };
  } catch(e) { return null; }
}

// In-memory cache
let cachedFeed = null;
let cacheTime = null;
const CACHE_TTL = 14 * 60 * 1000;

exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin':'*', 'Content-Type':'application/json' };

  const refresh = event.queryStringParameters?.refresh === 'true';
  if (!refresh && cachedFeed && cacheTime && (Date.now() - cacheTime) < CACHE_TTL) {
    return { statusCode:200, headers, body:JSON.stringify(cachedFeed) };
  }

  try {
    const headlines = await fetchHeadlines();
    const results = await Promise.allSettled(headlines.map(analyzeHeadline));
    const analyzed = results.filter(r=>r.status==='fulfilled'&&r.value).map(r=>r.value);

    cachedFeed = { articles:analyzed, generatedAt:new Date().toISOString(), count:analyzed.length };
    cacheTime = Date.now();

    return { statusCode:200, headers, body:JSON.stringify(cachedFeed) };
  } catch(err) {
    return { statusCode:500, headers, body:JSON.stringify({ error:err.message }) };
  }
};
