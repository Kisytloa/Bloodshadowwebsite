# Patch avatar-nav — Crimson Reign
## Pour chaque fichier HTML, effectuer 2 modifications :

### 1. index.html
Dans onAuthStateChanged, APRÈS :
```
document.getElementById('user-name').textContent = displayName;
```
AJOUTER :
```js
if (!snap.empty) {
  const _d = snap.docs[0].data();
  const _p = (_d.personnages||[]).slice().sort((a,b)=>(parseFloat(b.ilvl)||0)-(parseFloat(a.ilvl)||0));
  localStorage.setItem('cr_nom', displayName);
  localStorage.setItem('cr_avatarUrl', _d.avatarUrl||'');
  localStorage.setItem('cr_classeMain', _p[0]?.classe||'');
  document.dispatchEvent(new CustomEvent('cr:profileLoaded'));
}
```

### 2. planning.html
APRÈS :
```
document.getElementById('user-name').textContent = currentMembre.nom || user.displayName || 'Invité';
```
AJOUTER :
```js
const _pp=(currentMembre.personnages||[]).slice().sort((a,b)=>(parseFloat(b.ilvl)||0)-(parseFloat(a.ilvl)||0));
localStorage.setItem('cr_nom',currentMembre.nom||'Invité');
localStorage.setItem('cr_avatarUrl',currentMembre.avatarUrl||'');
localStorage.setItem('cr_classeMain',_pp[0]?.classe||'');
document.dispatchEvent(new CustomEvent('cr:profileLoaded'));
```

### 3. wiki.html (même pattern, variable m)
APRÈS :
```
document.getElementById('user-name').textContent = m.nom || user.displayName || 'Invité';
```
AJOUTER :
```js
const _wp=(m.personnages||[]).slice().sort((a,b)=>(parseFloat(b.ilvl)||0)-(parseFloat(a.ilvl)||0));
localStorage.setItem('cr_nom',m.nom||'Invité');
localStorage.setItem('cr_avatarUrl',m.avatarUrl||'');
localStorage.setItem('cr_classeMain',_wp[0]?.classe||'');
document.dispatchEvent(new CustomEvent('cr:profileLoaded'));
```

### 4. Objectifs.html (variable m)
APRÈS :
```
document.getElementById('user-name').textContent = m.nom || 'Invité';
```
AJOUTER le même bloc avec variable _op

### 5. membre_guilde.html (variable m dans le 2e onAuthStateChanged en bas)
APRÈS :
```
document.getElementById('user-name').textContent = m.nom || user.displayName || 'Invité';
```
AJOUTER le même bloc avec variable _mp

### Toutes les pages : avant </body>
```html
<script src="avatar-nav.js"></script>
```
