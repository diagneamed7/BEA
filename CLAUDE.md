# CLAUDE.md — Projet BEA

Contexte permanent. À lire au début de **chaque** session, avant toute action.

---

## 1. Le projet

Site vitrine-catalogue pour **BEA — Bamba Élégance Africaine**, marque sénégalaise de vêtements traditionnels et contemporains confectionnés à la main (boubous, kaftans, ensembles, kimonos, homme et femme).

**Pas de e-commerce.** Aucun panier, aucun paiement, aucun compte client. Chaque appel à l'action ouvre une conversation WhatsApp pré-remplie. Le client ne reçoit personne dans son atelier : tout se fait à distance.

**Le site a 5 écrans** : Accueil, Collection, Fiche pièce, Sur mesure, Contact.

---

## 2. Stack imposée

- React 18 + Vite
- React Router (routage par URL réelles, pas de hash)
- CSS natif avec variables — **pas de Tailwind, pas de bibliothèque de composants**
- Decap CMS (dossier `/admin`), contenu en JSON dans `content/`
- Netlify + GitHub, Netlify Identity pour l'accès CMS

Ne pas ajouter de dépendance sans la justifier dans le rapport de phase.

---

## 3. Règles absolues

1. **Mode autonome.** Tu enchaînes les phases de `MISSION.md` sans demander de validation entre chacune. Tu ne t'arrêtes que dans les cas listés en section 11.
2. **Aucun déploiement Netlify. Jamais.** Pas de `netlify deploy`, pas de push sur une branche connectée à un build automatique. Le déploiement est fait manuellement par Mandack, plus tard.
3. **Une phase n'est terminée que si son script de vérification passe.** Voir section 10. Un composant qui compile n'est pas un composant qui s'affiche.
4. **`design-reference/` est en lecture seule.** C'est la source de vérité validée par le client. On s'y conforme, on ne la modifie pas, on ne « l'améliore » pas.
5. **Ne jamais inventer de contenu client.** Pas de faux témoignage, pas de fausse adresse, pas de texte marketing improvisé. Si une information manque, laisser vide et le consigner.
6. **Ne jamais écrire une coordonnée en dur dans un composant.** Tout passe par `src/config/contact.js`.
7. **Un commit Git par phase**, message `phase-X: <résumé court>`. Pas de commit à moitié fait.

## 4. Charte graphique — non négociable

Version retenue : **noir profond**. Extraite du brandbook fourni dans `design-reference/`.

```css
:root{
  --noir:#000000;
  --or:#B8860B;
  --blanc:#FFFFFF;
  --noir-chaud:#0C0B0A;        /* sections différenciées */
  --ligne:rgba(255,255,255,.13);
  --ligne-forte:rgba(255,255,255,.22);
  --texte-2:rgba(255,255,255,.72);
  --texte-3:rgba(255,255,255,.55);
  --or-ligne:rgba(184,134,11,.28);
}
```

**Typographies** (Google Fonts, rôles fixes) :
- `Cinzel` 700 — titres H1/H2/H3, capitales, `letter-spacing: .04em`
- `Poppins` 500/600 — surtitres, navigation, boutons, labels, capitales, `letter-spacing: .13em` à `.28em`, 10 à 12px
- `Inter` 400 — paragraphes, `line-height: 1.65`

**Interdits visuels** — ce sont les marqueurs du rendu générique, le client les rejettera :
- Dégradés dorés, effets métalliques, halos, reflets, ombres portées
- Coins arrondis : `border-radius: 0` partout, boutons et champs compris
- L'or en texte courant sur fond clair (contraste insuffisant)
- Carrousels, flèches, points de pagination
- Plus d'une animation : un seul fondu ascendant de 16px sur 0.7s à l'apparition, plus un zoom 1.04 au survol des photos. Respecter `prefers-reduced-motion`.

**Logo** : `design-reference/logo-bea.svg`, version blanche sur fond sombre. Ne jamais recolorer, étirer, pivoter, ni ajouter d'effet.

---

## 5. Coordonnées réelles

Fichier unique `src/config/contact.js` :

```js
export const CONTACT = {
  whatsapp:  '221772524984',
  affichage: '+221 77 252 49 84',
  instagram: 'https://www.instagram.com/bea_bambaeleganceafricaine',
  tiktok:    'https://www.tiktok.com/@bambaeleganceafricaine',
  facebook:  'https://www.facebook.com/share/1GGdEbryMR/',
  email:     null,   // le client n'en a pas — ne pas afficher la ligne
};

export const waLink = (message) =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
```

Le message WhatsApp d'une fiche pièce doit contenir le nom du modèle et sa référence.

---

## 6. Modèle de données — une pièce

```json
{
  "ref": "BEA-001",
  "slug": "boubou-damier",
  "nom": "Boubou Damier",
  "categorie": "Boubous",
  "genre": "Homme",
  "matiere": "Tissu tissé main, empiècements rayés et motif damier",
  "description": "…",
  "photos": ["/images/pieces/bea-001-1.jpg", "…"],
  "mise_en_avant": true,
  "ordre": 1,
  "nom_en": null,
  "description_en": null
}
```

Catégories : `Boubous`, `Kaftans`, `Ensembles`, `Kimonos`.
Le prix est toujours « Sur devis » — pas de champ prix.

---

## 7. Bilingue

La structure est **préparée mais désactivée**. Les champs `_en` existent dans le schéma et dans Decap, mais aucun sélecteur de langue n'est affiché et aucune route `/en/` n'est créée. Objectif : pouvoir activer l'anglais plus tard sans migration de contenu.

---

## 8. Structure cible

```
src/
├── config/contact.js
├── styles/tokens.css        ← les variables de la section 4
├── components/              ← Header, Footer, Bouton, Ornement, CartePiece…
├── pages/                   ← Accueil, Collection, Piece, SurMesure, Contact
└── data/pieces.json         ← compilé depuis content/
content/pieces/*.json        ← écrit par Decap
public/admin/config.yml
design-reference/            ← LECTURE SEULE
```

---

## 9. Photos

Celles de `design-reference/photos/` font **414px de large** : elles viennent de Facebook et sont provisoires. Ne pas construire d'optimisation définitive autour d'elles. Les définitives arriveront plus tard, en haute résolution.

Formats : **1:1** pour les cartes et fiches, **paysage 16:9** pour l'image d'ouverture (celle-ci n'existe pas encore).

---

## 10. Vérification automatisée — obligatoire

Mandack n'est pas là pour contrôler entre les phases. La vérification doit donc être exécutée par toi, par du code, pas par ton jugement.

**À mettre en place en phase 1** : `scripts/verify.mjs`, avec Playwright en `devDependency`.

Ce script doit, pour chaque route (`/`, `/collection`, `/piece/<slug-existant>`, `/piece/slug-inexistant`, `/sur-mesure`, `/contact`) :

1. Lancer le build (`npm run build`) et échouer si le build échoue
2. Servir le `dist/` et ouvrir chaque route dans un navigateur headless
3. **Échouer si la console contient la moindre erreur** ou si une requête réseau retourne une erreur
4. **Échouer si `document.body.innerText.length < 200`** sur une route — c'est la signature d'un écran blanc
5. Vérifier la présence d'un sélecteur clé par page (défini dans `MISSION.md`)
6. Capturer une image pleine page en 1440px et en 390px dans `verification/phase-X/`
7. Écrire `verification/phase-X/resultat.json` avec le détail par route

**Règle :** tant que `verify.mjs` ne passe pas au vert, la phase n'est pas finie et on ne commit pas. Ne jamais contourner un test qui échoue en le désactivant ou en assouplissant son seuil.

**Rapport par phase** : un `PHASE-X-REPORT.md` court avec — fichiers créés ou modifiés, décisions prises seul, ce qui n'a pas été fait et pourquoi, résultat brut de `verify.mjs`. Pas d'auto-félicitation, pas de « ✅ vérifié » sans la sortie du script en dessous.

## 11. Quand s'arrêter et écrire BLOCAGE.md

Tu t'arrêtes, tu écris `BLOCAGE.md` à la racine et tu ne vas pas plus loin dans les cas suivants :

- Un élément nécessaire est absent de `design-reference/` (photo, texte, information client)
- La maquette et une consigne de ce document se contredisent
- `verify.mjs` échoue trois fois de suite sur le même point malgré des corrections différentes
- Une tâche impliquerait un déploiement, un achat, un nom de domaine, ou la création d'un compte
- Tu dois inventer du contenu destiné au client final

`BLOCAGE.md` décrit le problème, ce que tu as tenté, et la décision attendue de Mandack. Tu ne devines pas, tu ne contournes pas.

## 12. Hors périmètre

Galerie multi-photos sur la fiche, image de partage définitive, version anglaise active, déploiement. Identifiés, ils viendront après.
