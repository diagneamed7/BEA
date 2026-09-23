# PHASE-9-REPORT — Decap CMS

## Fichiers créés ou modifiés

```
créés     public/admin/index.html
          public/admin/config.yml
modifiés  package.json        — ajout de `yaml` en devDependency
          scripts/verify.mjs  — contrôles de l'administration
```

## Dépendance ajoutée : `yaml` (devDependency)

`MISSION.md` demande de vérifier que `config.yml` est un **YAML valide**. Sans parseur, le
script ne pourrait que chercher des chaînes de caractères — ce qui laisserait passer un fichier
mal indenté, donc un CMS qui refuse de démarrer. `yaml` n'est utilisé que par `verify.mjs` et
n'entre pas dans le bundle du site.

## La collection « Pièces »

`content/pieces`, en JSON (`extension: json`, `format: json`), slug basé sur la référence.
Les **12 champs** du modèle de CLAUDE.md §6, pas seulement les 8 obligatoires :

| Champ | Widget | Remarque |
|---|---|---|
| `ref` | string | motif `^BEA-\d{3}$` avec message d'erreur en français |
| `slug` | string | motif `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `nom` | string | `identifier_field` de la collection |
| `categorie` | select | les 4 valeurs autorisées, pas de saisie libre |
| `genre` | select | Homme / Femme / Mixte |
| `matiere` | string | |
| `description` | text | |
| `photos` | list d'images | vers `public/images/pieces` |
| `mise_en_avant` | boolean | |
| `ordre` | number entier, min 1 | |
| `nom_en` | string, **optionnel** | |
| `description_en` | text, **optionnel** | |

Les motifs et les `select` ne sont pas décoratifs : une référence hors format ou une catégorie
inventée casserait le filtre de la collection et l'URL de la fiche. Le CMS refuse maintenant
la saisie au lieu de laisser le site se dégrader.

`commit_messages` est en français et préfixé `cms:`, pour distinguer d'un coup d'œil ce qui
vient du CMS de ce qui vient du code dans l'historique Git.

## Bilingue

`nom_en` et `description_en` sont présents dans Decap mais marqués `required: false`, avec un
libellé qui dit de les laisser vides. Aucun sélecteur de langue, aucune route `/en/`. La
structure est prête, la fonctionnalité est éteinte — conformément à CLAUDE.md §7.

## Décision prise seul, à revoir si tu veux

**Decap et Netlify Identity sont chargés depuis un CDN.** C'est l'installation standard de
Decap, et c'est la **seule dépendance tierce de tout le projet** : les cinq pages publiques
n'appellent aucun domaine externe, les polices étant servies en local.

Les versions sont **épinglées** (`decap-cms@3.16.3`, pas `@^3` ni `@latest`) — le script le
vérifie. Une mise à jour silencieuse du CMS est exactement le genre de chose qui casse un
back-office un lundi matin.

Si tu préfères que l'admin soit lui aussi autonome : `npm pack decap-cms@3.16.3`, copier le
contenu de `dist/` dans `public/admin/` et pointer le `<script>` sur `./decap-cms.js`. Je ne
l'ai pas fait parce que le bundle fait **6 Mo répartis sur 99 fichiers** chargés paresseusement,
que leurs noms changent à chaque version, et que ça alourdirait le dépôt de façon permanente
pour une page que toi seul ouvres, depuis une machine connectée.

## Ce que la vérification prouve — et ce qu'elle ne prouve pas

**Elle prouve** : `/admin/` répond 200 ; la page référence bien un bundle Decap à version
épinglée et le widget Netlify Identity ; elle porte `noindex` ; `config.yml` est servi avec un
`content-type` YAML et n'est pas avalé par le repli SPA ; il se parse ; il contient les 12
champs ; `nom_en` et `description_en` sont optionnels ; `media_folder` et `public_folder`
pointent au bon endroit ; le backend est `git-gateway` ; aucun champ prix n'a été réintroduit ;
et **toutes les clés des fichiers de `content/pieces/` sont couvertes par le schéma** — un
champ ajouté au JSON sans être ajouté au CMS serait écrasé au premier enregistrement.

**Elle ne prouve pas** que le CMS démarre. Le bundle vient d'unpkg, hors allowlist du bac à
sable : il ne se charge pas ici, et de toute façon Git Gateway a besoin d'un site Netlify
déployé et d'Identity activé pour répondre. **À vérifier par Mandack après déploiement** :
ouvrir `/admin/`, se connecter, modifier une pièce, et confirmer que le commit arrive bien sur
`main`.

## Ce qui n'a pas été fait

- **Aucun déploiement, aucune activation de Netlify Identity, aucun compte créé.** La
  configuration est écrite, elle n'est pas branchée.
- `branch: main` est posé par défaut. **À corriger si ta branche de production porte un autre
  nom** — le CMS committerait sur une branche inexistante.
- Pas de workflow éditorial (`publish_mode: editorial_workflow`) : il suppose des pull requests
  et ne se justifie pas pour un site tenu par une seule personne.

## Sortie brute de `verify.mjs`

```
=== verify.mjs — phase 9 ===

> npm run build
  build OK
   accueil      texte= 2149  console=0  reseau=0  ext=0  selecteurs=9/9
   collection   texte= 1330  console=0  reseau=0  ext=0  selecteurs=5/5
   piece        texte= 1093  console=0  reseau=0  ext=0  selecteurs=5/5
   piece-404    texte=  742  console=0  reseau=0  ext=0  selecteurs=2/2
   sur-mesure   texte= 1597  console=0  reseau=0  ext=0  selecteurs=5/5
   contact      texte= 1163  console=0  reseau=0  ext=0  selecteurs=4/4

  [ok] /admin/ repond et charge Decap + Netlify Identity
  [ok] config.yml servi en YAML
  [ok] config.yml : YAML valide, 12 champs, media et backend conformes
  [ok] le CMS couvre toutes les cles des fichiers existants
  ... (les 15 contrôles des phases 2 à 8, tous au vert)

VERT — phase 9 : 6 routes, 0 erreur console, 0 erreur reseau.
Captures et detail : verification/phase-9/
```

Vert au premier passage.
