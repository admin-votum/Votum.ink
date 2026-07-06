// Source reach scoring — monthly unique readers (millions)
// Handled inside getReach() function below

function getReach(sourceName) {
  if (!sourceName) return 1;
  const n = sourceName.toLowerCase().trim();

  // Exact or starts-with matches first to avoid false positives
  const exactMatches = {
    'reuters': 185,
    'associated press': 175,
    'ap news': 175,
    'the new york times': 150,
    'new york times': 150,
    'nytimes': 150,
    'bbc news': 140,
    'bbc': 140,
    'cnn': 130,
    'the washington post': 100,
    'washington post': 100,
    'fox news': 100,
    'bloomberg': 90,
    'usa today': 80,
    'the guardian': 75,
    'guardian': 75,
    'nbc news': 70,
    'abc news': 65,
    'cbs news': 60,
    'msnbc': 55,
    'time': 55,
    'newsweek': 52,
    'huffpost': 50,
    'politico': 45,
    'new york post': 45,
    'wall street journal': 40,
    'axios': 40,
    'npr': 38,
    'the hill': 35,
    'forbes': 70,
    'business insider': 40,
    'vox': 25,
    'slate': 22,
    'the atlantic': 20,
    'atlantic': 20,
    'national review': 15,
    'daily wire': 18,
    'breitbart': 12,
    'daily beast': 12,
    'the dispatch': 8,
    'mother jones': 8,
    'the intercept': 6,
    'reason': 6,
    'jacobin': 5,
    'the federalist': 5,
    'los angeles times': 20,
    'la times': 20,
    'chicago tribune': 8,
    'boston globe': 8,
    'miami herald': 6,
    'philadelphia inquirer': 5,
    'arizona republic': 4,
    'dallas morning news': 5,
    'detroit free press': 4,
    'minneapolis star tribune': 3,
    'atlanta journal-constitution': 8,
    'ajc': 8,
    'headtopics': 2,
    'nogales international': 2,
    'arizona capitol times': 2,
    'azcapitoltimes': 2,
    'east valley tribune': 2,
    'eastvalleytribune': 2,
    'standard speaker': 2,
    'martinsvillebulletin': 2,
    'florida phoenix': 2,
    'michigan advance': 2,
    'georgia recorder': 2,
    'nevada current': 2,
    'wisconsin examiner': 2,
    'colorado sun': 2,
    'minnesota reformer': 2,
    'virginia mercury': 2,
    'u.s. news': 15,
    'us news': 15,
    'usnews': 15,
    'usatoday': 80,
    'headtopics.com': 2,
  };

  // Check exact match first
  if (exactMatches[n]) return exactMatches[n];

  // Then check if source contains a key (for domain variations)
  for (const [key, reach] of Object.entries(exactMatches)) {
    if (key.length > 4 && n.includes(key)) return reach;
  }

  return 2; // Unknown — low reach
}

function rankScore(article) {
  const reach = getReach(article.source);
  const ageHours = (Date.now() - new Date(article.publishedAt)) / 3600000;
  const freshness = Math.max(0, 100 - (ageHours * 1.5));
  const reprint = Math.min(article.reprintCount || 0, 30);
  // Reach weighted much more heavily to push high-credibility sources up
  return (reach * 0.70) + (freshness * 0.20) + (reprint * 0.10);
}

function isSpam(article) {
  const reach = getReach(article.source);
  const title = (article.title || '').toLowerCase();
  // Filter out very low reach unknown sources and clickbait patterns
  if (reach < 2) return true;
  if (!article.title || article.title.length < 20) return true;
  if (['click here','you won\'t believe','shocking','must see'].some(s => title.includes(s))) return true;
  return false;
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

  // Filter spam and dedupe by title
  const seen = new Set();
  const deduped = results.filter(a => {
    if (!a.title) return false;
    if (isSpam(a)) return false;
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
