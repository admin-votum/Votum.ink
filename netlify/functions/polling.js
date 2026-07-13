// Votum — Live Polling Data
// Fetches from VoteHub API — free, no key needed
// Returns approval + generic ballot with week-over-week movement

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600', // Cache 1 hour
  };

  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoWeeksAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch Trump approval — last 7 days and previous 7 days
    const [approvalRecent, approvalPrev, genericRecent, genericPrev] = await Promise.all([
      fetch(`https://api.votehub.com/polls?poll_type=approval&subject=donald-trump&from_date=${weekAgo}&to_date=${today}`)
        .then(r => r.json()),
      fetch(`https://api.votehub.com/polls?poll_type=approval&subject=donald-trump&from_date=${twoWeeksAgo}&to_date=${weekAgo}`)
        .then(r => r.json()),
      fetch(`https://api.votehub.com/polls?poll_type=generic-ballot&from_date=${weekAgo}&to_date=${today}`)
        .then(r => r.json()),
      fetch(`https://api.votehub.com/polls?poll_type=generic-ballot&from_date=${twoWeeksAgo}&to_date=${weekAgo}`)
        .then(r => r.json()),
    ]);

    // Calculate approval average
    function avgApproval(polls) {
      if (!polls?.polls?.length) return null;
      const approvals = polls.polls
        .map(p => p.answers?.find(a => a.choice === 'Approve')?.pct)
        .filter(Boolean);
      return approvals.length ? Math.round(approvals.reduce((a, b) => a + b, 0) / approvals.length * 10) / 10 : null;
    }

    // Calculate generic ballot averages
    function avgGeneric(polls) {
      if (!polls?.polls?.length) return null;
      const dems = polls.polls.map(p => p.answers?.find(a => a.choice === 'Dem')?.pct).filter(Boolean);
      const reps = polls.polls.map(p => p.answers?.find(a => a.choice === 'Rep')?.pct).filter(Boolean);
      return {
        dem: dems.length ? Math.round(dems.reduce((a, b) => a + b, 0) / dems.length * 10) / 10 : null,
        rep: reps.length ? Math.round(reps.reduce((a, b) => a + b, 0) / reps.length * 10) / 10 : null,
      };
    }

    const approvalNow = avgApproval(approvalRecent);
    const approvalThen = avgApproval(approvalPrev);
    const genericNow = avgGeneric(genericRecent);
    const genericThen = avgGeneric(genericPrev);

    const result = {
      approval: {
        current: approvalNow,
        previous: approvalThen,
        change: approvalNow && approvalThen ? Math.round((approvalNow - approvalThen) * 10) / 10 : null,
        polls: approvalRecent?.polls?.length || 0,
      },
      generic: {
        dem: {
          current: genericNow?.dem,
          previous: genericThen?.dem,
          change: genericNow?.dem && genericThen?.dem ? Math.round((genericNow.dem - genericThen.dem) * 10) / 10 : null,
        },
        rep: {
          current: genericNow?.rep,
          previous: genericThen?.rep,
          change: genericNow?.rep && genericThen?.rep ? Math.round((genericNow.rep - genericThen.rep) * 10) / 10 : null,
        },
        polls: genericRecent?.polls?.length || 0,
      },
      updatedAt: new Date().toISOString(),
    };

    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
