# Déploiement

> **Écart assumé avec CLAUDE.md §3.** Ce document contredit la règle « Aucun déploiement
> Netlify. Jamais. » Le déploiement a été demandé par Mandack après la livraison des
> 10 phases. La règle a fait son travail : rien n'a été déployé pendant la construction.

## Qui fait quoi

**Netlify déploie.** Les comptes GitHub et Netlify sont liés : chaque commit sur `main`
déclenche une construction et une mise en ligne automatiques. Aucun secret, aucun jeton à
gérer.

**GitHub Actions vérifie.** `.github/workflows/verification.yml` lance
`node scripts/verify.mjs 10` sur chaque push et chaque pull request, et pose une pastille
verte ou rouge sur le commit.

**Limite à connaître** : les deux tournent en parallèle. Une vérification rouge **ne bloque
pas** la mise en ligne — elle te prévient après coup. Si tu veux en faire une vraie barrière,
il faut inverser : couper la construction automatique dans Netlify (Site configuration →
Build & deploy → **Stop builds**) et confier le déploiement à l'Action, avec un
`NETLIFY_AUTH_TOKEN` et un `NETLIFY_SITE_ID` en secrets GitHub. C'est plus de mise en place
pour plus de garantie.

Quand une vérification échoue, les captures des 8 routes sont téléchargeables en bas de la
page du job, dans l'onglet **Actions**. C'est là qu'elles servent le plus.

## Les réglages de construction

`netlify.toml` versionne ce que l'interface Netlify aurait gardé de son côté :

```toml
[build]
  command = "npm run build"
  publish = "dist"
[build.environment]
  NODE_VERSION = "22"
```

`npm run build` enchaîne la compilation des pièces (`prebuild`), la construction Vite, puis la
compression des images.

Si tes réglages dans l'interface diffèrent, c'est le fichier qui gagne. Supprime-le si tu
préfères tout piloter depuis Netlify.

## Le repli SPA — indispensable

`public/_redirects` contient :

```
/*  /index.html  200
```

Sans cette règle, un accès direct à `/collection`, `/contact` ou `/piece/boubou-damier`
renvoie le 404 de Netlify. Les liens ne fonctionnent qu'en navigation interne, et un simple
rafraîchissement casse la page. **C'est le premier symptôme à vérifier après une mise en
ligne** : ouvre une fiche pièce, copie l'URL, colle-la dans un nouvel onglet.

Les fichiers réels sont servis en priorité, donc `/admin/` et `/admin/config.yml` ne passent
pas par cette règle.

## Pour que l'admin fonctionne

Le déploiement seul ne suffit pas. Sur Netlify :

1. **Site configuration → Identity → Enable Identity**
2. **Identity → Services → Git Gateway → Enable Git Gateway** (demande d'autoriser Netlify sur
   le dépôt GitHub)
3. **Identity → Registration** → passer en **Invite only**, sinon n'importe qui peut créer un
   compte et modifier le catalogue
4. **Identity → Invite users** → t'inviter, accepter l'e-mail, définir un mot de passe

Puis ouvrir `/admin/`, se connecter, modifier une pièce et vérifier que le commit arrive bien
sur `main`. **C'est le seul point que la vérification automatique ne peut pas prouver** :
Git Gateway exige un site déployé et Identity activé.

Un commit du CMS déclenche Netlify comme n'importe quel autre commit.

`config.yml` pose `branch: main`, ce qui correspond bien à la branche du dépôt.

## Ce qui reste ouvert

- **Domaine.** Le site est servi sur `<nom>.netlify.app`. Pour un domaine propre :
  Netlify → **Domain management**. Aucun changement de code, le site est à la racine.
- **Aperçu de partage.** Les `<title>` et meta descriptions sont posés côté client. Un partage
  WhatsApp ou Facebook lit le HTML brut et verra les valeurs par défaut d'`index.html`.
  Un pré-rendu reste le sujet le plus concret.

## Rejouer la vérification en local

```bash
npm ci
npx playwright install chromium
node scripts/verify.mjs 10
```
