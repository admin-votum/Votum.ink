exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  const { state, max = 6 } = event.queryStringParameters || {};
  if (!state) return { statusCode: 400, headers, body: JSON.stringify({ error: 'state required' }) };

  const q = encodeURIComponent(`${state} politics`);
  const results = [];

  try {
    // GNews
    const gnewsRes = await fetch(
      `https://gnews.io/api/v4/search?q=${q}&lang=en&country=us&max=${max}&token=${process.env.GNEWS_KEY}`
    );
    const gnews = await gnewsRes.json();
    (gnews.articles || []).forEach(a => results.push({
      title: a.title, description: a.description,
      url: a.url, image: a.image,
      publishedAt: a.publishedAt,
      source: a.source?.name || 'Unknown',
      state
    }));
  } catch(e) {}

  try {
    // Newsdata
    const ndRes = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&q=${q}&country=us&language=en&category=politics`
    );
    const nd = await ndRes.json();
    (nd.results || []).forEach(a => results.push({
      title: a.title, description: a.description,
      url: a.link, image: a.image_url,
      publishedAt: a.pubDate,
      source: a.source_id || 'Unknown',
      state
    }));
  } catch(e) {}

  try {
    // Perigon
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
      state,
      reprintCount: a.reprintCount || 0
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
  }).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return { statusCode: 200, headers, body: JSON.stringify({ articles: deduped }) };
};
