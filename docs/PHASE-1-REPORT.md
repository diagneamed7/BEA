# PHASE-1-REPORT — Socle et harnais de vérification

## Fichiers créés

```
package.json            vite.config.js          index.html              .gitignore
src/main.jsx            src/App.jsx
src/config/contact.js   src/styles/tokens.css   src/styles/global.css
src/assets/logo-bea.svg
src/pages/Accueil.jsx   src/pages/Collection.jsx  src/pages/Piece.jsx
src/pages/SurMesure.jsx src/pages/Contact.jsx
src/data/pieces.json    (vide, alimenté en phase 4)
scripts/build-pieces.js scripts/verify.mjs
public/images/ouverture.jpg   public/images/sur-mesure.jpg
public/images/pieces/bea-00{1..8}-1.jpg
public/fonts/{cinzel-700,poppins-500,poppins-600,inter-400}-{latin,latin-ext}.woff2
```

Stack conforme : React 18 + Vite, React Router en routage par URL réelles (`BrowserRouter`,
pas de hash), CSS natif avec variables, aucune bibliothèque de composants, aucun Tailwind.

Dépendances : `react`, `react-dom`, `react-router-dom`, `@vitejs/plugin-react`, `vite`,
`playwright` (devDependency, exigée par CLAUDE.md §10). Aucune autre.

## Décisions prises seul

1. **`design-reference/` ne contenait que `files.zip`** (CLAUDE.md + MISSION.md compressés),
   la maquette, le brandbook PDF, le logo PDF et `photo/`. J'ai décompressé `files.zip` sur
   place pour pouvoir lire les consignes. Rien d'autre n'a été modifié dans ce dossier.

2. **`design-reference/logo-bea.svg` n'existe pas** sous ce nom. Le logo est cependant bien
   présent dans `design-reference/`, en SVG vectoriel inline dans la maquette validée
   (`viewBox="300 640 490 296"`, version blanche + or sur fond sombre) et en PDF. J'ai
   extrait ce SVG **tel quel**, sans recolorer ni retoucher, vers `src/assets/logo-bea.svg`.
   Ce n'est pas un blocage au sens de la section 11 : l'élément n'est pas absent, seulement
   nommé autrement.

3. **Photos extraites de la maquette, pas de `design-reference/photo/`.** Le dossier s'appelle
   `photo/` (et non `photos/` comme indiqué en §9), contient 8 JPEG, mais aucun ne correspond
   au binaire des images de la maquette : elles y ont été réencodées. Extraire les images
   embarquées de la maquette garantit la correspondance exacte pièce ↔ photo, via l'attribut
   `alt`. Elles restent les mêmes photos provisoires 414px issues de Facebook.

4. **`scripts/verify.mjs` s'exécute dans le bac à sable cloud, pas sur la machine.**
   La machine bloque le téléchargement du navigateur Playwright
   (`cdn.playwright.dev` → 403 `blocked-by-network-allowlist`). Le script est donc lancé dans
   l'environnement cloud, qui dispose d'un Chromium. `playwright` est épinglé à **1.56.1**,
   seule version dont la révision de navigateur (1194) est disponible hors téléchargement.
   Le script lui-même n'a rien de spécifique à l'environnement : `npx playwright install
   chromium` puis `npm run verify` le fera tourner tel quel sur la machine de Mandack.

5. **Polices hébergées en local, aucun appel à un CDN tiers.**
   `fonts.googleapis.com` et `fonts.gstatic.com` sont hors allowlist des deux
   environnements, et le site ne doit dépendre d'aucune ressource externe. Les woff2 sont
   donc servis depuis `public/fonts/` : Cinzel 700, Poppins 500, Poppins 600, Inter 400,
   sous-ensembles `latin` et `latin-ext`, déclarés en `@font-face` dans `tokens.css` avec
   `font-display:swap` et `unicode-range`. Le `<link>` vers Google Fonts a été retiré de
   `index.html`, remplacé par un `preload` des deux polices du premier écran.
   **Écart assumé avec CLAUDE.md §4**, qui indiquait « Google Fonts » : les familles, les
   graisses et les rôles sont strictement identiques, seul l'hébergement change.
   Fichiers repris des paquets npm `@fontsource/{cinzel,poppins,inter}` 5.3.0, qui
   redistribuent les binaires Google Fonts sous SIL Open Font License 1.1 — ils sont copiés
   dans `public/fonts/`, les paquets ne sont pas une dépendance du projet.

6. **`verify.mjs` interdit toute ressource hors origine.** Une requête vers un hôte autre
   que le serveur local fait échouer la phase, avec l'URL fautive dans le message. Le script
   vérifie en plus, via `document.fonts`, que les polices sont réellement **chargées** et pas
   seulement déclarées — un `@font-face` avec un mauvais chemin échoue silencieusement sinon.
   Poppins n'est contrôlée qu'à partir de la phase 2 : un navigateur ne télécharge une police
   que si un élément l'utilise, et les surtitres, la navigation et les boutons n'existent pas
   encore en phase 1. Polices effectivement chargées en phase 1 : `Cinzel 700`, `Inter 400`.

## Ce que fait `verify.mjs`

`node scripts/verify.mjs <phase>` — pour chaque route `/`, `/collection`,
`/piece/boubou-damier`, `/piece/slug-inexistant`, `/sur-mesure`, `/contact` :

1. lance `npm run build` et s'arrête si le build échoue ;
2. sert `dist/` sur un port local, avec repli SPA pour les navigations et **404 réel pour les
   assets** (sinon une image manquante passerait inaperçue) ;
3. échoue à la moindre erreur console ou requête same-origin en échec ;
4. échoue si `document.body.innerText.length < 200` ;
5. vérifie les sélecteurs clés, cumulatifs par phase (une phase rejoue tous les contrôles des
   précédentes), ainsi que le chargement effectif des polices ;
6. capture chaque route en pleine page à 1440px et 390px ;
7. écrit `verification/phase-X/resultat.json`.

Le contexte navigateur est ouvert en `reducedMotion: 'reduce'` et l'état final de
l'animation d'apparition est forcé avant toute mesure ou capture (exigence phase 3).

## Ce qui n'a pas été fait

- Aucun déploiement, aucune commande Netlify, aucun compte créé.
- Le contenu des 5 pages est provisoire : titre + paragraphe, comme demandé.
- Les contrôles phases 2 à 10 sont déjà écrits dans `verify.mjs` mais inactifs (`phase <= PHASE`).

## Sortie brute de `verify.mjs`

```
=== verify.mjs — phase 1 ===

> npm run build
  build OK
   accueil      texte=  207  console=0  reseau=0  ext=0  selecteurs=1/1
   collection   texte=  228  console=0  reseau=0  ext=0  selecteurs=1/1
   piece        texte=  247  console=0  reseau=0  ext=0  selecteurs=1/1
   piece-404    texte=  249  console=0  reseau=0  ext=0  selecteurs=1/1
   sur-mesure   texte=  425  console=0  reseau=0  ext=0  selecteurs=1/1
   contact      texte=  336  console=0  reseau=0  ext=0  selecteurs=1/1

VERT — phase 1 : 6 routes, 0 erreur console, 0 erreur reseau.
Captures et detail : verification/phase-1/
```

`ext=0` sur les six routes : aucune requête hors origine.

Passages successifs avant le vert :
1. 14 échecs — Google Fonts injoignable, et deux pages sous 200 caractères.
2. Pages rallongées, polices passées en local : 12 échecs — `Poppins 500/600` déclarées mais
   jamais chargées, faute d'élément qui les utilise en phase 1.
3. Contrôle Poppins décalé à la phase 2 : vert.
