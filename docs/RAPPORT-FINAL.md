# RAPPORT FINAL — Site BEA

Site vitrine-catalogue pour **BEA — Bamba Élégance Africaine**. Dix phases enchaînées sans
validation intermédiaire, chacune vérifiée par `scripts/verify.mjs` et close par un commit.

**État : les 10 phases sont au vert.** Dernier passage : 8 routes, 0 erreur console,
0 erreur réseau, 0 requête hors origine, 29 contrôles spécifiques tous verts.

---

## Comment lancer le projet

```bash
npm install
npx playwright install chromium   # une seule fois, pour la vérification
npm run dev                       # http://localhost:5173
```

```bash
npm run build     # prebuild (compilation des pièces) → vite build → compression des images
npm run preview   # sert dist/
node scripts/verify.mjs 10   # harnais complet : build + 8 routes + 29 contrôles
```

**Aucun déploiement n'a été fait, à aucun moment.** Aucune commande Netlify, aucun compte
créé, aucun nom de domaine, aucun achat.

---

## Ce qui a été construit

Cinq écrans, plus deux pages de service :

| Route | Contenu |
|---|---|
| `/` | Ouverture plein cadre, 4 valeurs, 6 pièces mises en avant, bloc sur mesure, appel final |
| `/collection` | Les 8 pièces, filtres par catégorie, compteur |
| `/piece/:slug` | Photo, specs, description, WhatsApp pré-rempli avec le nom et la référence |
| `/sur-mesure` | 3 étapes + formulaire qui compose un message WhatsApp côté client |
| `/contact` | Coordonnées réelles, réseaux, prise de mesures à distance |
| `/mentions-legales` | Structure vide, 6 rubriques à compléter |
| `*` | 404 propre, avec header, footer et trois sorties |

**Pas de e-commerce** : aucun panier, aucun paiement, aucun compte client. Chaque appel à
l'action ouvre une conversation WhatsApp pré-remplie.

### Stack

React 18 + Vite, React Router en URL réelles (pas de hash), CSS natif avec variables.
Pas de Tailwind, pas de bibliothèque de composants.

**Dépendances de production : 3** — `react`, `react-dom`, `react-router-dom`.
**Dépendances de développement : 4** — `vite`, `@vitejs/plugin-react`, `playwright` (exigée
par CLAUDE.md §10), `yaml` (validation de `config.yml`), `sharp` (compression au build).

### Charte

Variante noir profond, les tokens de CLAUDE.md §4 dans `src/styles/tokens.css`.
`border-radius: 0` partout, aucun dégradé, aucune ombre, aucun carrousel. Une seule animation
d'apparition (fondu ascendant 16px / 0.7s) plus le zoom 1.04 au survol des photos, les deux
neutralisés sous `prefers-reduced-motion`.

Aucune coordonnée en dur dans un composant : tout passe par `src/config/contact.js`.

---

## Décisions prises seul

1. **`design-reference/` ne contenait que `files.zip`.** Je l'ai décompressé sur place pour
   lire `CLAUDE.md` et `MISSION.md`. Rien d'autre n'a été touché dans ce dossier.

2. **Logo extrait de la maquette.** `design-reference/logo-bea.svg` n'existe pas sous ce nom,
   mais le logo est bien présent dans `design-reference/`, en SVG inline dans la maquette
   validée. Repris tel quel, sans recoloration, vers `src/assets/logo-bea.svg`.

3. **Photos extraites de la maquette, pas de `design-reference/photo/`.** Les 8 JPEG de ce
   dossier ne correspondent pas, au binaire près, aux images embarquées dans la maquette
   (réencodées). Extraire celles de la maquette garantit la correspondance exacte
   pièce ↔ photo via l'attribut `alt`.

4. **Slugs tirés des noms** (`/piece/boubou-damier`), conformément au modèle de CLAUDE.md §6,
   là où la maquette routait sur la référence. La référence reste affichée et part dans le
   message WhatsApp.

5. **Polices hébergées en local** (`public/fonts/`, 8 woff2, sous-ensembles `latin` et
   `latin-ext`). Écart assumé avec CLAUDE.md §4 qui indiquait Google Fonts : familles,
   graisses et rôles identiques, seul l'hébergement change. Le site n'appelle **aucun domaine
   externe**.

6. **Specs de la fiche écrites en dur** (Confection / Tailles / Livraison). Identiques sur les
   huit pièces ; les mettre dans les données aurait obligé à les ressaisir huit fois dans le
   CMS. **Conséquence : elles ne sont pas modifiables depuis Decap** — voir « Points ouverts ».

7. **Decap chargé depuis un CDN**, version épinglée. Seule dépendance tierce du projet, sur
   `/admin/` uniquement. Le détail et la recette pour s'en passer sont dans
   `PHASE-9-REPORT.md`.

8. **Année du copyright calculée**, pas figée à 2026.

9. **`verify.mjs` a été exécuté dans un environnement cloud**, la machine bloquant le
   téléchargement du navigateur Playwright (`cdn.playwright.dev` → 403). Le script n'a rien de
   spécifique à cet environnement : `npx playwright install chromium` puis
   `node scripts/verify.mjs 10` le rejoue à l'identique en local.

---

## Le harnais de vérification

`node scripts/verify.mjs <phase>` lance le build, sert `dist/`, et pour chaque route :
échoue à la moindre erreur console, à toute requête en échec, à toute **requête hors
origine**, si le texte rendu fait moins de 200 caractères, ou si un sélecteur clé manque.
Il capture chaque route en pleine page à 1440px et 390px et écrit `resultat.json`.

Les contrôles sont **cumulatifs** : la phase 10 rejoue tout ce que les phases 2 à 9 ont posé.

Trois choses valent d'être signalées, parce qu'elles sont le contraire d'un test décoratif :

- **L'état final de l'animation est forcé avant toute mesure**, comme demandé — mais ce
  forçage masquerait un hook cassé. Trois contrôles supplémentaires ouvrent donc leurs propres
  contextes navigateur et **ne forcent rien** : révélation au scroll, durée de transition,
  `prefers-reduced-motion`.
- **Le formulaire sur mesure** : le script vide son journal de requêtes juste avant le clic et
  vérifie qu'il reste vide. C'est la traduction mesurable de « sans aucun envoi serveur ».
- **Les 8 fiches sont ouvertes une par une**, pas une seule, pour vérifier que chaque lien
  WhatsApp porte bien **son** nom et **sa** référence — un message figé en dur passerait un
  test sur une seule fiche.

### Les cinq défauts que le harnais a attrapés

| Phase | Défaut | Nature |
|---|---|---|
| 1 | Deux pages sous 200 caractères | Code |
| 2 | Bouton WhatsApp du header visible sous 980px — `.btn` déclaré après la media query, spécificité égale, la règle la plus tardive gagnait | **Code** |
| 3 | Assertion fausse : je vérifiais qu'aucun élément n'était révélé au chargement, alors que ceux dans le viewport doivent l'être | Test |
| 7 | Le contrôle du lien WhatsApp attrapait le bouton du header, pas celui de la fiche | Test |
| 10 | La page collection gardait le titre par défaut — mon insertion automatique du hook ne matchait pas `useApparition([categorie])` | **Code** |

Deux défauts de code réels, dont un — le bouton à 390px — qu'aucun des deux sélecteurs demandés
par `MISSION.md` n'aurait vu : le lien existait, il était simplement affiché au mauvais endroit.

### Une erreur de ma part, corrigée

`PHASE-5-REPORT.md` affirmait un défaut d'alignement des liens de carte, constaté à l'œil sur
une capture réduite. **Le défaut n'existait pas** : la mesure en phase 6 donne un écart de
0px. J'ai corrigé le rapport plutôt que de laisser une affirmation fausse dans l'historique,
et ajouté le contrôle qui mesure au lieu de regarder.

De même, en phase 8, le contrôle « aucune requête réseau » affichait `[ok]` à côté d'une liste
de huit requêtes : le tableau était capturé par référence et continuait de se remplir. Verdict
juste, preuve écrite fausse — corrigé.

---

## À vérifier visuellement par Mandack

1. **L'image d'ouverture est en portrait.** Réutilisée de la maquette, recadrée en
   `object-position: center 24%`. CLAUDE.md §9 demande un **paysage 16:9** à cette place, et
   cette photo n'existe pas encore. Le rendu actuel est un pis-aller.
2. **Les photos sont les provisoires : 414px de large, issues de Facebook.** Sur un écran
   large, la grille les affiche au-delà de leur résolution native. Aucune optimisation
   définitive n'a été construite autour d'elles. Les noms de fichiers sont stables
   (`/images/pieces/bea-00X-1.jpg`) : un remplacement à l'identique suffira.
3. **Le rendu des trois polices** en local, et la justesse du gras de Cinzel sur les titres.
4. **La fidélité générale à la maquette**, écran par écran, dans
   `verification/captures-finales/`.
5. **Le favicon** dans un onglet clair et un onglet sombre — il a un fond noir pour que le
   point blanc du symbole reste visible.

---

## Points ouverts

| Sujet | Détail |
|---|---|
| **Déploiement** | Rien n'est déployé. Il faudra un `_redirects` Netlify (`/* /index.html 200`) pour que les URL profondes répondent en accès direct. |
| **Branche du CMS** | `config.yml` pose `branch: main`. **À corriger si ta branche de production porte un autre nom** — le CMS committerait dans le vide. |
| **Netlify Identity** | Configuré, non activé. La vérification prouve que `/admin/` répond et que `config.yml` est valide, **pas que le CMS démarre** : le bundle vient d'unpkg et Git Gateway exige un site déployé. À tester après mise en ligne : se connecter, modifier une pièce, confirmer le commit sur la branche. |
| **Specs de la fiche** | Confection, Tailles, Livraison sont dans `src/pages/Piece.jsx`, pas dans le CMS. Un changement de délai passe par le code. |
| **SEO et partage social** | Les `<title>` et meta descriptions sont posés côté client. Google les voit ; un aperçu WhatsApp ou Facebook, qui lit le HTML brut, verra les valeurs par défaut d'`index.html`. Un pré-rendu serait nécessaire — sujet réel pour un site dont le trafic viendra des réseaux. |
| **Mentions légales** | Six rubriques sur neuf affichent « À compléter ». Rien n'a été inventé : ni raison sociale, ni immatriculation, ni adresse, ni hébergeur. |
| **Image de partage Open Graph** | Hors périmètre (CLAUDE.md §12), et la photo d'ouverture définitive manque. |
| **Version anglaise** | Structure prête (`nom_en`, `description_en` dans le schéma et dans Decap, marqués optionnels), fonctionnalité éteinte. Aucun sélecteur de langue, aucune route `/en/`. |
| **Galerie multi-photos** | Hors périmètre. Le champ `photos` est déjà un tableau, seule la première image est affichée. |
| **Filtres non partageables** | Le filtre de la collection n'est pas dans l'URL. Ni demandé, ni présent dans la maquette. |

---

## Les captures

`verification/captures-finales/` — l'état final, une capture pleine page par écran, en bureau
(1440px) et en mobile (390px), numérotées dans l'ordre de lecture. `verification/README.md`
explique le reste de l'arborescence.

`verification/phase-1/` à `phase-10/` conservent l'état à la fin de chaque phase, avec le
`resultat.json` correspondant : erreurs, polices chargées, sélecteurs, valeurs mesurées de
chaque contrôle.

---

## Commits

```
899ec6d phase-10: 404 global, mentions legales, titres et descriptions, favicon, compression
6953d1e phase-9:  Decap CMS (admin, config.yml 12 champs, Netlify Identity non deploye)
885d9c3 phase-8:  sur mesure avec formulaire WhatsApp cote client, page contact
8f924ea phase-7:  fiche piece alimentee par les donnees, page erreur partagee
f4ed40c phase-6:  page collection avec filtres par categorie, controle d'alignement
54c42c1 phase-5:  accueil complet (ouverture, valeurs, grille, sur mesure, appel final)
bdc004f phase-4:  8 pieces en JSON, compilation prebuild vers src/data/pieces.json
95ff02a phase-3:  composants partages et hook d'apparition
b11a5ad phase-2:  header collant avec burger, footer, composant Logo
72dac7b phase-1:  socle Vite+React, routes, charte, polices locales, harnais verify.mjs
```

Un `PHASE-X-REPORT.md` par phase, à la racine : fichiers touchés, décisions prises seul, ce
qui n'a pas été fait et pourquoi, et la sortie brute de `verify.mjs`.

Aucun `BLOCAGE.md` n'a été écrit : aucune des conditions d'arrêt de CLAUDE.md §11 n'a été
rencontrée.
