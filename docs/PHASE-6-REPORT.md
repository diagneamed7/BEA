# PHASE-6-REPORT — Collection et carte pièce

## Fichiers créés ou modifiés

```
modifiés  src/pages/Collection.jsx   — page complète avec filtres
          src/styles/pieces.css      — chips de filtre, compteur
          scripts/verify.mjs         — alignement des liens, filtres
          PHASE-5-REPORT.md          — correction d'une affirmation fausse (voir plus bas)
```

`CartePiece` avait été créée en phase 5, l'accueil en ayant besoin pour sa grille. Elle n'a
pas eu à changer ici : photo 1:1, pastille de référence, filet or, nom, « Sur devis »,
matière, lien.

Aucune dépendance ajoutée.

## La page collection

En-tête de section, cinq filtres (Tout, Boubous, Kaftans, Ensembles, Kimonos), grille des
8 pièces, compteur en bas.

Le filtrage se fait en React — la liste rendue change — plutôt qu'en masquant des nœuds en
CSS comme le faisait la maquette. Conséquence à gérer : les cartes qui remontent après un
changement de filtre arrivent avec la classe `.rv` et sans `.in`, donc invisibles.
`useApparition` est relancé sur la catégorie (`useApparition([categorie])`) et ne réobserve
que les `.rv:not(.in)`, ce qui les révèle à leur tour.

Accessibilité : les filtres sont dans un `role="group"` étiqueté, chaque bouton porte
`aria-pressed`, et le compteur est en `aria-live="polite"` — sans ça, un lecteur d'écran
n'annonce rien quand la grille change.

## Correction d'une erreur du rapport précédent

`PHASE-5-REPORT.md` signalait un défaut d'alignement des liens de carte, constaté à l'œil sur
une capture réduite, et le renvoyait à cette phase. **Le défaut n'existait pas.** La mesure :

| Rangée 2 de l'accueil | `top` du lien |
|---|---|
| Ensemble Motifs Sahel | 2279 |
| Kimono Imprimé | 2279 |
| Kimono Indigo | 2279 |

Écart : 0px. Ce que j'avais pris pour un désalignement était le titre sur deux lignes qui
décale la ligne de matière au-dessus du lien. Les cartes s'étirent correctement à la hauteur
de leur rangée. J'ai corrigé `PHASE-5-REPORT.md` plutôt que de laisser une affirmation fausse
dans l'historique.

La leçon vaut pour la suite : une capture réduite ne prouve rien, seule la mesure compte. D'où
le contrôle ci-dessous.

## Contrôles ajoutés à `verify.mjs`

1. **Alignement des liens de carte**, sur l'accueil *et* sur la collection : les cartes sont
   regroupées par position verticale, et l'écart entre le lien le plus haut et le plus bas de
   chaque rangée doit rester sous 2px (tolérance pour les arrondis sous-pixel).
2. **Filtre Kimonos** — exactement 2 pièces, comme demandé. Le contrôle vérifie en plus que
   les cartes sont réellement **opaques** après le filtrage, pas seulement présentes : c'est
   le piège de l'apparition au scroll décrit plus haut, et un simple comptage serait passé au
   vert sur une grille invisible. Le chip actif doit aussi être le bon.
3. **Retour au filtre « Tout »** — les 8 pièces reviennent.

## Ce qui n'a pas été fait

- Aucun déploiement, aucune commande Netlify.
- Pas d'URL par filtre (`/collection?categorie=Kimonos`) : ce n'est pas demandé, et ça
  n'existe pas dans la maquette. Un filtre choisi n'est donc pas partageable par lien.
- La fiche pièce reste provisoire : phase 7.

## Sortie brute de `verify.mjs`

```
=== verify.mjs — phase 6 ===

> npm run build
  build OK
   accueil      texte= 2149  console=0  reseau=0  ext=0  selecteurs=9/9
   collection   texte= 1330  console=0  reseau=0  ext=0  selecteurs=5/5
   piece        texte=  626  console=0  reseau=0  ext=0  selecteurs=2/2
   piece-404    texte=  628  console=0  reseau=0  ext=0  selecteurs=1/1
   sur-mesure   texte=  861  console=0  reseau=0  ext=0  selecteurs=2/2
   contact      texte=  812  console=0  reseau=0  ext=0  selecteurs=2/2

  [ok] header 1440px : nav visible, burger masque
  [ok] alignement des liens de carte (accueil)
  [ok] logo visible a 390px
  [ok] bouton WhatsApp du header masque a 390px
  [ok] burger 390px : ouvre puis se referme au clic
  [ok] alignement des liens de carte (collection)
  [ok] filtre Kimonos = 2 pieces, visibles et non transparentes
  [ok] retour au filtre Tout = 8 pieces
  [ok] apparition au scroll
  [ok] transition de 0.7s
  [ok] prefers-reduced-motion : visible sans transition
  [ok] pieces.json : 8 entrees, slugs/refs uniques, photos sur le disque, schema conforme
  [ok] content/pieces -> src/data/pieces.json

VERT — phase 6 : 6 routes, 0 erreur console, 0 erreur reseau.
Captures et detail : verification/phase-6/
```

Vert au premier passage.
