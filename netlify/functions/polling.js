// Votum — Live Polling Data from VoteHub API
// No cache — lightweight enough to call fresh each time

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600',
  };

  try {
    // Fetch Trump approval and generic ballot in parallel
    const [approvalRes, genericRes] = await Promise.all([
      fetch('https://api.votehub.com/polls?poll_type=approval&subject=donald-trump', {
        signal: AbortSignal.timeout(8000),
      }),
      fetch('https://api.votehub.com/polls?poll_type=generic-ballot', {
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    const approvalData = await approvalRes.json();
    const genericData = await genericRes.json();

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const sixtyDays = 60 * 24 * 60 * 60 * 1000;

    // Filter polls by date
    const recentApproval = (approvalData.polls || []).filter(p => 
      new Date(p.end_date) > new Date(now - thirtyDays)
    );
    const prevApproval = (approvalData.polls || []).filter(p => {
      const d = new Date(p.end_date);
      return d > new Date(now - sixtyDays) && d <= new Date(now - thirtyDays);
    });
    const recentGeneric = (genericData.polls || []).filter(p =>
      new Date(p.end_date) > new Date(now - thirtyDays)
    );
    const prevGeneric = (genericData.polls || []).filter(p => {
      const d = new Date(p.end_date);
      return d > new Date(now - sixtyDays) && d <= new Date(now - thirtyDays);
    });

    function avgApprove(polls) {
      const vals = polls.map(p => p.answers?.find(a => a.choice === 'Approve')?.pct).filter(Boolean);
      return vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length * 10) / 10 : null;
    }

    function avgGeneric(polls) {
      const dems = polls.map(p => p.answers?.find(a => a.choice === 'Dem')?.pct).filter(Boolean);
      const reps = polls.map(p => p.answers?.find(a => a.choice === 'Rep')?.pct).filter(Boolean);
      return {
        dem: dems.length ? Math.round(dems.reduce((a,b) => a+b, 0) / dems.length * 10) / 10 : null,
        rep: reps.length ? Math.round(reps.reduce((a,b) => a+b, 0) / reps.length * 10) / 10 : null,
      };
    }

    const approveNow = avgApprove(recentApproval);
    const approvePrev = avgApprove(prevApproval);
    const genNow = avgGeneric(recentGeneric);
    const genPrev = avgGeneric(prevGeneric);

    // If no recent polls, just use all available
    const allApprove = avgApprove(approvalData.polls || []);
    const allGeneric = avgGeneric(genericData.polls || []);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        approval: {
          current: approveNow || allApprove,
          previous: approvePrev,
          change: approveNow && approvePrev ? Math.round((approveNow - approvePrev) * 10) / 10 : null,
          polls: (approvalData.polls || []).length,
        },
        generic: {
          dem: {
            current: genNow.dem || allGeneric.dem,
            previous: genPrev.dem,
            change: genNow.dem && genPrev.dem ? Math.round((genNow.dem - genPrev.dem) * 10) / 10 : null,
          },
          rep: {
            current: genNow.rep || allGeneric.rep,
            previous: genPrev.rep,
            change: genNow.rep && genPrev.rep ? Math.round((genNow.rep - genPrev.rep) * 10) / 10 : null,
          },
          polls: (genericData.polls || []).length,
        },
        updatedAt: new Date().toISOString(),
      }),
    };

  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
