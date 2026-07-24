// Find Darryl's Slack user ID and send him the 360 briefing

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;

async function slackApi(method, body = {}) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SLACK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function main() {
  if (!SLACK_TOKEN) {
    console.error('No SLACK_BOT_TOKEN');
    process.exit(1);
  }

  // List users to find Darryl
  const usersResult = await slackApi('users.list', { limit: 200 });
  if (!usersResult.ok) {
    console.error('Failed to list users:', usersResult.error);
    process.exit(1);
  }

  const darryl = usersResult.members.find(m => {
    const name = (m.real_name || m.name || '').toLowerCase();
    return name.includes('darryl') || name.includes("d'souza") || name.includes('dsouza');
  });

  if (!darryl) {
    console.log('All users:', usersResult.members.map(m => `${m.id}: ${m.real_name || m.name} (${m.profile?.email || 'no email'})`).join('\n'));
    console.error('Could not find Darryl in workspace');
    process.exit(1);
  }

  console.log(`Found Darryl: ${darryl.id} — ${darryl.real_name} (${darryl.profile?.email})`);

  // Send the message
  const message = `Hey Darryl 👋

Tony asked me to send this your way. Here's the Ramprate team Flow Circuit status — and a task for you.

---

*🎯 The Task:* Get everyone on the team to complete their 360 review. Nobody has started yet.

---

*📊 Ramprate Team Roster:*

| Name | Role | Score | 360 Status |
|------|------|-------|------------|
| Tony Greenberg | Spark | 55 | ❌ No 360 |
| Alex Veytsel | Filter | 73 | ❌ No 360 |
| Josh Bykowski | Filter | 41 | ❌ No 360 |
| Ben Sheppard | Amplifier | 46 | ❌ No 360 |
| Rob Holmes | Ground | 41 | ❌ No 360 |
| Kimberly Dofredo | Ground | 52 | ❌ No 360 |
| Darryl D'souza | Ground | 46 | ❌ No 360 |

*Missing role:* Conductor (0 on the team)

---

*🔗 How to start the 360:*

Each person visits their results page and clicks "Get Your 360 Link" — then shares that link with 3-5 teammates/colleagues who know them well.

Direct results links:
• Tony: https://flowcircuit.manus.space/360-results/570001
• Alex: https://flowcircuit.manus.space/360-results/420001
• Josh: https://flowcircuit.manus.space/360-results/990001
• Ben: https://flowcircuit.manus.space/360-results/1050001
• Rob: https://flowcircuit.manus.space/360-results/900001
• Kimberly: https://flowcircuit.manus.space/360-results/870001
• Darryl (you): https://flowcircuit.manus.space/360-results/840001

---

*⚡ Your 360 link:* Start with yours as the example — visit the link above, generate your 360 link, and share it with the team. Then nudge everyone else to do the same.

The 360 takes reviewers about 2 minutes (drag-rank 5 roles). Once 3+ people review someone, the gap report unlocks automatically.

Let's get this done this week! 🚀`;

  const sendResult = await slackApi('chat.postMessage', {
    channel: darryl.id,
    text: message,
    mrkdwn: true,
  });

  if (sendResult.ok) {
    console.log('✅ Message sent successfully to Darryl!');
    console.log('Channel:', sendResult.channel);
    console.log('Timestamp:', sendResult.ts);
  } else {
    console.error('Failed to send:', sendResult.error);
  }

  process.exit(0);
}

main();
