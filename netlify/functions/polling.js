// Votum — Live Polling Data
// Scrapes RealClearPolitics polling averages
// RCP is publicly accessible from servers

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600',
  };

  try {
    // Fetch Trump approval from RCP
    const [approvalRes, genericRes] = await Promise.all([
      fetch('https://www.realclearpolling.com/polls/approval/trump-job-approval', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(8000),
      }),
      fetch('https://www.realclearpolling.com/polls/party/generic-congressional-ballot', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    const approvalHtml = await approvalRes.text();
    const genericHtml = await genericRes.text();

    // Extract RCP averages from HTML
    // RCP embeds data in JSON within script tags
    function extractRCPData(html) {
      // Look for polling data in script tags
      const scriptMatch = html.match(/window\.__RCP_DATA__\s*=\s*({[\s\S]*?});/);
      if (scriptMatch) {
        try {
          return JSON.parse(scriptMatch[1]);
        } catch(e) {}
      }

      // Fallback: look for average in table
      const avgMatch = html.match(/RCP Average[^<]*<[^>]+>[^<]*<[^>]+>([\d.]+)[^<]*<[^>]+>([\d.]+)/i);
      if (avgMatch) {
        return { approve: parseFloat(avgMatch[1]), disapprove: parseFloat(avgMatch[2]) };
      }

      // Try JSON-LD
      const jsonMatch = html.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch(e) {}
      }

      return null;
    }

    // Try to extract numbers directly from page
    function extractNumbers(html, type) {
      if (type === 'approval') {
        // Look for percentage patterns near "RCP Average" or "Average"
        const patterns = [
          /Average.*?([\d]{2}\.[\d])\s*[|]\s*([\d]{2}\.[\d])/i,
          /RCP.*?(\d{2}\.\d)\D+(\d{2}\.\d)/,
          /"approve":\s*([\d.]+).*?"disapprove":\s*([\d.]+)/,
          /Approve[^0-9]*([\d]{2,3}(?:\.\d)?)[^0-9]*([\d]{2,3}(?:\.\d)?)\s*Disapprove/i,
        ];
        for (const p of patterns) {
          const m = html.match(p);
          if (m) return { approve: parseFloat(m[1]), disapprove: parseFloat(m[2]) };
        }
      }
      if (type === 'generic') {
        const patterns = [
          /Democrat[^0-9]*([\d]{2,3}(?:\.\d)?)[^0-9]*([\d]{2,3}(?:\.\d)?)\s*Republican/i,
          /Dem[^0-9]*([\d]{2}\.[\d])[^0-9]*([\d]{2}\.[\d])/i,
          /"dem":\s*([\d.]+).*?"rep":\s*([\d.]+)/,
        ];
        for (const p of patterns) {
          const m = html.match(p);
          if (m) return { dem: parseFloat(m[1]), rep: parseFloat(m[2]) };
        }
      }
      return null;
    }

    const approval = extractNumbers(approvalHtml, 'approval');
    const generic = extractNumbers(genericHtml, 'generic');

    // If scraping fails, use latest known values as fallback
    // Trump approval: ~43%, Generic ballot: D+6
    const fallbackApproval = { approve: 43.2, disapprove: 53.1 };
    const fallbackGeneric = { dem: 44.8, rep: 38.6 };

    const approvalData = approval || fallbackApproval;
    const genericData = generic || fallbackGeneric;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        approval: {
          current: approvalData.approve,
          disapprove: approvalData.disapprove,
          net: Math.round((approvalData.approve - approvalData.disapprove) * 10) / 10,
          source: approval ? 'RealClearPolling' : 'fallback',
        },
        generic: {
          dem: { current: genericData.dem },
          rep: { current: genericData.rep },
          advantage: genericData.dem > genericData.rep
            ? `D+${Math.round((genericData.dem - genericData.rep) * 10) / 10}`
            : `R+${Math.round((genericData.rep - genericData.dem) * 10) / 10}`,
          source: generic ? 'RealClearPolling' : 'fallback',
        },
        updatedAt: new Date().toISOString(),
      }),
    };

  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
