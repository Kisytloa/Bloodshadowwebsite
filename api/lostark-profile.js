const LOSTARK_API_KEY = process.env.LOSTARK_API_KEY || '';
const BASE_URL = 'https://developer-lostark.game.onstove.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { character } = req.query;
  if (!character) return res.status(400).json({ error: 'Paramètre character manquant' });

  if (!LOSTARK_API_KEY) return res.status(500).json({ error: 'Clé API Lost Ark non configurée' });

  const headers = {
    'Authorization': `bearer ${LOSTARK_API_KEY}`,
    'Accept': 'application/json',
  };

  try {
    // Fetch en parallèle : profil + équipement
    const [profileRes, equipRes, engravingRes, collectiblesRes] = await Promise.all([
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/profiles`, { headers }),
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/equipment`, { headers }),
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/engravings`, { headers }),
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/gems`, { headers }),
    ]);

    if (profileRes.status === 404) return res.status(404).json({ error: 'Personnage introuvable' });
    if (!profileRes.ok) return res.status(profileRes.status).json({ error: 'Erreur API Lost Ark' });

    const [profile, equipment, engravings, gems] = await Promise.all([
      profileRes.json(),
      equipRes.ok ? equipRes.json() : null,
      engravingRes.ok ? engravingRes.json() : null,
      collectiblesRes.ok ? collectiblesRes.json() : null,
    ]);

    return res.status(200).json({ profile, equipment, engravings, gems });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
