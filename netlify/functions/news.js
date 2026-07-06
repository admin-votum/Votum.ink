// Source reach database — monthly unique readers (millions)
// Used to rank articles by outlet credibility and reach
const SOURCE_REACH = {
  // Tier 1 — 100M+ monthly readers
  'reuters': 185, 'ap': 175, 'associated press': 175,
  'new york times': 150, 'nytimes': 150,
  'bbc': 140, 'bbc news': 140,
  'cnn': 130, 'washington post': 100,
  'fox news': 100, 'foxnews': 100,

  // Tier 2 — 50M+
  'bloomberg': 90, 'usa today': 80,
  'the guardian': 75, 'guardian': 75,
  'nbcnews': 70, 'nbc news': 70,
  'abc news': 65, 'abcnews': 65,
  'cbsnews': 60, 'cbs news': 60,
  'msnbc': 55, 'time': 55,
  'newsweek': 52, 'huffpost': 50,

  // Tier 3 — 20M+
  'politico': 45, 'axios': 40,
  'npr': 38, 'the hill': 35,
  'forbes': 70, 'business insider': 40,
  'vox': 25, 'slate': 22,
  'the atlantic': 20, 'atlantic': 20,

  // Tier 4 — 5M+
  'national review': 15, 'the dispatch': 8,
  'reason': 6, 'daily wire': 18,
  'new york post': 45, 'nypost': 45,
  'breitbart': 12, 'the federalist': 5,
  'wall street journal': 40, 'wsj': 40,
  'daily beast': 12, 'mother jones': 8,
  'the intercept': 6, 'jacobin': 5,

  // Tier 5 — Local/Regional
  'atlanta journal': 8, 'ajc': 8,
  'miami herald': 6, 'dallas morning': 5,
  'chicago tribune': 8, 'la times': 20,
  'los angeles times': 20, 'boston globe': 8,
  'philadelphia inquirer': 5, 'arizona republic': 4,
  'detroit free press': 4, 'minneapolis star': 3,
};

function getReach(sourceName) {
  if (!sourceName) return 1;
  const n = sourceName.toLowerCase();
  for (const [key, reach] of Object.entries(SOURCE_REACH)) {
    if (n.includes(key)) return reach;
  }
  return 2; // Unknown source — low but not zero
}

function rankScore(article) {
  const reach = getReach(article.source);
  const ageHours = (Date.now() - new Date(article.publishedAt)) / 3600000;
  const freshness = Math.max(0, 100 - (ageHours * 1.5)); // Decays over ~67 hours
  const reprint = Math.min(article.reprintCount || 0, 30); // Cap at 30
  return (reach * 0.5) + (freshness * 0.35) + (reprint * 0.15);
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  const { state, max = 8 } = event.queryStringParameters || {};
  if (!state) return { statusCode: 400, headers, body: JSON.stringify({ error: 'state required' }) };

  const q = encodeURIComponent(`${state} politics`);
  const results = [];

  try {
    const gnewsRes = await fetch(
      `https://gnews.io/api/v4/search?q=${q}&lang=en&country=us&max=${max}&token=${process.env.GNEWS_KEY}`
    );
    const gnews = await gnewsRes.json();
    (gnews.articles || []).forEach(a => results.push({
      title: a.title, description: a.description,
      url: a.url, image: a.image,
      publishedAt: a.publishedAt,
      source: a.source?.name || 'Unknown',
      reach: getReach(a.source?.name),
      reprintCount: 0,
      state
    }));
  } catch(e) {}

  try {
    const ndRes = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&q=${q}&country=us&language=en&category=politics`
    );
    const nd = await ndRes.json();
    (nd.results || []).forEach(a => results.push({
      title: a.title, description: a.description,
      url: a.link, image: a.image_url,
      publishedAt: a.pubDate,
      source: a.source_id || 'Unknown',
      reach: getReach(a.source_id),
      reprintCount: 0,
      state
    }));
  } catch(e) {}

  try {
    const pgRes = await fetch(
      `https://api.goperigon.com/v1/all?q=${q}&country=us&language=en&sortBy=date&pageSize=${max}`,
      { headers: { 'x-api-key': process.env.PERIGON_KEY } }
    );
    const pg = await pgRes.json();
    (pg.articles || []).forEach(a => results.push({
      title: a.title, description: a.description,
      url: a.url, image: a.imageUrl,
      publishedAt: a.publishedAt,
      source: a.source?.domain || 'Unknown',
      reach: getReach(a.source?.domain),
      reprintCount: a.reprintCount || 0,
      state
    }));
  } catch(e) {}

  // Dedupe by title
  const seen = new Set();
  const deduped = results.filter(a => {
    if (!a.title) return false;
    const key = a.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Rank by reach + freshness + reprint count
  deduped.sort((a, b) => rankScore(b) - rankScore(a));

  // Add rank metadata for UI display
  const ranked = deduped.map(a => ({
    ...a,
    rankScore: Math.round(rankScore(a))
  }));

  return { statusCode: 200, headers, body: JSON.stringify({ articles: ranked }) };
};
