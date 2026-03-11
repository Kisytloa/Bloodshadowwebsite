const LOSTARK_API_KEY = process.env.LOSTARK_API_KEY || '';
const BASE_URL = 'https://developer-lostark.game.onstove.com';

async function safeJson(r) {
  try {
    const text = await r.text();
    console.log(`Raw response (first 200 chars): ${text.substring(0, 200)}`);
    return JSON.parse(text);
  } catch (e) {
    console.error(`JSON parse error: ${e.message}`);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { character } = req.query;
  if (!character) return res.status(400).json({ error: 'Paramètre character manquant' });
  if (!LOSTARK_API_KEY) return res.status(500).json({ error: 'Clé API manquante' });

  const headers = {
    'Authorization': `bearer ${LOSTARK_API_KEY}`,
    'Accept': 'application/json',
  };

  try {
    const profileRes = await fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/profiles`, { headers });
    console.log(`Profile status: ${profileRes.status}, content-type: ${profileRes.headers.get('content-type')}`);

    if (!profileRes.ok) {
      const txt = await profileRes.text();
      return res.status(profileRes.status).json({ error: `API error ${profileRes.status}: ${txt.substring(0, 200)}` });
    }

    const profile = await safeJson(profileRes);

    const [equipRes, engRes, gemsRes] = await Promise.all([
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/equipment`, { headers }),
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/engravings`, { headers }),
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/gems`, { headers }),
    ]);

    const equipment = equipRes.ok ? await safeJson(equipRes) : null;
    const engravings = engRes.ok ? await safeJson(engRes) : null;
    const gems = gemsRes.ok ? await safeJson(gemsRes) : null;

    console.log(`profile keys: ${profile ? Object.keys(profile).join(',') : 'null'}`);

    return res.status(200).json({ profile, equipment, engravings, gems });

  } catch (e) {
    console.error(`Fatal error: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
}