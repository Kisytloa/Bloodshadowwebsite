const LOSTARK_API_KEY = process.env.LOSTARK_API_KEY || '';
const BASE_URL = 'https://developer-lostark.game.onstove.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { character } = req.query;
  if (!character) return res.status(400).json({ error: 'Paramètre character manquant' });

  if (!LOSTARK_API_KEY) return res.status(500).json({ error: 'Clé API Lost Ark non configurée - vérifier variable LOSTARK_API_KEY sur Vercel' });

  const headers = {
    'Authorization': `bearer ${LOSTARK_API_KEY}`,
    'Accept': 'application/json',
  };

  try {
    const profileRes = await fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/profiles`, { headers });
    
    // Log du statut pour debug
    console.log(`Profile API status: ${profileRes.status} for character: ${character}`);
    
    if (profileRes.status === 401) return res.status(401).json({ error: 'Clé API invalide ou expirée (401)' });
    if (profileRes.status === 403) return res.status(403).json({ error: 'Clé API non autorisée (403) - vérifier les permissions' });
    if (profileRes.status === 404) return res.status(404).json({ error: `Personnage "${character}" introuvable sur EUC` });
    if (profileRes.status === 429) return res.status(429).json({ error: 'Trop de requêtes - limite API atteinte' });
    if (!profileRes.ok) {
      const body = await profileRes.text();
      return res.status(profileRes.status).json({ error: `Erreur API Lost Ark (${profileRes.status}): ${body}` });
    }

    const profile = await profileRes.json();

    // Fetch le reste en parallèle
    const [equipRes, engravingRes, gemsRes] = await Promise.all([
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/equipment`, { headers }),
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/engravings`, { headers }),
      fetch(`${BASE_URL}/armories/characters/${encodeURIComponent(character)}/gems`, { headers }),
    ]);

    console.log(`Equipment: ${equipRes.status}, Engravings: ${engravingRes.status}, Gems: ${gemsRes.status}`);

    const equipment  = equipRes.ok  ? await equipRes.json()    : null;
    const engravings = engravingRes.ok ? await engravingRes.json() : null;
    const gems       = gemsRes.ok   ? await gemsRes.json()     : null;

    return res.status(200).json({ profile, equipment, engravings, gems });

  } catch (e) {
    console.error('Erreur fetch Lost Ark:', e.message);
    return res.status(500).json({ error: `Erreur réseau: ${e.message}` });
  }
}
