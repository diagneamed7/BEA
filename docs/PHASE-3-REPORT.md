# PHASE-3-REPORT — Composants partagés

## Fichiers créés ou modifiés

```
créés     src/components/Bouton.jsx
          src/components/Ornement.jsx
          src/components/Surtitre.jsx
          src/components/TitreSection.jsx
          src/components/HautDePage.jsx
          src/hooks/useApparition.js
          src/styles/composants.css
modifiés  src/main.jsx        — import de composants.css
          src/App.jsx         — HautDePage
          src/pages/*.jsx     — les 5 pages utilisent les composants partagés
          scripts/verify.mjs  — contrôles de l'apparition au scroll
```

Aucune dépendance ajoutée.

## Les composants

- **`Bouton`** — variantes `or` (fond doré) et `contour` (filet blanc), option
  `pleineLargeur`. Rend un `<Link>` pour une route interne, un `<a>` (avec `target="_blank"`
  et `rel="noopener"`) pour une URL externe, un `<button type="button"` sinon. Angles droits,
  aucun dégradé ni ombre.
- **`Ornement`** — losange or à 45° entre deux filets. `aligne="gauche"` supprime le filet de
  gauche. `aria-hidden`, purement décoratif.
- **`Surtitre`** — Poppins 600, 11px, `letter-spacing:.28em`, capitales, couleur or.
- **`TitreSection`** — prend un `niveau` pour garder un seul `h1` par page.
- **`useApparition`** — `IntersectionObserver` à `threshold:.1` et
  `rootMargin:'0px 0px -6% 0px'`, délai en cascade de 70ms plafonné à 3 éléments. Fondu
  ascendant de 16px sur 0.7s. Sous `prefers-reduced-motion: reduce`, ou si
  `IntersectionObserver` est absent, les éléments sont révélés immédiatement sans observateur ;
  la CSS neutralise en plus la transition.

## Décisions prises seul

1. **`HautDePage`** — la maquette remontait en haut à chaque changement de route ; React
   Router ne le fait pas. Sans ça, on arrive au milieu d'une fiche pièce après avoir scrollé
   la collection.

2. **Les pages provisoires utilisent réellement les composants.** Elles restent provisoires,
   mais si elles n'affichaient aucun `.eyebrow`, `.rule` ni `.btn`, la phase se terminerait
   au vert sans avoir jamais exercé ce qu'elle produit. Elles seront remplacées en phases 5 à 8.

3. **`useApparition` interroge le DOM plutôt que des refs.** Les `.rv` sont éparpillés dans
   des sous-composants ; une collecte de refs aurait imposé de les faire remonter partout.
   Le hook prend un tableau de dépendances pour se relancer sur les pages dont le contenu
   change sans démontage (la fiche pièce, au changement de slug).

## Le point délicat de cette phase

`MISSION.md` demande explicitement que le script force l'état final avant de mesurer,
faute de quoi les captures sortent vides. C'est fait depuis la phase 1 — mais **ce forçage
masque un hook cassé** : une page dont l'`IntersectionObserver` ne se déclenche jamais passe
au vert, puisque le script met lui-même la classe `in`.

J'ai donc ajouté trois contrôles qui ouvrent leurs propres contextes navigateur et **ne
forcent rien** :

1. `reducedMotion: 'no-preference'` — au chargement, les `.rv` dans le viewport doivent être
   révélés, ceux sous la ligne de flottaison doivent rester cachés ; après scroll en bas et
   1,4s d'attente, tous doivent être à `opacity: 1`.
2. La durée de transition calculée doit bien contenir `0.7s`.
3. `reducedMotion: 'reduce'` — `opacity: 1` et `transition-duration: 0s` dès le chargement,
   sans scroll.

Premier passage de ce contrôle : **échec**, mais l'assertion était fausse, pas le code. Je
vérifiais qu'*aucun* élément n'était révélé au chargement, alors que les éléments déjà
visibles doivent l'être immédiatement — c'est le comportement correct. Assertion reformulée
sur la position réelle de chaque élément.

**Limite consignée** : à cette phase les pages sont trop courtes pour qu'un `.rv` se trouve
sous la ligne de flottaison en 1440×900. Le cas « reste caché tant qu'on n'a pas scrollé »
n'est donc pas réellement exercé. `resultat.json` le dit explicitement, dans le champ
`portee` du contrôle. Il le sera à partir de la phase 5, quand l'accueil aura sa vraie
hauteur — à revoir à ce moment-là.

## Ce qui n'a pas été fait

- Aucun déploiement, aucune commande Netlify.
- Le contenu définitif des pages : phases 5 à 8.

## Sortie brute de `verify.mjs`

```
=== verify.mjs — phase 3 ===

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

VERT — phase 3 : 6 routes, 0 erreur console, 0 erreur reseau.
Captures et detail : verification/phase-3/
```

Passages successifs : échec sur l'assertion mal posée de l'apparition au scroll, puis vert
après reformulation.
