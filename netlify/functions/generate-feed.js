// deFramed — Feed Generator with Netlify Blobs
// Scheduled every 15 mins — fetches, analyzes, stores
// Users get instant pre-analyzed feed

const { getStore } = require('@netlify/blobs');

const TOP_SOURCES = [
  { url: 'https://feeds.reuters.com/reuters/topNews', source: 'Reuters' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'NYT' },
  { url: 'http://feeds.bbci.co.uk/news/rss.xml', source: 'BBC News' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
  { url: 'https://feeds.foxnews.com/foxnews/politics', source: 'Fox News' },
  { url: 'https://rss.politico.com/politics-news.xml', source: 'Politico' },
  { url: 'https://feeds.feedburner.com/breitbart', source: 'Breitbart' },
  { url: 'https://theintercept.com/feed/?rss', source: 'The Intercept' },
  { url: 'https://feeds.skynews.com/feeds/rss/world.xml', source: 'Sky News' },
  { url: 'https://feeds.washingtonpost.com/rss/world', source: 'Washington Post' },
];

function cleanHtml(str = '') {
  return str.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").trim();
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
                   || item.match(/<media:content[^>]+url="([^"]+)"/i)?.[1] || null;
        if (title && link && title.length > 15) {
          items.push({ title, url: link, source: feed.source, image, pubDate });
        }
      }
      return items.slice(0, 2);
    } catch(e) { return []; }
  }));

  const articles = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
  const seen = new Set();
  return articles.filter(a => {
    const key = a.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 20);
}

async function fetchArticleContent(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; deFramed/1.0)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return '';
    const html = await res.text();
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';
    const bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ').trim().slice(0, 2000);
    return description || bodyText;
  } catch(e) { return ''; }
}

async function analyzeArticle(article) {
  const articleContent = await fetchArticleContent(article.url);
  const content = `Headline: ${article.title}\nSource: ${article.source}\nContent: ${articleContent || 'Not available'}`;

  const PROMPT = `Evaluate this news article on six dimensions (0-100 each).
Return ONLY valid JSON:
{"scores":{"consensus":0,"source_quality":0,"evidence_strength":0,"bias_framing":0,"consistency":0,"constructive_value":0},"overall":0,"lean":"center","reasoning":"one sentence"}`;

  const calls = [
    { name:'Claude', url:'https://api.anthropic.com/v1/messages',
      headers:{'x-api-key':process.env.ANTHROPIC_KEY,'anthropic-version':'2023-06-01'},
      body:{ model:'claude-sonnet-4-6', max_tokens:300, system:PROMPT, messages:[{role:'user',content}] },
      parse:(d)=>d.content[0].text },
    { name:'ChatGPT', url:'https://api.openai.com/v1/chat/completions',
      headers:{'Authorization':`Bearer ${process.env.OPENAI_KEY}`},
      body:{ model:'gpt-4o-mini', max_tokens:300, messages:[{role:'system',content:PROMPT},{role:'user',content}] },
      parse:(d)=>d.choices[0].message.content },
    { name:'Grok', url:'https://api.x.ai/v1/chat/completions',
      headers:{'Authorization':`Bearer ${process.env.GROK_KEY}`},
      body:{ model:'grok-3', max_tokens:300, messages:[{role:'system',content:PROMPT},{role:'user',content}] },
      parse:(d)=>d.choices[0].message.content },
    { name:'Gemini', url:`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      headers:{},
      body:{ contents:[{parts:[{text:PROMPT+'\n\n'+content}]}], generationConfig:{maxOutputTokens:300,temperature:0.1} },
      parse:(d)=>d.candidates[0].content.parts[0].text },
    { name:'DeepSeek', url:'https://api.deepseek.com/v1/chat/completions',
      headers:{'Authorization':`Bearer ${process.env.DEEPSEEK_KEY}`},
      body:{ model:'deepseek-chat', max_tokens:300, messages:[{role:'system',content:PROMPT},{role:'user',content}] },
      parse:(d)=>d.choices[0].message.content },
  ];

  const results = (await Promise.allSettled(calls.map(async c => {
    const res = await fetch(c.url, {
      method:'POST',
      headers:{'Content-Type':'application/json',...c.headers},
      body:JSON.stringify(c.body),
      signal:AbortSignal.timeout(10000),
    });
    const data = await res.json();
    const text = c.parse(data).replace(/```json|```/g,'').trim();
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : text);
    return { model:c.name, ...parsed };
  }))).filter(r=>r.status==='fulfilled'&&r.value).map(r=>r.value);

  if (!results.length) return null;

  const overalls = results.map(r=>r.overall||50);
  const spreadVal = Math.max(...overalls)-Math.min(...overalls);
  const spread = spreadVal < 15 ? {desc:'Five minds largely agree.',color:'#3A7A4A'}
    : spreadVal < 30 ? {desc:'Models find different things worth noting.',color:'#7A7A4A'}
    : spreadVal < 45 ? {desc:'Significant disagreement. The debate itself is the signal.',color:'#8A4A3A'}
    : {desc:'Not a warning — an invitation. Read as a judge reads a contested case.',color:'#8A3A6A'};

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

exports.handler = async (event, context) => {
  const headers = { 'Access-Control-Allow-Origin':'*', 'Content-Type':'application/json' };

  try {
    const store = getStore('deframed-feed');

    // Check if we have cached feed less than 15 mins old
    const cached = await store.get('feed', { type:'json' }).catch(()=>null);
    if (cached && cached.generatedAt) {
      const age = (Date.now() - new Date(cached.generatedAt)) / 60000;
      if (age < 15) {
        return { statusCode:200, headers, body:JSON.stringify(cached) };
      }
    }

    // Generate fresh feed
    console.log('Generating fresh feed...');
    const headlines = await fetchHeadlines();
    const analyzed = [];

    for (let i = 0; i < headlines.length; i += 4) {
      const batch = headlines.slice(i, i+4);
      const results = await Promise.allSettled(batch.map(analyzeArticle));
      results.forEach(r => { if (r.status==='fulfilled'&&r.value) analyzed.push(r.value); });
    }

    const feed = { articles:analyzed, generatedAt:new Date().toISOString(), count:analyzed.length };

    // Store in blob
    await store.setJSON('feed', feed);

    return { statusCode:200, headers, body:JSON.stringify(feed) };

  } catch(err) {
    console.error('generate-feed error:', err);
    return { statusCode:500, headers, body:JSON.stringify({ error:err.message }) };
  }
};
