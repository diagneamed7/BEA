# PHASE-2-REPORT — Header et footer

## Fichiers créés ou modifiés

```
créés     src/components/Header.jsx
          src/components/Footer.jsx
          src/components/Logo.jsx
          src/styles/layout.css
modifiés  src/App.jsx        — Header et Footer autour des Routes
          src/main.jsx       — import de layout.css
          src/styles/global.css  — #root en colonne flex (pied de page en bas)
          scripts/verify.mjs — contrôles de comportement du header
```

Aucune dépendance ajoutée.

## Header

Collant (`position:sticky`), fond `rgba(0,0,0,.94)` avec `backdrop-filter:blur(8px)`,
filet or en bas (`--or-ligne`). Logo SVG blanc et or + wordmark « BEA / Bamba Élégance
Africaine ». Navigation Collection / Sur mesure / Contact en `NavLink`, soulignée en or sur
la route active. Bouton or « Nous écrire » vers WhatsApp.

Sous 980px : navigation et bouton WhatsApp masqués, burger affiché. Le tiroir se referme au
clic sur un lien, et aussi à tout changement de route (`useEffect` sur `pathname`) — sinon un
retour arrière navigateur le laisserait ouvert. `aria-expanded` et `aria-controls` sur le
bouton, `hidden` sur le tiroir fermé.

Sous 560px : seul le bloc de mots disparaît, **le logo reste affiché**, comme demandé.

## Footer

Logo, phrase de présentation reprise mot pour mot de la maquette, colonne Navigation,
colonne « Suivre BEA » avec les quatre liens réels tirés de `contact.js` (Instagram,
Facebook, TikTok, WhatsApp), bas de page avec le copyright et « Mentions légales ».

## Décisions prises seul

1. **Logo en `<img>`, pas en SVG inline.** `vite-plugin-svgr` aurait été une dépendance de
   plus pour rien : le SVG porte ses couleurs en dur (blanc et or), il n'a aucun besoin
   d'hériter de `currentColor`. `Logo.jsx` ne fait que l'afficher, sans recolorer ni
   transformer. Requête same-origin, comptée par `verify.mjs`.

2. **« Mentions légales » en texte, pas en lien.** La page n'existe qu'en phase 10. Un lien
   vers une route inexistante aurait affiché une page vide. Il sera branché en phase 10.

3. **Année du copyright calculée** (`new Date().getFullYear()`) plutôt que figée à 2026 comme
   dans la maquette, pour éviter un pied de page périmé au 1er janvier.

4. **`#root` en colonne flex, `main` en `flex:1`.** Sans ça, sur les pages courtes de cette
   phase, le pied de page remontait au milieu de l'écran.

## Défaut trouvé et corrigé pendant la phase

La capture 390px du premier passage montrait le bouton or « Nous écrire » **toujours visible**
alors que `@media(max-width:980px){.hdr-wa{display:none}}` était bien écrit. Cause : le bloc
`.btn{display:inline-flex}` est déclaré plus bas dans `layout.css`. À spécificité égale
(0,1,0 contre 0,1,0), une media query n'ajoute rien au poids du sélecteur et c'est la règle la
plus tardive qui gagne. Corrigé en passant les règles de la media query à `.hdr .nav`,
`.hdr .hdr-wa`, `.hdr .burger`.

Ce défaut n'était attrapé par aucun des deux sélecteurs demandés par `MISSION.md` : le
`header a[href^="https://wa.me/"]` existait bien, il était simplement affiché au mauvais
endroit. J'ai donc ajouté quatre contrôles de comportement, pas seulement de présence :

- à 1440px : navigation visible, bouton WhatsApp visible, burger masqué ;
- à 390px : logo visible avec une boîte englobante non dégénérée (largeur > 40px) ;
- à 390px : bouton WhatsApp du header masqué — **c'est celui qui a levé le défaut** ;
- à 390px : le burger ouvre le tiroir, un clic sur un lien le referme.

## Ce qui n'a pas été fait

- Aucun déploiement, aucune commande Netlify.
- Le contenu des pages reste provisoire : les écrans arrivent en phases 5 à 8.
- Page mentions légales : phase 10.

## Sortie brute de `verify.mjs`

```
=== verify.mjs — phase 2 ===

> npm run build
  build OK
   accueil      texte=  523  console=0  reseau=0  ext=0  selecteurs=3/3
   collection   texte=  544  console=0  reseau=0  ext=0  selecteurs=3/3
   piece        texte=  563  console=0  reseau=0  ext=0  selecteurs=2/2
   piece-404    texte=  565  console=0  reseau=0  ext=0  selecteurs=1/1
   sur-mesure   texte=  741  console=0  reseau=0  ext=0  selecteurs=2/2
   contact      texte=  652  console=0  reseau=0  ext=0  selecteurs=2/2

  [ok] header 1440px : nav visible, burger masque
  [ok] logo visible a 390px
  [ok] bouton WhatsApp du header masque a 390px
  [ok] burger 390px : ouvre puis se referme au clic

VERT — phase 2 : 6 routes, 0 erreur console, 0 erreur reseau.
Captures et detail : verification/phase-2/
```

Polices effectivement chargées sur chaque route : `Cinzel 700`, `Poppins 500`, `Poppins 600`,
`Inter 400`. Aucune requête hors origine (`ext=0`).

Passages successifs : premier passage vert sur les sélecteurs demandés, puis **échec** sur le
nouveau contrôle du bouton WhatsApp à 390px, puis vert après correction de la spécificité CSS.
