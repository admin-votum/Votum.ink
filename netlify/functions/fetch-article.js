// Votum / deFramed — Article Content Fetcher
// Fetches and extracts readable text from any article URL
// Used to send full article content to analyze-multi instead of just headline

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, headers, body: JSON.stringify({ error: 'url required' }) };

    // Fetch the article
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; deFramed/1.0; +https://deframed.net)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' - ', ' — ').trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
                   || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract OG title (often cleaner)
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
                      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : '';

    // Extract source name
    const ogSiteMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
                     || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);
    const source = ogSiteMatch ? ogSiteMatch[1].trim() : new URL(url).hostname.replace('www.', '');

    // Extract OG image
    const ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
                    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const image = ogImgMatch ? ogImgMatch[1].trim() : null;

    // Extract article body text — strip all HTML tags
    let bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000); // First 3000 chars is enough for scoring

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title: ogTitle || title,
        description: description,
        source,
        image,
        bodyText,
        url,
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
