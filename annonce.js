// Passage à Firestore pour une annonce partagée
document.addEventListener('DOMContentLoaded', async function() {
    const annonceContent = document.getElementById('annonce-content');
    const deleteButton = document.getElementById('delete-button');
    const annonceForm = document.getElementById('annonce-form');

    // Charger Firebase (si pas déjà chargé ailleurs sur cette page) via import dynamique
    const firebaseApp = await import('https://www.gstatic.com/firebasejs/9.17.0/firebase-app.js');
    const firebaseFirestore = await import('https://www.gstatic.com/firebasejs/9.17.0/firebase-firestore.js');
    const firebaseAuth = await import('https://www.gstatic.com/firebasejs/9.17.0/firebase-auth.js');

    const firebaseConfig = {
        apiKey: "AIzaSyBfJubhqQFQNo8fxVLKh1DKlfisJhZYwGI",
        authDomain: "bloodshadowsite-d35ce.firebaseapp.com",
        projectId: "bloodshadowsite-d35ce",
        storageBucket: "bloodshadowsite-d35ce.firebasestorage.app",
        messagingSenderId: "368188025874",
        appId: "1:368188025874:web:cfdd31f87651f1a3737ccb",
        measurementId: "G-1PJ7HXSP6J"
    };
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firebaseFirestore.getFirestore(app);
    const auth = firebaseAuth.getAuth(app);

    const annonceRef = firebaseFirestore.doc(db, 'site', 'annonce');

    const metaEditor = document.getElementById('annonce-meta-editor');
    const draftIndicator = document.getElementById('annonce-draft');
    let latestServerContent = '';

    // Ecoute temps réel de l'annonce
    firebaseFirestore.onSnapshot(annonceRef, (snap) => {
        const data = snap.data();
        if (data) {
            if (typeof data.content === 'string') {
                latestServerContent = data.content;
                if (document.activeElement !== annonceContent) {
                    annonceContent.value = data.content;
                    const evt = new Event('input');
                    annonceContent.dispatchEvent(evt);
                }
                // Mettre à jour indicateur brouillon
                if (draftIndicator) {
                    draftIndicator.style.display = (annonceContent.value !== latestServerContent) ? 'block' : 'none';
                }
            }
            if (metaEditor) {
                metaEditor.style.display = 'block';
                let dateTxt = '';
                if (data.updatedAt && data.updatedAt.toDate) {
                    const d = data.updatedAt.toDate();
                    const opts = { weekday:'short', year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' };
                    dateTxt = d.toLocaleDateString('fr-FR', opts).replace(',', '');
                }
                const author = data.authorName || 'Inconnu';
                metaEditor.textContent = `Dernière mise à jour par ${author}${dateTxt ? ' le ' + dateTxt : ''}`;
            }
        } else if (metaEditor) {
            metaEditor.style.display = 'none';
        }
    });

    // Sur saisie utilisateur, afficher brouillon si différent
    annonceContent.addEventListener('input', () => {
        if (draftIndicator) {
            draftIndicator.style.display = (annonceContent.value !== latestServerContent) ? 'block' : 'none';
        }
    });

    // Soumission (création / modification)
    annonceForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const content = annonceContent.value.trim();
        try {
            const user = auth.currentUser;
            const meta = {
                content,
                updatedAt: firebaseFirestore.serverTimestamp(),
            };
            if (user) {
                meta.authorUid = user.uid;
                meta.authorName = user.displayName || user.email || 'Inconnu';
            }
            await firebaseFirestore.setDoc(annonceRef, meta, { merge: true });
            latestServerContent = content; // aligner
            window.location.href = 'index.html';
        } catch (e) {
            alert('Erreur en sauvegardant l\'annonce: ' + e.message);
        }
    });

    // Suppression (vider le contenu mais garder le doc pour éviter erreurs de droits)
    deleteButton.addEventListener('click', async function() {
        if (!confirm('Supprimer l\'annonce ?')) return;
        try {
            await firebaseFirestore.setDoc(annonceRef, { content: '', updatedAt: firebaseFirestore.serverTimestamp(), authorUid: auth.currentUser ? auth.currentUser.uid : null, authorName: auth.currentUser ? (auth.currentUser.displayName || auth.currentUser.email || 'Inconnu') : null }, { merge: true });
            annonceContent.value = '';
            const evt = new Event('input');
            annonceContent.dispatchEvent(evt);
            window.location.href = 'index.html';
        } catch (e) {
            alert('Erreur lors de la suppression: ' + e.message);
        }
    });
});

