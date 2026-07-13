const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',
  };

  try {
    const store = getStore('deframed-feed');
    const feed = await store.get('feed', { type: 'json' }).catch(()=>null);

    if (!feed) {
      return { statusCode:200, headers, body:JSON.stringify({ articles:[], empty:true }) };
    }

    return { statusCode:200, headers, body:JSON.stringify(feed) };

  } catch(err) {
    return { statusCode:500, headers, body:JSON.stringify({ articles:[], error:err.message }) };
  }
};
