# MISSION.md — Développement autonome du site BEA

Tu construis le site complet, seul, du début à la fin. Mandack ne validera rien entre les phases : il ouvrira le résultat une fois que tu auras terminé.

Lis `CLAUDE.md` d'abord. Puis enchaîne les phases ci-dessous dans l'ordre, sans demander confirmation.

**Après chaque phase** : `node scripts/verify.mjs` doit passer au vert, tu écris `PHASE-X-REPORT.md`, tu commits. Si le script échoue, tu corriges avant d'avancer. Si tu es bloqué selon la section 11 du `CLAUDE.md`, tu écris `BLOCAGE.md` et tu t'arrêtes là.

Aucun déploiement, à aucun moment.

---

## Phase 1 — Socle et harnais de vérification

Vite + React dans le dossier courant, `git init`, `.gitignore`, React Router. `src/styles/tokens.css` avec les variables du `CLAUDE.md`, reset CSS, les trois polices Google dans `index.html`. `src/config/contact.js` avec les valeurs réelles.

Les 5 routes avec des pages provisoires contenant un titre et un paragraphe : `/`, `/collection`, `/piece/:slug`, `/sur-mesure`, `/contact`.

**Et surtout** : `scripts/verify.mjs` tel que décrit en section 10 du `CLAUDE.md`, avec Playwright. C'est l'outil dont dépendent les neuf phases suivantes — il est prioritaire sur le reste.

Sélecteurs attendus : `main` présent sur chaque route.

---

## Phase 2 — Header et footer

Header collant, fond noir 94 % avec flou, filet or en bas, logo SVG blanc + wordmark, navigation, bouton or WhatsApp. Burger sous 980px qui se referme au clic. Le logo ne doit pas disparaître sous 560px.

Footer : logo, phrase de présentation, navigation, réseaux avec les liens réels, bas de page.

Sélecteurs : `header a[href^="https://wa.me/"]`, `footer a[href*="instagram"]`.

---

## Phase 3 — Composants partagés

`Bouton` (or, contour, pleine largeur), `Ornement` (losange or entre deux filets), `Surtitre`, `TitreSection`, et le hook d'apparition au scroll — fondu ascendant 16px sur 0.7s, `IntersectionObserver`, respect de `prefers-reduced-motion`.

Vérifie que les éléments sont visibles **après** l'animation : le script doit forcer l'état final avant de mesurer, sinon les captures sortiront vides.

---

## Phase 4 — Données

`content/pieces/` avec les 8 fichiers JSON au format de la section 6 du `CLAUDE.md`, contenu repris de `design-reference/maquette-finale.html`. Photos dans `public/images/pieces/`. `scripts/build-pieces.js` compile vers `src/data/pieces.json`, branché en `prebuild`.

Vérification : `pieces.json` contient exactement 8 entrées, chacune avec un `slug` unique et au moins une photo existante sur le disque.

---

## Phase 5 — Accueil

Ouverture plein cadre (photo, voile radial, texte centré, deux boutons), bande des 4 valeurs, grille des 6 pièces mises en avant, bloc sur mesure en deux colonnes, appel final. Fidèle à la maquette.

Sélecteurs : un `h1`, au moins 6 cartes pièce, un lien WhatsApp dans l'ouverture.

---

## Phase 6 — Collection et carte pièce

`CartePiece` : photo 1:1, pastille de référence, filet or, nom, « Sur devis », matière, lien. Les liens du bas doivent s'aligner entre les cartes d'une même rangée.

Page collection avec filtres par catégorie. Le script doit cliquer sur le filtre « Kimonos » et vérifier qu'il reste exactement 2 pièces visibles.

---

## Phase 7 — Fiche pièce

`/piece/:slug` alimentée par les données. Photo, surtitre catégorie et genre, nom, « Sur devis », description, tableau de specs, deux boutons dont le WhatsApp pré-rempli avec le nom et la référence. Slug inexistant : page 404 propre, pas d'écran blanc.

Le script doit vérifier sur une fiche que le `href` WhatsApp contient bien la référence de la pièce.

---

## Phase 8 — Sur mesure et contact

Sur mesure : trois étapes, puis le formulaire qui compose le message WhatsApp côté client via `window.open`, sans aucun envoi serveur. Contact : informations réelles, réseaux, bloc de prise de mesures.

Le script remplit le formulaire, intercepte `window.open` et vérifie que l'URL produite contient le nom saisi et le type de pièce.

---

## Phase 9 — Decap CMS

`public/admin/index.html` et `config.yml`. Collection « Pièces » avec tous les champs de la section 6, `nom_en` et `description_en` optionnels. Widget image vers `public/images/pieces/`. Netlify Identity + Git Gateway configurés mais non déployés.

Vérification : `/admin/` répond et `config.yml` est un YAML valide contenant les 8 champs attendus.

---

## Phase 10 — Finitions

Page 404, page mentions légales avec structure vide, titres et descriptions par page, textes alternatifs des images, favicon depuis le symbole du logo, compression des images au build.

Vérification : une URL inexistante rend la 404, chaque page a un `<title>` distinct et une `meta description` non vide.

---

## Pour finir

Écris `RAPPORT-FINAL.md` : ce qui a été construit, les décisions prises seul, ce qui reste ouvert, les points à vérifier visuellement par Mandack, et comment lancer le projet. Rassemble les captures de `verification/` dans un dossier lisible.

Rappel : les photos sont provisoires (414px, issues de Facebook) et l'image d'ouverture devrait être en paysage. Ne cherche pas à corriger ça — signale-le.
