// Votum Cross-AI Analytics Engine
// Five minds. One article. Agree to disagree.
// Claude · Grok · ChatGPT · Gemini · DeepSeek
// No SDK dependencies — pure fetch

function buildScoringPrompt(model) {
  const personalities = {
    claude: `You are Claude, evaluating this article for Votum's cross-AI clarity engine. You weight Evidence Strength and Constructive Value highly. Honest, nuanced assessment.`,
    grok: `You are Grok, evaluating this article for Votum's cross-AI clarity engine. You weight Consistency and Framing detection highly. Direct, no-nonsense assessment.`,
    chatgpt: `You are GPT-4, evaluating this article for Votum's cross-AI clarity engine. You weight Source Quality and Consensus highly. Balanced, methodical assessment.`,
    gemini: `You are Gemini, evaluating this article for Votum's cross-AI clarity engine. You weight Bias & Framing and context highly. Contextual assessment.`,
    deepseek: `You are DeepSeek, evaluating this article for Votum's cross-AI clarity engine. You weight Consensus and Source Quality highly. Systematic assessment.`,
  };

  return `${personalities[model]}

Evaluate on six dimensions (0-100 each):
1. CONSENSUS — How consistently covered across media spectrum?
2. SOURCE_QUALITY — How credible is this publication?
3. EVIDENCE_STRENGTH — Are claims supported by data and named sources?
4. BIAS_FRAMING — How neutral is the language? Headline accurate to content?
5. CONSISTENCY — Does article deliver what headline promises?
6. CONSTRUCTIVE_VALUE — Adds understanding or generates heat?

Also provide:
- LEAN: left / center-left / center / center-right / right
- FLAGS: array of specific issues found (max 3)
- REASONING: one sentence core finding

Return ONLY valid JSON, no markdown:
{
  "scores": {
    "consensus": 0,
    "source_quality": 0,
    "evidence_strength": 0,
    "bias_framing": 0,
    "consistency": 0,
    "constructive_value": 0
  },
  "overall": 0,
  "lean": "center",
  "flags": [],
  "reasoning": ""
}`;
}

function calcOverall(scores) {
  if (!scores) return 50;
  const weights = {
    consensus: 0.15, source_quality: 0.20,
    evidence_strength: 0.20, bias_framing: 0.20,
    consistency: 0.15, constructive_value: 0.10,
  };
  return Math.round(
    Object.entries(weights).reduce((sum, [k, w]) => sum + (scores[k] || 50) * w, 0)
  );
}

function getSpreadSignal(results) {
  const overalls = results.map(s => s.overall);
  const spread = Math.max(...overalls) - Math.min(...overalls);
  if (spread < 15) return { level:'consensus', label:'Strong consensus across models', desc:'Five minds largely agree on how to read this piece.', color:'#3A7A4A' };
  if (spread < 30) return { level:'partial', label:'Partial consensus — some perspectives differ', desc:'Models find different things worth noting. Worth a closer read.', color:'#7A5A2A' };
  if (spread < 45) return { level:'contested', label:'Models debate this — worth your full attention', desc:'Significant disagreement between perspectives. The debate itself is the signal.', color:'#8A4A3A' };
  return { level:'debate', label:'Five minds, five readings — this is the interesting one', desc:'Substantial disagreement. Not a warning — an invitation. Read as a judge reads a contested case.', color:'#8A3A6A' };
}

function getPerspectiveConsensus(results) {
  const leans = results.map(r => r.lean || 'center');
  const counts = leans.reduce((acc, l) => { acc[l]=(acc[l]||0)+1; return acc; }, {});
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  if (sorted[0][1] >= 4) return sorted[0][0];
  if (sorted[0][1] >= 3) return `Leaning ${sorted[0][0]}`;
  return 'Contested — perspectives differ across models';
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  // Find JSON object
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  return JSON.parse(clean);
}

async function callClaude(title, description, source) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: buildScoringPrompt('claude'),
      messages: [{ role: 'user', content: `Title: ${title}\nSource: ${source}\nDescription: ${description}` }]
    })
  });
  const data = await res.json();
  const parsed = parseJSON(data.content[0].text);
  parsed.overall = calcOverall(parsed.scores);
  return { model: 'Claude', ...parsed };
}

async function callOpenAI(title, description, source) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini', max_tokens: 600,
      messages: [
        { role: 'system', content: buildScoringPrompt('chatgpt') },
        { role: 'user', content: `Title: ${title}\nSource: ${source}\nDescription: ${description}` }
      ]
    })
  });
  const data = await res.json();
  const parsed = parseJSON(data.choices[0].message.content);
  parsed.overall = calcOverall(parsed.scores);
  return { model: 'ChatGPT', ...parsed };
}

async function callGrok(title, description, source) {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROK_KEY}` },
    body: JSON.stringify({
      model: 'grok-beta', max_tokens: 600,
      messages: [
        { role: 'system', content: buildScoringPrompt('grok') },
        { role: 'user', content: `Title: ${title}\nSource: ${source}\nDescription: ${description}` }
      ]
    })
  });
  const data = await res.json();
  const parsed = parseJSON(data.choices[0].message.content);
  parsed.overall = calcOverall(parsed.scores);
  return { model: 'Grok', ...parsed };
}

async function callGemini(title, description, source) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildScoringPrompt('gemini') + `\n\nTitle: ${title}\nSource: ${source}\nDescription: ${description}` }] }],
        generationConfig: { maxOutputTokens: 600 }
      })
    }
  );
  const data = await res.json();
  const parsed = parseJSON(data.candidates[0].content.parts[0].text);
  parsed.overall = calcOverall(parsed.scores);
  return { model: 'Gemini', ...parsed };
}

async function callDeepSeek(title, description, source) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat', max_tokens: 600,
      messages: [
        { role: 'system', content: buildScoringPrompt('deepseek') },
        { role: 'user', content: `Title: ${title}\nSource: ${source}\nDescription: ${description}` }
      ]
    })
  });
  const data = await res.json();
  const parsed = parseJSON(data.choices[0].message.content);
  parsed.overall = calcOverall(parsed.scores);
  return { model: 'DeepSeek', ...parsed };
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  try {
    const { title, description, source } = JSON.parse(event.body || '{}');
    if (!title) return { statusCode:400, headers, body: JSON.stringify({ error:'title required' }) };

    // Fire all 5 in parallel — graceful degradation if any fail
    const [claude, chatgpt, grok, gemini, deepseek] = await Promise.allSettled([
      callClaude(title, description||'', source||''),
      callOpenAI(title, description||'', source||''),
      callGrok(title, description||'', source||''),
      callGemini(title, description||'', source||''),
      callDeepSeek(title, description||'', source||''),
    ]);

    const results = [claude, chatgpt, grok, gemini, deepseek]
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    // Log failures for debugging
    [claude, chatgpt, grok, gemini, deepseek].forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`Model ${i} failed:`, r.reason?.message || r.reason);
      }
    });

    if (!results.length) throw new Error('All models failed');

    const spread = getSpreadSignal(results);
    const perspective_consensus = getPerspectiveConsensus(results);

    const dimensions = ['consensus','source_quality','evidence_strength','bias_framing','consistency','constructive_value'];
    const dimension_spreads = dimensions.map(dim => {
      const vals = results.map(r => r.scores?.[dim] || 0);
      return {
        dimension: dim,
        spread: Math.max(...vals) - Math.min(...vals),
        average: Math.round(vals.reduce((a,b)=>a+b,0) / vals.length),
      };
    }).sort((a,b) => b.spread - a.spread);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        models: results,
        spread,
        perspective_consensus,
        dimension_spreads,
        most_contested: dimension_spreads[0],
        models_count: results.length,
      }),
    };

  } catch(err) {
    console.error('analyze-multi error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
