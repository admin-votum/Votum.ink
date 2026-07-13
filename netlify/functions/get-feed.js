// deFramed — Get Feed
// Lightweight proxy to generate-feed with CORS headers
// deframed.net calls this for instant feed

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',
  };

  try {
    // Call generate-feed internally
    const res = await fetch(`${process.env.URL}/.netlify/functions/generate-feed`);
    const data = await res.json();
    return { statusCode:200, headers, body:JSON.stringify(data) };
  } catch(err) {
    return { statusCode:500, headers, body:JSON.stringify({ articles:[], error:err.message }) };
  }
};
