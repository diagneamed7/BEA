# PHASE-5-REPORT — Accueil

## Fichiers créés ou modifiés

```
créés     src/components/CartePiece.jsx
          src/styles/pieces.css
          src/styles/accueil.css
modifiés  src/pages/Accueil.jsx   — les cinq blocs de la maquette
          src/main.jsx            — imports des deux feuilles
```

Aucune dépendance ajoutée.

## Les cinq blocs

1. **Ouverture plein cadre** — photo en fond (`opacity:.55`), voile radial, texte centré,
   surtitre, ornement, `h1` sur deux lignes avec « splendeur » en or, chapeau, deux boutons
   (WhatsApp or + « Voir la collection »). Animation d'entrée de 0.9s, neutralisée sous
   `prefers-reduced-motion`.
2. **Bande des 4 valeurs** — Authenticité, Élégance, Excellence, Fierté, losange or,
   4 colonnes → 2 sous 900px → 1 sous 520px.
3. **Grille des 6 pièces mises en avant** — alimentée par `pieces.json`, filtrée sur
   `mise_en_avant`. En-tête de section en deux parties avec le bouton « Toute la collection ».
4. **Bloc sur mesure en deux colonnes** — texte à gauche, cadre photo 4:5 à droite.
5. **Appel final** — surtitre, ornement, titre, texte, bouton WhatsApp.

Tous les textes sont repris mot pour mot de la maquette.

## `CartePiece`

Photo 1:1, pastille de référence en or sur fond noir translucide, filet or au-dessus du nom,
« Sur devis » en or, matière, lien « Voir la pièce → » qui s'écarte au survol. Zoom 1.04 au
survol de la photo, neutralisé sous `prefers-reduced-motion`.

Le composant est créé ici alors que `MISSION.md` le range en phase 6 : l'accueil en a besoin
pour sa grille. La phase 6 s'occupera de la page collection, des filtres et de l'alignement
des liens.

## Décisions prises seul

1. **`loading="lazy"` et dimensions explicites sur les photos de carte.** `width`/`height`
   à 414 réservent la place avant chargement et évitent le décalage de mise en page. C'est la
   taille réelle des fichiers provisoires — **à revoir quand les définitives arriveront**.

2. **`alt=""` sur la photo d'ouverture.** Elle est purement décorative, le texte est juste
   à côté. Un `alt` descriptif ferait doublon pour un lecteur d'écran.

3. **Le bouton « Démarrer ma commande » du bloc sur mesure pointe vers `/sur-mesure`**, pas
   vers WhatsApp — c'est ce que fait la maquette. Celui de l'ouverture et celui de l'appel
   final ouvrent bien WhatsApp.

## Défaut connu, non corrigé à cette phase

Sur la capture 1440px, dans la seconde rangée de la grille, **« Ensemble Motifs Sahel » passe
son nom sur deux lignes et son lien « Voir la pièce » descend d'une ligne** par rapport aux
deux cartes voisines. Les cartes ne s'étirent pas à la hauteur de leur rangée, donc le
`margin-top:auto` du lien n'a rien contre quoi pousser.

La maquette a exactement le même comportement. `MISSION.md` range explicitement cette
correction en phase 6 — « Les liens du bas doivent s'aligner entre les cartes d'une même
rangée ». Je l'y traite, avec un contrôle qui compare les positions verticales réelles.

## Point levé depuis la phase 3

La limite consignée en phase 3 est levée : l'accueil a maintenant sa vraie hauteur, et
`resultat.json` indique `elementsSousLaLigneAuChargement: 9`, `portee: "les deux cas sont
exerces"`. Le cas « reste caché tant qu'on n'a pas scrollé » est désormais réellement testé,
et il passe.

## À vérifier visuellement par Mandack

- **L'image d'ouverture est en portrait**, réutilisée de la maquette et recadrée en
  `object-position: center 24%`. CLAUDE.md §9 demande un **paysage 16:9** pour cette place, et
  cette photo n'existe pas encore. Le rendu actuel est un pis-aller.
- Les photos restent les provisoires 414px issues de Facebook. Sur un écran large, la grille
  les affiche au-delà de leur résolution native.

## Sortie brute de `verify.mjs`

```
=== verify.mjs — phase 5 ===

> npm run build
  build OK
   accueil      texte= 2149  console=0  reseau=0  ext=0  selecteurs=9/9
   collection   texte=  758  console=0  reseau=0  ext=0  selecteurs=3/3
   piece        texte=  626  console=0  reseau=0  ext=0  selecteurs=2/2
   piece-404    texte=  628  console=0  reseau=0  ext=0  selecteurs=1/1
   sur-mesure   texte=  861  console=0  reseau=0  ext=0  selecteurs=2/2
   contact      texte=  812  console=0  reseau=0  ext=0  selecteurs=2/2

  [ok] header 1440px : nav visible, burger masque
  [ok] logo visible a 390px
  [ok] bouton WhatsApp du header masque a 390px
  [ok] burger 390px : ouvre puis se referme au clic
  [ok] apparition au scroll
  [ok] transition de 0.7s
  [ok] prefers-reduced-motion : visible sans transition
  [ok] pieces.json : 8 entrees, slugs/refs uniques, photos sur le disque, schema conforme
  [ok] content/pieces -> src/data/pieces.json

VERT — phase 5 : 6 routes, 0 erreur console, 0 erreur reseau.
Captures et detail : verification/phase-5/
```

Sélecteurs de l'accueil : `h1` ×1, `.piece` ×6, `.opener a[href^="https://wa.me/"]` ×1.
Vert au premier passage.
