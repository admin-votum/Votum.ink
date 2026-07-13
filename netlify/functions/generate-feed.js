// deFramed — Feed Generator
// Runs on schedule every 15 minutes
// Fetches top headlines, analyzes with 5 models, saves as feed.json
// Users get instant pre-analyzed feed with zero wait

const TOP_SOURCES = [
  { url: 'https://feeds.reuters.com/reuters/topNews', source: 'Reuters' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'NYT' },
  { url: 'http://feeds.bbci.co.uk/news/rss.xml', source: 'BBC News' },
  { url: 'https://feeds.washingtonpost.com/rss/world', source: 'Washington Post' },
  { url: 'https://feeds.feedburner.com/breitbart', source: 'Breitbart' },
  { url: 'https://theintercept.com/feed/?rss', source: 'The Intercept' },
  { url: 'https://rss.politico.com/politics-news.xml', source: 'Politico' },
  { url: 'https://feeds.foxnews.com/foxnews/politics', source: 'Fox News' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
  { url: 'https://feeds.skynews.com/feeds/rss/world.xml', source: 'Sky News' },
];

function cleanHtml(str = '') {
  return str.replace(/<[^>]*>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").trim();
}

async function fetchHeadlines() {
  const results = await Promise.allSettled(TOP_SOURCES.map(async feed => {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; deFramed/1.0)' },
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
        const pubDate = getTag('pubDate') || '';
        const image = item.match(/url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)?.[1]
                   || item.match(/<media:content[^>]+url="([^"]+)"/i)?.[1]
                   || null;
        if (title && link && title.length > 15) {
          items.push({ title, url: link, source: feed.source, image, pubDate });
        }
      }
      return items.slice(0, 3); // Top 3 per source
    } catch(e) { return []; }
  }));

  const articles = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
  
  // Dedupe by title similarity
  const seen = new Set();
  return articles.filter(a => {
    const key = a.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 20); // Max 20 articles
}

async function fetchArticleContent(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; deFramed/1.0; +https://deframed.net)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return '';
    const html = await res.text();

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
                   || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract body text
    const bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000);

    return description || bodyText;
  } catch(e) { return ''; }
}

async function analyzeArticle(article) {
  const models = ['claude', 'chatgpt', 'grok', 'gemini', 'deepseek'];
  
  const modelConfigs = {
    claude: {
      url: 'https://api.anthropic.com/v1/messages',
      headers: { 'x-api-key': process.env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: (prompt, content) => ({
        model: 'claude-sonnet-4-6', max_tokens: 400,
        system: prompt,
        messages: [{ role: 'user', content }]
      }),
      parse: (d) => d.content[0].text,
    },
    chatgpt: {
      url: 'https://api.openai.com/v1/chat/completions',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_KEY}` },
      body: (prompt, content) => ({
        model: 'gpt-4o-mini', max_tokens: 400,
        messages: [{ role: 'system', content: prompt }, { role: 'user', content }]
      }),
      parse: (d) => d.choices[0].message.content,
    },
    grok: {
      url: 'https://api.x.ai/v1/chat/completions',
      headers: { 'Authorization': `Bearer ${process.env.GROK_KEY}` },
      body: (prompt, content) => ({
        model: 'grok-3', max_tokens: 400,
        messages: [{ role: 'system', content: prompt }, { role: 'user', content }]
      }),
      parse: (d) => d.choices[0].message.content,
    },
    gemini: {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      headers: {},
      body: (prompt, content) => ({
        contents: [{ parts: [{ text: prompt + '\n\n' + content }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.1 }
      }),
      parse: (d) => d.candidates[0].content.parts[0].text,
    },
    deepseek: {
      url: 'https://api.deepseek.com/v1/chat/completions',
      headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_KEY}` },
      body: (prompt, content) => ({
        model: 'deepseek-chat', max_tokens: 400,
        messages: [{ role: 'system', content: prompt }, { role: 'user', content }]
      }),
      parse: (d) => d.choices[0].message.content,
    },
  };

  const PROMPT = `Evaluate this news headline and source on six dimensions (0-100 each).
Return ONLY valid JSON:
{
  "scores": {"consensus":0,"source_quality":0,"evidence_strength":0,"bias_framing":0,"consistency":0,"constructive_value":0},
  "overall": 0,
  "lean": "center",
  "reasoning": "one sentence"
}`;

  const content = `Headline: ${article.title}\nSource: ${article.source}\nArticle content: ${await fetchArticleContent(article.url) || 'No content available'}`;

  const calls = Object.entries(modelConfigs).map(async ([name, config]) => {
    try {
      const res = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...config.headers },
        body: JSON.stringify(config.body(PROMPT, content)),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      const text = config.parse(data).replace(/```json|```/g, '').trim();
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : text);
      const modelNames = { claude:'Claude', chatgpt:'ChatGPT', grok:'Grok', gemini:'Gemini', deepseek:'DeepSeek' };
      return { model: modelNames[name], ...parsed };
    } catch(e) { return null; }
  });

  const results = (await Promise.allSettled(calls))
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);

  if (!results.length) return null;

  const overalls = results.map(r => r.overall || 50);
  const spreadVal = Math.max(...overalls) - Math.min(...overalls);

  function spreadLabel(s) {
    if (s < 15) return { label:'Strong consensus', desc:'Five minds largely agree on how to read this piece.', color:'#3A7A4A' };
    if (s < 30) return { label:'Partial consensus', desc:'Models find different things worth noting. Worth a closer read.', color:'#7A7A4A' };
    if (s < 45) return { label:'Models debate this — worth your full attention', desc:'Significant disagreement. The debate itself is the signal.', color:'#8A4A3A' };
    return { label:'Five minds, no consensus', desc:'Not a warning — an invitation. Read as a judge reads a contested case.', color:'#8A3A6A' };
  }

  const spread = spreadLabel(spreadVal);

  return {
    id: article.url,
    headline: article.title,
    source: article.source,
    url: article.url,
    image: article.image,
    publishedAt: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
    models: results,
    spreadVal,
    signal: spread.desc,
    spreadColor: spread.color,
    analyzedAt: new Date().toISOString(),
  };
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    console.log('Fetching headlines...');
    const headlines = await fetchHeadlines();
    console.log(`Got ${headlines.length} headlines`);

    // Analyze all in parallel (with some throttling)
    const analyzed = [];
    for (let i = 0; i < headlines.length; i += 5) {
      const batch = headlines.slice(i, i + 5);
      const results = await Promise.allSettled(batch.map(analyzeArticle));
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) analyzed.push(r.value);
      });
    }

    console.log(`Analyzed ${analyzed.length} articles`);

    const feed = {
      articles: analyzed,
      generatedAt: new Date().toISOString(),
      count: analyzed.length,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(feed),
    };

  } catch(err) {
    console.error('generate-feed error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
