export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { webhookUrl, payload } = req.body;

  if (!webhookUrl || (!webhookUrl.startsWith('https://discord.com/api/webhooks/') && !webhookUrl.startsWith('https://discordapp.com/api/webhooks/'))) {
    return res.status(400).json({ error: 'URL webhook invalide' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 204) {
      return res.status(200).json({ success: true });
    } else {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
