# PHASE-4-REPORT — Données

## Fichiers créés ou modifiés

```
créés     content/pieces/bea-001.json … bea-008.json
modifiés  src/data/pieces.json   — compilé, 8 entrées
          scripts/verify.mjs     — contrôles de schéma et d'intégrité
déjà là   scripts/build-pieces.js        (créé en phase 1 pour le hook prebuild)
          public/images/pieces/bea-00{1..8}-1.jpg  (extraites en phase 1)
```

Aucune dépendance ajoutée.

## Le contenu

Les 8 pièces sont reprises **mot pour mot** de la maquette validée : nom, catégorie, genre,
matière et description. Rien n'a été réécrit, résumé ni complété. Les catégories tombent sur
les quatre valeurs attendues :

| Catégorie | Pièces |
|---|---|
| Boubous   | BEA-001, BEA-002, BEA-007, BEA-008 |
| Kaftans   | BEA-003 |
| Ensembles | BEA-004 |
| Kimonos   | BEA-005, BEA-006 |

Kimonos en compte exactement 2, ce qui est la valeur que le contrôle du filtre de la phase 6
attend.

## La compilation

`scripts/build-pieces.js` lit `content/pieces/*.json`, trie par `ordre` et écrit
`src/data/pieces.json`. Branché en `prebuild`, donc `npm run build` le rejoue toujours :

```
> bea-site@1.0.0 prebuild
> node scripts/build-pieces.js
build-pieces : 8 piece(s) -> src/data/pieces.json
```

## Décisions prises seul

1. **`slug` tiré du nom, pas de la référence.** La maquette routait sur `#/piece/BEA-001`,
   mais CLAUDE.md §6 donne `"slug": "boubou-damier"` dans le modèle de données. J'ai suivi
   CLAUDE.md : les URL sont lisibles (`/piece/kaftan-capuche-ecru`) et c'est meilleur pour le
   référencement. La référence reste affichée sur la carte et la fiche, et part dans le
   message WhatsApp.

2. **`mise_en_avant: true` sur BEA-001 à BEA-006.** Ce sont exactement les six pièces que la
   maquette montre sur l'accueil, dans cet ordre.

3. **`ordre` de 1 à 8**, dans l'ordre de la maquette.

4. **`nom_en` et `description_en` à `null`.** Les champs existent dans le schéma comme demandé
   en §7, mais restent vides : aucune traduction ne m'a été fournie et je n'en invente pas.

5. **Aucun champ prix**, conformément à §6 — le prix est toujours « Sur devis ».

## Contrôles ajoutés à `verify.mjs`

Au-delà des trois contraintes demandées (8 entrées, slug unique, au moins une photo existante
sur le disque), le script vérifie aussi :

- unicité des **références** en plus des slugs ;
- **chaque** photo de **chaque** pièce existe sur le disque, pas seulement la première ;
- les 12 champs du schéma §6 sont présents sur chaque pièce ;
- la catégorie appartient bien aux quatre valeurs autorisées ;
- **aucune pièce ne porte de champ prix** — une régression facile à introduire depuis le CMS ;
- `nom_en` et `description_en` sont **vides** — le bilingue doit rester désactivé tant qu'il
  n'est pas décidé ;
- le nombre de fichiers dans `content/pieces/` correspond au nombre de pièces compilées, ce
  qui attrape un fichier mal nommé ou un JSON ignoré silencieusement.

## Ce qui n'a pas été fait

- Aucun déploiement, aucune commande Netlify.
- Les pièces ne sont encore **affichées** nulle part : l'accueil les consomme en phase 5, la
  collection en phase 6, la fiche en phase 7.
- Pas de galerie multi-photos : chaque pièce n'a qu'une image, et c'est hors périmètre (§12).
  Le champ `photos` est déjà un tableau, donc prêt.

## Rappel sur les photos

Elles restent provisoires : 414px de large, issues de Facebook, extraites de la maquette en
phase 1. Aucune optimisation définitive n'a été construite autour d'elles. **À remplacer par
les définitives en haute résolution** — les noms de fichiers sont stables
(`/images/pieces/bea-00X-1.jpg`), un remplacement à l'identique suffira.

## Sortie brute de `verify.mjs`

```
=== verify.mjs — phase 4 ===

> npm run build
  build OK
   accueil      texte=  781  console=0  reseau=0  ext=0  selecteurs=6/6
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

VERT — phase 4 : 6 routes, 0 erreur console, 0 erreur reseau.
Captures et detail : verification/phase-4/
```

Vert au premier passage.
