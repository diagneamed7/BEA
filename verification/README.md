# verification/

Sortie du harnais `scripts/verify.mjs`. Rien ici n'est écrit à la main.

## Où regarder en premier

**`captures-finales/`** — l'état final du site, une capture pleine page par écran, en
bureau (1440px) et en mobile (390px), numérotées dans l'ordre de lecture :

```
01-accueil            02-collection         03-fiche-piece
04-sur-mesure         05-contact            06-mentions-legales
07-piece-introuvable  08-page-introuvable   09-favicon.svg
```

Ce sont des copies des captures de `phase-10/`, renommées pour être parcourues d'un coup.

## Le reste

`phase-1/` à `phase-10/` : l'état du site **à la fin de chaque phase**, avec pour chacune
les captures 1440px et 390px de toutes les routes actives, et `resultat.json`.

`resultat.json` contient, route par route : erreurs console, erreurs réseau, requêtes hors
origine, longueur du texte rendu, polices effectivement chargées, sélecteurs trouvés,
chemins des captures — puis la liste des contrôles spécifiques avec leur verdict et la valeur
mesurée, et enfin `statut` (`OK` ou `ECHEC`) et le détail des échecs.

Les captures des phases 1 à 4 montrent des écrans provisoires : c'est normal, le contenu
définitif arrive à partir de la phase 5. Les phases 1 à 9 n'ont que 6 routes ;
`/mentions-legales` et le 404 global s'ajoutent en phase 10.

## Rejouer

```bash
npm install
npx playwright install chromium
node scripts/verify.mjs 10
```

Le script écrase `verification/phase-10/`. Il échoue si une seule route a une erreur console,
une requête en échec, une requête hors origine, moins de 200 caractères de texte, un sélecteur
manquant, ou si l'un des 27 contrôles spécifiques tombe.
