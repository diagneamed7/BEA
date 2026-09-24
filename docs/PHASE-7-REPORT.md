# PHASE-7-REPORT — Fiche pièce

## Fichiers créés ou modifiés

```
créés     src/components/PageErreur.jsx
          src/styles/fiche.css
modifiés  src/pages/Piece.jsx    — fiche alimentée par les données
          src/main.jsx           — import de fiche.css
          scripts/verify.mjs     — contrôle sur les 8 fiches, cadrage d'un sélecteur
```

Aucune dépendance ajoutée.

## La fiche

`/piece/:slug` cherche la pièce dans `pieces.json`. Deux colonnes : photo 1:1 encadrée d'un
filet or à gauche ; à droite le surtitre « Catégorie · Genre », le nom en `h1`, « Sur devis »
en or, la description, le tableau de specs en `<dl>`, puis les deux boutons pleine largeur et
la note. Une colonne sous 880px, et les lignes de specs passent en vertical sous 520px —
sinon le libellé de 120px écrase la valeur sur un téléphone.

Le bouton or ouvre WhatsApp avec le message de `MESSAGES.piece(nom, ref)` :

```
Bonjour BEA, je suis intéressé par le modèle Boubou Damier (BEA-001).
Pouvez-vous me donner le prix et les délais ?
```

Tout passe par `src/config/contact.js` — aucune coordonnée en dur dans le composant.

## Le slug inexistant

`PageErreur` est un composant partagé, pas un message inline : la phase 10 en a besoin pour
le 404 global. Elle affiche le code, un titre, un texte, et **trois sorties** — collection,
accueil, WhatsApp. Pas d'écran blanc, et la page reste navigable avec header et footer.

Le texte est adapté au contexte : sur un slug de pièce inconnu, « Cette pièce n'est pas à la
collection », pas un 404 générique.

## Décisions prises seul

1. **Les specs Confection / Tailles / Livraison sont écrites en dur dans le composant**, pas
   dans les données. Elles sont identiques sur les huit fiches de la maquette et ne varient
   pas par pièce ; les mettre dans `content/pieces/` aurait obligé le client à les ressaisir
   huit fois dans Decap, avec le risque qu'elles divergent. **Si un délai doit changer, c'est
   dans `src/pages/Piece.jsx`** — à signaler à Mandack, car ce n'est pas modifiable depuis le
   CMS.

2. **Pas de `loading="lazy"` sur la photo de la fiche**, contrairement aux cartes : c'est
   l'image principale de la page, au-dessus de la ligne de flottaison.

3. **`PageErreur` prend ses textes en props** plutôt que de les figer, pour être réutilisable
   telle quelle en phase 10.

## Défaut trouvé et corrigé pendant la phase

Le contrôle du lien WhatsApp a échoué au premier passage :

```
[KO] href WhatsApp contient nom + reference
     'https://wa.me/221772524984?text=Bonjour BEA, je souhaite des informations.'
```

**Le défaut était dans le test, pas dans la page.** Le sélecteur
`a.btn--wa[href^="https://wa.me/"]` avec `.first()` attrapait le bouton « Nous écrire » du
header, qui apparaît plus haut dans le DOM. Recadré sur `.detail .buy a.btn--wa[...]`, côté
sélecteur attendu comme côté contrôle.

C'est le genre d'erreur qui, dans l'autre sens, aurait fait passer la phase au vert à tort :
si le header avait porté par hasard le bon texte, le test n'aurait rien vu.

## Contrôle ajouté : les 8 fiches, pas seulement une

`MISSION.md` demande de vérifier « sur une fiche » que le `href` contient la référence. Une
seule fiche ne prouve rien contre un message figé en dur. Le script ouvre donc **les huit**
et vérifie pour chacune que le lien WhatsApp contient **son** nom et **sa** référence, et que
le `h1` est bien celui de la pièce.

## Ce qui n'a pas été fait

- Aucun déploiement, aucune commande Netlify.
- Pas de galerie multi-photos : hors périmètre (CLAUDE.md §12). Le champ `photos` est un
  tableau, seule la première image est affichée.
- Le 404 **global** (URL hors `/piece/`) arrive en phase 10 ; `PageErreur` est prête.
- Les specs ne sont pas éditables depuis le CMS (voir décision 1).

## Sortie brute de `verify.mjs`

```
=== verify.mjs — phase 7 ===

> npm run build
  build OK
   accueil      texte= 2149  console=0  reseau=0  ext=0  selecteurs=9/9
   collection   texte= 1330  console=0  reseau=0  ext=0  selecteurs=5/5
   piece        texte= 1093  console=0  reseau=0  ext=0  selecteurs=5/5
   piece-404    texte=  742  console=0  reseau=0  ext=0  selecteurs=2/2
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
  [ok] href WhatsApp contient nom + reference
  [ok] les 8 fiches : titre et lien WhatsApp propres a la piece
  [ok] apparition au scroll
  [ok] transition de 0.7s
  [ok] prefers-reduced-motion : visible sans transition
  [ok] pieces.json : 8 entrees, slugs/refs uniques, photos sur le disque, schema conforme
  [ok] content/pieces -> src/data/pieces.json

VERT — phase 7 : 6 routes, 0 erreur console, 0 erreur reseau.
Captures et detail : verification/phase-7/
```

Passages : échec sur le cadrage du sélecteur, puis vert.
