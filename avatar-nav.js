/**
 * avatar-nav.js — Crimson Reign
 * Injecte l'avatar du joueur connecté dans #user-info sur toutes les pages.
 * Cliquer sur l'avatar redirige vers profil.html
 */
(function () {
  // Attendre que Firebase Auth soit prêt (la var auth est définie dans chaque page)
  // On poll toutes les 200ms jusqu'à ce que currentUser soit disponible dans localStorage
  function injectAvatar() {
    const wrap = document.getElementById('user-info');
    if (!wrap) return;

    // Récupérer les infos depuis localStorage (mises en cache par chaque page)
    const avatarUrl   = localStorage.getItem('cr_avatarUrl')   || '';
    const classeMain  = localStorage.getItem('cr_classeMain')  || '';
    const nom         = localStorage.getItem('cr_nom')         || '?';

    // Construire l'icône de classe si pas d'avatar custom
    const FD = "https://static.wikia.nocookie.net/lostark_gamepedia/images/";
    const px = p => `https://wsrv.nl/?url=${encodeURIComponent(FD + p)}&w=64&h=64&output=webp&q=80`;
    const CI = {
      "Berserker":       px("b/b8/ClassIcon-Warrior-Berserker.png/revision/latest?cb=20220211161248"),
      "Paladin":         px("6/66/ClassIcon-Warrior-Paladin.png/revision/latest?cb=20220211161249"),
      "Destructeur":     px("3/3b/ClassIcon-Warrior-Destroyer.png/revision/latest?cb=20230901222333"),
      "Gunlancer":       px("e/eb/ClassIcon-Warrior-Gunlancer.png/revision/latest?cb=20220211161248"),
      "Slayer":          px("1/15/ClassIcon-Warrior-Slayer.png/revision/latest?cb=20230901222441"),
      "Sorcière":        px("6/63/ClassIcon-Mage-Sorceress.png/revision/latest?cb=20220211161242"),
      "Arcaniste":       px("d/d4/ClassIcon-Mage-Arcanist.png/revision/latest?cb=20230901213545"),
      "Barde":           px("1/1b/ClassIcon-Mage-Bard.png/revision/latest?cb=20220211161241"),
      "Invocatrice":     px("e/e3/ClassIcon-Mage-Summoner.png/revision/latest?cb=20230901214149"),
      "Elementiste":     px("e/e8/ClassIcon-Martial_Artist-Wardancer.png/revision/latest?cb=20220211161246"),
      "Spirite":         px("1/19/ClassIcon-Martial_Artist-Soulfist.png/revision/latest?cb=20220211161245"),
      "Lancière":        px("5/5c/ClassIcon-Martial_Artist-Glaivier.png/revision/latest?cb=20230901215814"),
      "Pugiliste":       px("6/64/ClassIcon-Martial_Artist-Scrapper.png/revision/latest?cb=20220211161244"),
      "Striker":         px("b/b0/ClassIcon-Martial_Artist-Striker.png/revision/latest?cb=20220211161245"),
      "Sanguelame":      px("0/0a/ClassIcon-Assassin-Deathblade.png/revision/latest?cb=20220211161236"),
      "Démoniste":       px("7/74/ClassIcon-Assassin-Shadowhunter.png/revision/latest?cb=20220211161234"),
      "Faucheuse":       px("4/40/ClassIcon-Assassin-Reaper.png/revision/latest?cb=20230901211242"),
      "Dévoreuse d'âme": px("c/c3/ClassIcon-Assassin-Souleater.png/revision/latest?cb=20231125011727"),
      "Gunner":          px("d/da/ClassIcon-Gunner-Deadeye.png/revision/latest?cb=20220211161238"),
      "Sagittaire":      px("f/fd/ClassIcon-Gunner-Sharpshooter.png/revision/latest?cb=20220211161240"),
      "Artilleur":       px("a/a8/ClassIcon-Gunner-Artillerist.png/revision/latest?cb=20220211161238"),
      "Machiniste":      px("a/ad/ClassIcon-Gunner.png/revision/latest?cb=20220211161237"),
      "Fusilière":       px("3/38/ClassIcon-Gunner-Gunslinger.png/revision/latest?cb=20220211161239"),
      "Artiste":         px("d/da/ClassIcon-Specialist-Artist.png/revision/latest?cb=20230901210029"),
    };

    function getIcon(c) {
      if (!c) return CI["Berserker"];
      const k = c.replace(/\*/g, '').trim();
      return CI[k] || CI[Object.keys(CI).find(i => i && i.toLowerCase() === k.toLowerCase())] || CI["Berserker"];
    }

    const imgSrc = avatarUrl || getIcon(classeMain);
    const initial = nom.charAt(0).toUpperCase();

    // Supprimer l'éventuel avatar déjà injecté
    const existing = wrap.querySelector('.nav-avatar-link');
    if (existing) existing.remove();

    // Créer le lien avatar
    const link = document.createElement('a');
    link.href = 'profil.html';
    link.className = 'nav-avatar-link';
    link.title = `Mon profil — ${nom}`;
    link.style.cssText = `
      display:inline-flex; align-items:center; gap:7px;
      text-decoration:none; cursor:pointer;
      flex-shrink:0; margin-right:6px;
    `;

    link.innerHTML = `
      <span style="
        position:relative; display:inline-block;
        width:28px; height:28px; border-radius:50%;
        border:1.5px solid rgba(201,146,42,.55);
        box-shadow:0 0 8px rgba(179,0,27,.35);
        overflow:hidden; flex-shrink:0;
        background:#0c0814;
        transition:border-color .2s, box-shadow .2s;
      " id="nav-avatar-ring">
        <img src="${imgSrc}"
          alt="${nom}"
          style="width:100%;height:100%;object-fit:cover;display:block;"
          onerror="this.style.display='none';document.getElementById('nav-avatar-fallback').style.display='flex';"
        />
        <span id="nav-avatar-fallback"
          style="display:none;position:absolute;inset:0;
            align-items:center;justify-content:center;
            font-family:'Cinzel',serif;font-size:.75rem;font-weight:700;
            color:var(--gold-light,#f0c040);background:#0c0814;">
          ${initial}
        </span>
      </span>
    `;

    // Hover effect
    link.addEventListener('mouseenter', () => {
      const ring = link.querySelector('#nav-avatar-ring');
      if (ring) { ring.style.borderColor='rgba(201,146,42,.9)'; ring.style.boxShadow='0 0 14px rgba(179,0,27,.6)'; }
    });
    link.addEventListener('mouseleave', () => {
      const ring = link.querySelector('#nav-avatar-ring');
      if (ring) { ring.style.borderColor='rgba(201,146,42,.55)'; ring.style.boxShadow='0 0 8px rgba(179,0,27,.35)'; }
    });

    // Insérer AVANT le texte "Connecté en tant que"
    wrap.insertBefore(link, wrap.firstChild);
  }

  // Écouter l'événement custom déclenché par chaque page quand Firebase a chargé le profil
  document.addEventListener('cr:profileLoaded', injectAvatar);

  // Fallback : injecter dès que le DOM est prêt si les données sont déjà en cache
  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('cr_nom')) injectAvatar();
  });
})();
