// Source reach database
function getReach(sourceName) {
  if (!sourceName) return 1;
  const n = sourceName.toLowerCase().trim();

  const exactMatches = {
    'reuters': 185, 'associated press': 175, 'ap news': 175,
    'the new york times': 150, 'new york times': 150, 'nytimes': 150,
    'bbc news': 140, 'bbc': 140, 'cnn': 130,
    'the washington post': 100, 'washington post': 100,
    'fox news': 100, 'bloomberg': 90, 'usa today': 80,
    'the guardian': 75, 'guardian': 75, 'nbc news': 70,
    'abc news': 65, 'cbs news': 60, 'msnbc': 55,
    'time': 55, 'newsweek': 52, 'huffpost': 50,
    'politico': 45, 'new york post': 45, 'wall street journal': 40,
    'axios': 40, 'npr': 38, 'the hill': 35, 'forbes': 70,
    'business insider': 40, 'vox': 25, 'slate': 22,
    'the atlantic': 20, 'atlantic': 20, 'national review': 15,
    'daily wire': 18, 'breitbart': 12, 'daily beast': 12,
    'the dispatch': 8, 'the intercept': 6, 'reason': 6,
    'the federalist': 5, 'los angeles times': 20, 'chicago tribune': 8,
    'boston globe': 8, 'miami herald': 6, 'arizona republic': 4,
    'headtopics': 2, 'arizona capitol times': 2,
    'u.s. news': 15, 'us news': 15,
  };

  if (exactMatches[n]) return exactMatches[n];
  for (const [key, reach] of Object.entries(exactMatches)) {
    if (key.length > 4 && n.includes(key)) return reach;
  }
  return 2;
}

function rankScore(article) {
  const reach = getReach(article.source);
  const ageHours = (Date.now() - new Date(article.publishedAt)) / 3600000;
  const freshness = Math.max(0, 100 - (ageHours * 1.5));
  const reprint = Math.min(article.reprintCount || 0, 30);
  return (reach * 0.70) + (freshness * 0.20) + (reprint * 0.10);
}

function isSpam(article) {
  const source = (article.source || '').toLowerCase();
  const title = (article.title || '').toLowerCase();
  const ageHours = (Date.now() - new Date(article.publishedAt)) / 3600000;
  // Strict 3 day cutoff for freshness
  if (ageHours > 72) return true;
  const blocked = ['hotair','wnd','arcamax','dailysignal','daily signal',
    'headtopics','natural news','naturalnews','oann','one america',
    'epoch times','townhall','redstate','pjmedia','frontpagemag',
    'american thinker','lifesitenews','westernjournal','bizpacreview',
    'twitchy','thefederalist','cnsnews','theblaze','kbtx',
    'newspub','newspub_live','newsbreak','bundle_app','theeagle',
    'orlandoweekly','washingtonexaminer','the eagle','msn',
    'yahoo','aol','flipboard','ground','patch','rawstory',
    'dailykos','mediaite','thedailybeast','salon','alternet'];
  if (blocked.some(b => source.includes(b))) return true;
  if (['you won\'t believe','shocking','must see','goes viral'].some(s => title.includes(s))) return true;
  return false;
}

// RSS feeds — direct from source, free, unlimited, highest quality
const RSS_FEEDS = [
  // Tier 1 — Wire services
  {url:'https://feeds.reuters.com/reuters/topNews', source:'Reuters', bias:'center'},
  {url:'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source:'New York Times', bias:'left'},
  {url:'http://feeds.bbci.co.uk/news/world/rss.xml', source:'BBC News', bias:'center-left'},
  {url:'https://content.api.nytimes.com/svc/news/v3/all/recent.rss', source:'New York Times', bias:'left'},
  {url:'https://www.theguardian.com/world/rss', source:'The Guardian', bias:'left'},
  {url:'https://feeds.npr.org/1001/rss.xml', source:'NPR', bias:'center-left'},
  {url:'https://feeds.washingtonpost.com/rss/world', source:'Washington Post', bias:'left'},
  {url:'https://moxie.foxnews.com/google-publisher/politics.xml', source:'Fox News', bias:'right'},
  {url:'https://feeds.a.dj.com/rss/RSSWorldNews.xml', source:'Wall Street Journal', bias:'center-right'},
  {url:'https://www.politico.com/rss/politicopicks.xml', source:'Politico', bias:'center-left'},
  {url:'https://axios.com/feeds/feed.rss', source:'Axios', bias:'center-left'},
  {url:'https://thehill.com/rss/syndicator/19110', source:'The Hill', bias:'center'},
];

async function fetchRSS(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Votum/1.0; +https://votum.ink)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // Parse RSS XML manually — no dependencies needed
    const items = [];
    const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);

    for (const match of itemMatches) {
      const item = match[1];

      const getTag = (tag) => {
        const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'));
        return m ? (m[1] || m[2] || '').trim() : '';
      };

      const title = getTag('title');
      const link = getTag('link') || item.match(/<link[^>]*href="([^"]+)"/i)?.[1] || '';
      const desc = getTag('description').replace(/<[^>]*>/g,'').slice(0,200);
      const pubDate = getTag('pubDate') || getTag('dc:date') || '';
      const image = item.match(/url="([^"]+\.(?:jpg|png|webp|jpeg)[^"]*)"/i)?.[1] ||
                    item.match(/<media:content[^>]+url="([^"]+)"/i)?.[1] ||
                    item.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1] || null;

      if (title && link) {
        items.push({
          title,
          description: desc,
          url: link,
          image,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: feed.source,
          bias: feed.bias,
          reprintCount: 0,
        });
      }
    }

    // Sort newest first
    items.sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return items.slice(0, 8);

  } catch(e) { return []; }
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  const { state, max = 15 } = event.queryStringParameters || {};
  if (!state) return { statusCode: 400, headers, body: JSON.stringify({ error: 'state required' }) };

  const q = state.toLowerCase();
  const results = [];

  // 1. Fetch from RSS feeds in parallel — highest quality, free
  const rssPromises = RSS_FEEDS.map(feed => fetchRSS(feed));
  const rssResults = await Promise.allSettled(rssPromises);

  rssResults.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const feed = RSS_FEEDS[i];
      result.value.forEach(article => {
        // Filter for relevance to state/topic
        const text = (article.title + ' ' + article.description).toLowerCase();
        const isRelevant = text.includes(q) ||
          q === 'us politics' || q === 'world news' ||
          q.length > 8; // broad topic queries get all articles
        if (isRelevant || results.length < 5) {
          results.push(article);
        }
      });
    }
  });

  // 2. Supplement with GNews for state-specific content
  try {
    const qEncoded = encodeURIComponent(`${state} politics`);
    const gnewsRes = await fetch(
      `https://gnews.io/api/v4/search?q=${qEncoded}&lang=en&country=us&max=10&token=${process.env.GNEWS_KEY}`
    );
    const gnews = await gnewsRes.json();
    (gnews.articles || []).forEach(a => results.push({
      title: a.title, description: a.description,
      url: a.url, image: a.image,
      publishedAt: a.publishedAt,
      source: a.source?.name || 'Unknown',
      reprintCount: 0,
    }));
  } catch(e) {}

  // 3. Supplement with Newsdata
  try {
    const qEncoded = encodeURIComponent(`${state} politics`);
    const ndRes = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&q=${qEncoded}&country=us&language=en&category=politics`
    );
    const nd = await ndRes.json();
    (nd.results || []).forEach(a => results.push({
      title: a.title, description: a.description,
      url: a.link, image: a.image_url,
      publishedAt: a.pubDate,
      source: a.source_id || 'Unknown',
      reprintCount: 0,
    }));
  } catch(e) {}

  // 4. Perigon for reach data
  try {
    const qEncoded = encodeURIComponent(`${state} politics`);
    const pgRes = await fetch(
      `https://api.goperigon.com/v1/all?q=${qEncoded}&country=us&language=en&sortBy=date&pageSize=10`,
      { headers: { 'x-api-key': process.env.PERIGON_KEY } }
    );
    const pg = await pgRes.json();
    (pg.articles || []).forEach(a => results.push({
      title: a.title, description: a.description,
      url: a.url, image: a.imageUrl,
      publishedAt: a.publishedAt,
      source: a.source?.domain || 'Unknown',
      reprintCount: a.reprintCount || 0,
    }));
  } catch(e) {}

  // Dedupe, filter spam, rank
  const seen = new Set();
  const deduped = results.filter(a => {
    if (!a.title || a.title.length < 15) return false;
    if (isSpam(a)) return false;
    const key = a.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => rankScore(b) - rankScore(a));

  const ranked = deduped.slice(0, parseInt(max)).map(a => ({
    ...a,
    rankScore: Math.round(rankScore(a))
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ articles: ranked, total: ranked.length })
  };
};
