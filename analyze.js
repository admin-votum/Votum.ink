exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { title, source, description } = JSON.parse(event.body);

    const prompt = `You are Votum's editorial analysis engine. Return ONLY valid JSON, no other text.

Headline: "${title}"
Source: "${source}"
Description: "${description || ''}"

{
  "the_point": "One sentence under 25 words. The actual fact, stripped of drama. Start with the subject.",
  "source_score": 72,
  "source_note": "One sentence about this outlet's track record for accuracy and transparency.",
  "coverage_spread": {"left": 35, "center": 40, "right": 25},
  "flags": [{"label": "max 5 words", "type": "caution|info|warn"}],
  "counter_story": {
    "exists": true,
    "source": "Source Name",
    "title": "A contrasting headline on this topic from a different perspective"
  }
}

Rules: source_score 0-100. coverage_spread sums to 100. Max 2 flags, only if genuinely applicable.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    const clean = data.content[0].text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(clean);

    return { statusCode: 200, headers, body: JSON.stringify(analysis) };

  } catch(err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        the_point: 'Analysis unavailable.',
        source_score: 50,
        source_note: '',
        coverage_spread: { left: 33, center: 34, right: 33 },
        flags: [],
        counter_story: { exists: false }
      })
    };
  }
};
