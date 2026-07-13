// deFramed — Instant feed reader
// Reads pre-analyzed feed from Netlify Blobs
// Returns instantly — no generation needed

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',
  };

  try {
    const store = getStore('deframed-feed');
    const feed = await store.get('feed', { type: 'json' });

    if (!feed) {
      return new Response(JSON.stringify({ articles: [], empty: true }), { headers });
    }

    return new Response(JSON.stringify(feed), { headers });

  } catch(err) {
    return new Response(JSON.stringify({ articles: [], error: err.message }), { status: 500, headers });
  }
};
