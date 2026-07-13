// deFramed — Live News Feed
// Pulls latest headlines from top sources for the feed
// Returns headlines ready for display and deframing

const TOP_SOURCES = [
  { url: 'https://feeds.reuters.com/reuters/topNews', source: 'Reuters', tier: 1 },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'NYT', tier: 1 },
  { url: 'http://feeds.bbci.co.uk/news/rss.xml', source: 'BBC News', tier: 1 },
  { url: 'https://feeds.washingtonpost.com/rss/world', source: 'Washington Post', tier: 1 },
  { url: 'https://feeds.skynews.com/feeds/rss/world.xml', source: 'Sky News', tier: 2 },
  { url: 'https://feeds.feedburner.com/breitbart', source: 'Breitbart', tier: 2 },
  { url: 'https://theintercept.com/feed/?rss', source: 'The Intercept', tier: 2 },
  { url: 'https://rss.politico.com/politics-news.xml', source: 'Politico', tier: 2 },
  { url: 'https://feeds.foxnews.com/foxnews/politics', source: 'Fox News', tier: 2 },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', tier: 2 },
];

function cleanHtml(str = '') {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

async function fetchFeed(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; deFramed/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(5000),
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
      const pubDate = getTag('pubDate') || getTag('dc:date') || '';
      const image = item.match(/url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)?.[1]
                 || item.match(/<media:content[^>]+url="([^"]+)"/i)?.[1]
                 || null;

      if (title && link && title.length > 15) {
        items.push({
          id: link,
          headline: title,
          url: link,
          source: feed.source,
          image,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          tier: feed.tier,
          models: [],
          signal: '',
          spreadVal: 0,
        });
      }
    }

    return items.slice(0, 5);
  } catch(e) { return []; }
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300', // Cache 5 mins
  };

  try {
    const results = await Promise.allSettled(TOP_SOURCES.map(fetchFeed));
    const articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Dedupe by headline similarity
    const seen = new Set();
    const deduped = articles.filter(a => {
      const key = a.headline.slice(0, 40).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by tier then date
    deduped.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        articles: deduped.slice(0, 30),
        total: deduped.length,
        fetchedAt: new Date().toISOString(),
      }),
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
