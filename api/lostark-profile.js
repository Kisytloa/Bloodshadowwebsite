const LOSTARK_API_KEY = process.env.LOSTARK_API_KEY || '';
const BASE_URL = 'https://developer-lostark.game.onstove.com';

async function fetchLA(path) {
  const url = `${BASE_URL}${path}`;
  const r = await fetch(url, {
    headers: {
      'Authorization': `bearer ${LOSTARK_API_KEY}`,
      'Accept': 'application/json',
      'Accept-Encoding': 'identity', // désactive gzip/deflate
    }
  });
  console.log(`${path} → ${r.status} | ct: ${r.headers.get('content-type')} | ce: ${r.headers.get('content-encoding')}`);
  if (!r.ok) return null;
  const text = await r.text();
  console.log(`body length: ${text.length} | start: ${text.substring(0,80)}`);
  if (!text || text === 'null') return null;
  try { return JSON.parse(text); } catch(e) { console.error(`parse err: ${e.message}`); return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'nope' });

  const { character } = req.query;
  if (!character) return res.status(400).json({ error: 'character manquant' });
  if (!LOSTARK_API_KEY) return res.status(500).json({ error: 'Clé API manquante' });

  try {
    const char = encodeURIComponent(character);
    const profile = await fetchLA(`/armories/characters/${char}/profiles`);
    const [equipment, engravings, gems] = await Promise.all([
      fetchLA(`/armories/characters/${char}/equipment`),
      fetchLA(`/armories/characters/${char}/engravings`),
      fetchLA(`/armories/characters/${char}/gems`),
    ]);
    return res.status(200).json({ profile, equipment, engravings, gems });
  } catch(e) {
    console.error(`Fatal: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
}
