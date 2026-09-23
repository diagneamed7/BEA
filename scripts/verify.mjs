#!/usr/bin/env node
/**
 * Harnais de vérification BEA — CLAUDE.md §10.
 * Usage : node scripts/verify.mjs [numeroDePhase]
 *
 * 1. build     -> échec si le build échoue
 * 2. sert dist/ avec repli SPA
 * 3. ouvre chaque route dans Chromium headless
 * 4. échec si la console contient une erreur ou si une requête échoue
 * 5. échec si document.body.innerText.length < 200
 * 6. vérifie les sélecteurs clés de la phase
 * 7. captures pleine page 1440px et 390px dans verification/phase-X/
 * 8. écrit verification/phase-X/resultat.json
 */
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RACINE, 'dist');
const PHASE = Number(process.argv[2] || process.env.PHASE || 1);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

/* ------------------------------------------------------------------ */
/* Plan de vérification : chaque entrée s'active à partir de sa phase. */
/* ------------------------------------------------------------------ */
const SLUG_EXISTANT = 'boubou-damier';
const SLUG_INEXISTANT = 'slug-inexistant';

const ROUTES = [
  { nom: 'accueil',        url: '/' },
  { nom: 'collection',     url: '/collection' },
  { nom: 'piece',          url: `/piece/${SLUG_EXISTANT}` },
  { nom: 'piece-404',      url: `/piece/${SLUG_INEXISTANT}` },
  { nom: 'sur-mesure',     url: '/sur-mesure' },
  { nom: 'contact',        url: '/contact' },
];

// Sélecteurs attendus, par route, à partir d'une phase donnée.
const SELECTEURS = {
  accueil: [
    { phase: 1, sel: 'main' },
    { phase: 2, sel: 'header a[href^="https://wa.me/"]' },
    { phase: 2, sel: 'footer a[href*="instagram"]' },
    { phase: 5, sel: 'h1' },
    { phase: 5, sel: '.opener a[href^="https://wa.me/"]' },
    { phase: 3, sel: '.eyebrow' },
    { phase: 3, sel: '.rule i' },
    { phase: 3, sel: '.btn' },
    { phase: 5, sel: '.piece', min: 6 },
  ],
  collection: [
    { phase: 1, sel: 'main' },
    { phase: 2, sel: 'header a[href^="https://wa.me/"]' },
    { phase: 2, sel: 'footer a[href*="instagram"]' },
    { phase: 6, sel: '.piece', min: 8 },
    { phase: 6, sel: '.chip', min: 5 },
  ],
  piece: [
    { phase: 1, sel: 'main' },
    { phase: 2, sel: 'header a[href^="https://wa.me/"]' },
    { phase: 7, sel: 'h1' },
    { phase: 7, sel: '.spec' },
    { phase: 7, sel: '.detail .buy a.btn--wa[href^="https://wa.me/"]' },
  ],
  'piece-404': [
    { phase: 1, sel: 'main' },
    { phase: 7, sel: '.erreur' },
  ],
  'sur-mesure': [
    { phase: 1, sel: 'main' },
    { phase: 2, sel: 'header a[href^="https://wa.me/"]' },
    { phase: 8, sel: '.step', min: 3 },
    { phase: 8, sel: '#f-nom' },
    { phase: 8, sel: '#send' },
  ],
  contact: [
    { phase: 1, sel: 'main' },
    { phase: 2, sel: 'header a[href^="https://wa.me/"]' },
    { phase: 8, sel: '.info-list' },
    { phase: 8, sel: `a[href*="${'wa.me'}"]` },
  ],
};

/* ------------------------------ serveur ------------------------------ */
function servirDist() {
  const serveur = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel.endsWith('/')) rel += 'index.html';
    let fichier = path.join(DIST, rel);
    if (!fichier.startsWith(DIST)) { res.writeHead(403).end(); return; }
    if (!fs.existsSync(fichier) || fs.statSync(fichier).isDirectory()) {
      // repli SPA uniquement pour les navigations, pas pour les assets
      if (path.extname(rel)) { res.writeHead(404, MIME['.txt']).end('404'); return; }
      fichier = path.join(DIST, 'index.html');
    }
    const type = MIME[path.extname(fichier).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(fichier).pipe(res);
  });
  return new Promise((ok) => serveur.listen(0, '127.0.0.1', () => ok(serveur)));
}

/* ------------------------------ build ------------------------------ */
function build() {
  const r = spawnSync('npm', ['run', 'build'], { cwd: RACINE, encoding: 'utf8', shell: false });
  return { code: r.status, sortie: ((r.stdout || '') + (r.stderr || '')).slice(-4000) };
}

/* ------------------------------ main ------------------------------ */
const dossier = path.join(RACINE, 'verification', `phase-${PHASE}`);
fs.mkdirSync(dossier, { recursive: true });

const resultat = {
  phase: PHASE,
  date: new Date().toISOString(),
  build: null,
  routes: [],
  controlesSpecifiques: [],
  statut: 'ECHEC',
};

console.log(`\n=== verify.mjs — phase ${PHASE} ===\n`);
console.log('> npm run build');
const b = build();
resultat.build = { code: b.code, extrait: b.sortie };
if (b.code !== 0) {
  console.error(b.sortie);
  console.error('\nBUILD EN ECHEC — la phase n\'est pas terminee.');
  fs.writeFileSync(path.join(dossier, 'resultat.json'), JSON.stringify(resultat, null, 2));
  process.exit(1);
}
console.log('  build OK');

const serveur = await servirDist();
const base = `http://127.0.0.1:${serveur.address().port}`;
const navigateur = await chromium.launch();

let echecs = [];

async function ouvrir(route, largeur, hauteur) {
  const contexte = await navigateur.newContext({
    viewport: { width: largeur, height: hauteur },
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  });
  const page = await contexte.newPage();
  const erreursConsole = [];
  const erreursReseau = [];
  const externesBloques = [];
  // Le site ne doit dependre d'AUCUNE ressource tierce : polices hebergees en local.
  // Toute requete hors origine est donc une anomalie bloquante, consignee a part
  // pour que le message d'erreur designe la ressource fautive.
  const estExterne = (u) => !!u && !u.startsWith(base);
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const u = m.location()?.url;
    if (estExterne(u)) { externesBloques.push(`console: ${u} — ${m.text()}`); return; }
    erreursConsole.push(m.text());
  });
  page.on('pageerror', (e) => erreursConsole.push(String(e)));
  page.on('requestfailed', (r) => {
    const l = `${r.url()} — ${r.failure()?.errorText}`;
    (estExterne(r.url()) ? externesBloques : erreursReseau).push(l);
  });
  page.on('response', (r) => {
    if (r.status() < 400) return;
    const l = `${r.url()} — HTTP ${r.status()}`;
    (estExterne(r.url()) ? externesBloques : erreursReseau).push(l);
  });
  await page.goto(base + route.url, { waitUntil: 'networkidle' });
  // état final de l'animation d'apparition forcé avant toute mesure
  await page.evaluate(() => {
    document.querySelectorAll('.rv').forEach((e) => e.classList.add('in'));
  });
  await page.waitForTimeout(250);
  return { contexte, page, erreursConsole, erreursReseau, externesBloques };
}

for (const route of ROUTES) {
  const ligne = { route: route.nom, url: route.url, erreursConsole: [], erreursReseau: [], externesBloques: [], longueurTexte: 0, selecteurs: [], captures: [] };
  const { contexte, page, erreursConsole, erreursReseau, externesBloques } = await ouvrir(route, 1440, 900);

  ligne.longueurTexte = await page.evaluate(() => document.body.innerText.length);

  // Les polices locales doivent etre effectivement chargees, pas seulement declarees.
  ligne.polices = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`);
  });
  // Un navigateur ne telecharge une police que si un element l'utilise reellement.
  // Poppins (surtitres, navigation, boutons) n'apparait qu'a partir de la phase 2.
  const policesAttendues = PHASE >= 2
    ? ['Cinzel 700', 'Poppins 500', 'Poppins 600', 'Inter 400']
    : ['Cinzel 700', 'Inter 400'];
  for (const attendue of policesAttendues) {
    if (!ligne.polices.includes(attendue)) echecs.push(`[${route.nom}] police non chargee : ${attendue}`);
  }

  const attendus = (SELECTEURS[route.nom] || []).filter((s) => s.phase <= PHASE);
  for (const a of attendus) {
    const n = await page.locator(a.sel).count();
    const ok = a.min ? n >= a.min : n >= 1;
    ligne.selecteurs.push({ selecteur: a.sel, trouves: n, minimum: a.min || 1, ok });
    if (!ok) echecs.push(`[${route.nom}] selecteur "${a.sel}" : ${n} trouve(s), ${a.min || 1} attendu(s)`);
  }

  const cap1440 = path.join(dossier, `${route.nom}-1440.png`);
  await page.screenshot({ path: cap1440, fullPage: true });
  ligne.captures.push(path.relative(RACINE, cap1440));

  // --- contrôles spécifiques par phase, sur la page déjà ouverte ---
  if (PHASE >= 2 && route.nom === 'accueil') {
    // Au-dessus de 980px : navigation et bouton WhatsApp visibles, burger masqué.
    const bureau = {
      nav: await page.locator('.nav').isVisible(),
      boutonWa: await page.locator('.hdr-wa').isVisible(),
      burger: await page.locator('.burger').isVisible(),
    };
    const okBureau = bureau.nav && bureau.boutonWa && !bureau.burger;
    resultat.controlesSpecifiques.push({ nom: 'header 1440px : nav visible, burger masque', valeur: bureau, ok: okBureau });
    if (!okBureau) echecs.push('[header] a 1440px la navigation, le bouton WhatsApp ou le burger ne sont pas dans le bon etat');
  }
  if (PHASE >= 6 && (route.nom === 'collection' || route.nom === 'accueil')) {
    // Les liens « Voir la piece » doivent s'aligner entre les cartes d'une meme rangee.
    // On regroupe par position verticale de carte, puis on compare les hauts de lien.
    const rangees = await page.$$eval('.piece', (cartes) => {
      const parRangee = new Map();
      cartes.forEach((c) => {
        const rc = c.getBoundingClientRect();
        const lien = c.querySelector('.see').getBoundingClientRect();
        const cle = Math.round(rc.top);
        if (!parRangee.has(cle)) parRangee.set(cle, []);
        parRangee.get(cle).push({ nom: c.querySelector('h3').textContent, lien: lien.top });
      });
      return [...parRangee.entries()].map(([haut, cartes]) => ({ haut, cartes }));
    });
    const desalignees = rangees
      .map((r) => ({ haut: r.haut, ecart: Math.max(...r.cartes.map((c) => c.lien)) - Math.min(...r.cartes.map((c) => c.lien)) }))
      .filter((r) => r.ecart > 2); // 2px de tolerance pour les arrondis sous-pixel
    const okAlign = desalignees.length === 0 && rangees.length > 0;
    resultat.controlesSpecifiques.push({
      nom: `alignement des liens de carte (${route.nom})`,
      valeur: { rangees: rangees.length, desalignees }, ok: okAlign,
    });
    if (!okAlign) echecs.push(`[${route.nom}] liens de carte desalignes : ${JSON.stringify(desalignees)}`);
  }

  if (PHASE >= 6 && route.nom === 'collection') {
    const total = await page.locator('.piece').count();
    await page.getByRole('button', { name: 'Kimonos', exact: true }).click();
    await page.waitForTimeout(900);
    const visibles = await page.locator('.piece:visible').count();
    const opaques = await page.$$eval('.piece', (els) => els.every((e) => Number(getComputedStyle(e).opacity) > 0.99));
    const chipActive = await page.locator('.chip.on').textContent();
    const ok = visibles === 2 && opaques && chipActive.trim() === 'Kimonos';
    resultat.controlesSpecifiques.push({
      nom: 'filtre Kimonos = 2 pieces, visibles et non transparentes',
      valeur: { totalAvant: total, visibles, opaques, chipActive: chipActive.trim() }, ok,
    });
    if (!ok) echecs.push(`[collection] filtre Kimonos : ${visibles} piece(s), opacite ok=${opaques}, chip=${chipActive}`);

    // Retour a « Tout » : les 8 pieces reviennent.
    await page.getByRole('button', { name: 'Tout', exact: true }).click();
    await page.waitForTimeout(900);
    const retour = await page.locator('.piece:visible').count();
    const okRetour = retour === 8;
    resultat.controlesSpecifiques.push({ nom: 'retour au filtre Tout = 8 pieces', valeur: retour, ok: okRetour });
    if (!okRetour) echecs.push(`[collection] retour a Tout : ${retour} piece(s) au lieu de 8`);
  }

  if (PHASE >= 7 && route.nom === 'piece') {
    // Cadre sur le bouton de la fiche : le header porte lui aussi un lien wa.me.
    const href = await page.locator('.detail .buy a.btn--wa[href^="https://wa.me/"]').first().getAttribute('href');
    const decode = decodeURIComponent(href || '');
    const ok = decode.includes('BEA-001') && decode.includes('Boubou Damier');
    resultat.controlesSpecifiques.push({ nom: 'href WhatsApp contient nom + reference', valeur: decode.slice(0, 200), ok });
    if (!ok) echecs.push('[piece] le lien WhatsApp ne contient pas le nom et la reference');
  }

  if (PHASE >= 8 && route.nom === 'sur-mesure') {
    await page.evaluate(() => { window.__wa = null; window.open = (u) => { window.__wa = u; return null; }; });
    await page.fill('#f-nom', 'Awa Ndiaye');
    await page.selectOption('#f-type', 'Kaftan');
    await page.fill('#f-date', 'mariage le 12 decembre');
    await page.fill('#f-msg', 'Tissu bazin, broderie doree');
    await page.click('#send');
    await page.waitForTimeout(200);
    const url = await page.evaluate(() => window.__wa);
    const decode = decodeURIComponent(url || '');
    const ok = decode.includes('Awa Ndiaye') && decode.includes('Kaftan');
    resultat.controlesSpecifiques.push({ nom: 'formulaire -> URL WhatsApp (nom + type)', valeur: decode.slice(0, 250), ok });
    if (!ok) echecs.push('[sur-mesure] l\'URL produite ne contient pas le nom saisi et le type de piece');
  }

  if (PHASE >= 10) {
    const titre = await page.title();
    const desc = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    ligne.titre = titre;
    ligne.metaDescription = desc;
    if (!titre) echecs.push(`[${route.nom}] <title> vide`);
    if (!desc) echecs.push(`[${route.nom}] meta description vide`);
  }

  ligne.erreursConsole = erreursConsole.slice();
  ligne.erreursReseau = erreursReseau.slice();
  ligne.externesBloques = [...new Set(externesBloques)];
  await contexte.close();

  // mobile
  const m = await ouvrir(route, 390, 844);

  if (PHASE >= 2 && route.nom === 'accueil') {
    // Le logo ne doit pas disparaitre sous 560px.
    const logo = m.page.locator('header .brand img');
    const boite = await logo.boundingBox();
    const okLogo = (await logo.isVisible()) && !!boite && boite.width > 40 && boite.height > 0;
    resultat.controlesSpecifiques.push({ nom: 'logo visible a 390px', valeur: boite, ok: okLogo });
    if (!okLogo) echecs.push('[header] le logo disparait ou est degenere a 390px');

    // Burger : ouvre le tiroir, un clic sur un lien le referme.
    const burgerVisible = await m.page.locator('.burger').isVisible();
    const navMasquee = !(await m.page.locator('.nav').isVisible());
    const waMasque = !(await m.page.locator('.hdr-wa').isVisible());
    resultat.controlesSpecifiques.push({ nom: 'bouton WhatsApp du header masque a 390px', valeur: waMasque, ok: waMasque });
    if (!waMasque) echecs.push('[header] le bouton WhatsApp du header reste visible sous 980px');
    await m.page.locator('.burger').click();
    await m.page.waitForTimeout(150);
    const ouvertApresClic = await m.page.locator('#tiroir').isVisible();
    await m.page.locator('#tiroir a').first().click();
    await m.page.waitForTimeout(250);
    const fermeApresLien = !(await m.page.locator('#tiroir').isVisible());
    const okBurger = burgerVisible && navMasquee && ouvertApresClic && fermeApresLien;
    resultat.controlesSpecifiques.push({
      nom: 'burger 390px : ouvre puis se referme au clic',
      valeur: { burgerVisible, navMasquee, ouvertApresClic, fermeApresLien }, ok: okBurger,
    });
    if (!okBurger) echecs.push('[header] le burger ne s\'ouvre pas ou ne se referme pas au clic');
    await m.page.goto(base + route.url, { waitUntil: 'networkidle' });
  }
  const cap390 = path.join(dossier, `${route.nom}-390.png`);
  await m.page.screenshot({ path: cap390, fullPage: true });
  ligne.captures.push(path.relative(RACINE, cap390));
  ligne.erreursConsole.push(...m.erreursConsole);
  ligne.erreursReseau.push(...m.erreursReseau);
  ligne.externesBloques = [...new Set([...ligne.externesBloques, ...m.externesBloques])];
  await m.contexte.close();

  if (ligne.longueurTexte < 200) echecs.push(`[${route.nom}] innerText = ${ligne.longueurTexte} caracteres (< 200) — ecran blanc probable`);
  if (ligne.erreursConsole.length) echecs.push(`[${route.nom}] ${ligne.erreursConsole.length} erreur(s) console : ${ligne.erreursConsole[0]}`);
  if (ligne.erreursReseau.length) echecs.push(`[${route.nom}] ${ligne.erreursReseau.length} erreur(s) reseau : ${ligne.erreursReseau[0]}`);
  if (ligne.externesBloques.length) echecs.push(`[${route.nom}] ${ligne.externesBloques.length} ressource(s) tierce(s) — le site doit etre autonome : ${ligne.externesBloques[0]}`);

  resultat.routes.push(ligne);
  console.log(`  ${echecs.length ? ' ' : ' '}${route.nom.padEnd(12)} texte=${String(ligne.longueurTexte).padStart(5)}  console=${ligne.erreursConsole.length}  reseau=${ligne.erreursReseau.length}  ext=${ligne.externesBloques.length}  selecteurs=${ligne.selecteurs.filter((s) => s.ok).length}/${ligne.selecteurs.length}`);
}

/* --- contrôles hors route --- */
if (PHASE >= 9) {
  const page = await (await navigateur.newContext()).newPage();
  const rep = await page.goto(base + '/admin/', { waitUntil: 'domcontentloaded' });
  const contenu = await page.content();
  // Le bundle Decap vient d'unpkg et n'est pas joignable depuis ce bac a sable : on verifie
  // la structure de la page, pas le demarrage du CMS. Voir PHASE-9-REPORT.md.
  const detailAdmin = {
    statut: rep ? rep.status() : null,
    scriptDecap: /unpkg\.com\/decap-cms@\d+\.\d+\.\d+\/dist\/decap-cms\.js/.test(contenu),
    versionEpinglee: !/decap-cms@[\^~]|decap-cms@latest/.test(contenu),
    identityNetlify: contenu.includes('identity.netlify.com'),
    noindex: contenu.includes('noindex'),
  };
  const okAdmin = detailAdmin.statut === 200 && detailAdmin.scriptDecap &&
    detailAdmin.versionEpinglee && detailAdmin.identityNetlify && detailAdmin.noindex;
  resultat.controlesSpecifiques.push({ nom: '/admin/ repond et charge Decap + Netlify Identity', valeur: detailAdmin, ok: okAdmin });
  if (!okAdmin) echecs.push(`[admin] page d'administration incorrecte : ${JSON.stringify(detailAdmin)}`);
  await page.context().close();

  // config.yml doit etre servi tel quel, pas avale par le repli SPA.
  const pageYml = await (await navigateur.newContext()).newPage();
  const repYml = await pageYml.goto(base + '/admin/config.yml', { waitUntil: 'domcontentloaded' });
  const typeYml = repYml.headers()['content-type'] || '';
  const okServi = repYml.status() === 200 && typeYml.includes('yaml');
  resultat.controlesSpecifiques.push({ nom: 'config.yml servi en YAML', valeur: { statut: repYml.status(), type: typeYml }, ok: okServi });
  if (!okServi) echecs.push(`[admin] config.yml mal servi : ${repYml.status()} ${typeYml}`);
  await pageYml.context().close();

  const { default: YAML } = await import('yaml');
  const brut = fs.readFileSync(path.join(RACINE, 'public/admin/config.yml'), 'utf8');
  let conf = null, err = null;
  try { conf = YAML.parse(brut); } catch (e) { err = String(e); }
  // Les 12 champs du modele de donnees (CLAUDE.md §6), pas seulement les 8 obligatoires.
  const champsAttendus = ['ref', 'slug', 'nom', 'categorie', 'genre', 'matiere', 'description', 'photos', 'mise_en_avant', 'ordre', 'nom_en', 'description_en'];
  const collection = conf?.collections?.[0];
  const champs = collection?.fields || [];
  const noms = champs.map((f) => f.name);
  const manquants = champsAttendus.filter((c) => !noms.includes(c));
  const optionnels = champs.filter((f) => f.required === false).map((f) => f.name);
  // nom_en et description_en doivent etre optionnels : le bilingue est prepare, pas actif.
  const enNonOptionnels = ['nom_en', 'description_en'].filter((c) => !optionnels.includes(c));
  // Le widget image doit pointer vers public/images/pieces.
  const okMedia = conf?.media_folder === 'public/images/pieces' && conf?.public_folder === '/images/pieces';
  const okDossier = collection?.folder === 'content/pieces' && collection?.extension === 'json' && collection?.format === 'json';
  const okBackend = conf?.backend?.name === 'git-gateway';
  // Le schema du CMS ne doit pas reintroduire un champ prix.
  const champPrix = noms.filter((n) => /^(prix|price)$/i.test(n));

  const detail = { erreur: err, champs: noms, manquants, enNonOptionnels, okMedia, okDossier, okBackend, champPrix };
  const ok = !err && manquants.length === 0 && enNonOptionnels.length === 0 &&
    okMedia && okDossier && okBackend && champPrix.length === 0;
  resultat.controlesSpecifiques.push({ nom: 'config.yml : YAML valide, 12 champs, media et backend conformes', valeur: detail, ok });
  if (!ok) echecs.push(`[admin] config.yml : ${JSON.stringify(detail)}`);

  // Les champs du CMS doivent couvrir exactement les cles ecrites dans content/pieces.
  const unePiece = JSON.parse(fs.readFileSync(path.join(RACINE, 'content/pieces/bea-001.json'), 'utf8'));
  const clesFichier = Object.keys(unePiece);
  const nonCouvertes = clesFichier.filter((c) => !noms.includes(c));
  const okCouverture = nonCouvertes.length === 0;
  resultat.controlesSpecifiques.push({ nom: 'le CMS couvre toutes les cles des fichiers existants', valeur: { clesFichier, nonCouvertes }, ok: okCouverture });
  if (!okCouverture) echecs.push(`[admin] cles presentes dans content/pieces mais absentes du CMS : ${nonCouvertes.join(', ')}`);
}

if (PHASE >= 10) {
  const page = await (await navigateur.newContext()).newPage();
  await page.goto(base + '/une-url-qui-nexiste-pas', { waitUntil: 'networkidle' });
  const n = await page.locator('.erreur').count();
  resultat.controlesSpecifiques.push({ nom: 'URL inexistante -> page 404', valeur: n, ok: n >= 1 });
  if (n < 1) echecs.push('[404] une URL inexistante ne rend pas la page 404');
  await page.context().close();

  const titres = resultat.routes.map((r) => r.titre);
  const distincts = new Set(titres).size === titres.length;
  resultat.controlesSpecifiques.push({ nom: 'titres distincts par page', valeur: titres, ok: distincts });
  if (!distincts) echecs.push('[seo] les <title> ne sont pas distincts par page');
}

/* --- phase 8 : le formulaire compose l'URL cote client, sans rien envoyer --- */
if (PHASE >= 8) {
  const ctx = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + '/sur-mesure', { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.__wa = null; window.open = (u) => { window.__wa = u; return null; }; });

  // Aucune requete ne doit partir au moment de l'envoi : pas de POST, pas de fetch.
  const requetes = [];
  page.on('request', (r) => requetes.push(`${r.method()} ${r.url()}`));

  await page.fill('#f-nom', 'Awa Ndiaye');
  await page.selectOption('#f-type', 'Kimono');
  await page.selectOption('#f-modele', 'BEA-006 — Kimono Indigo');
  await page.fill('#f-date', 'mariage le 12 decembre');
  await page.fill('#f-msg', 'Tissu bazin, broderie doree');
  // On ne compte que ce qui part a partir du clic : la page est deja chargee.
  requetes.length = 0;
  await page.click('#send');
  await page.waitForTimeout(300);
  const requetesAuClic = [...requetes];

  const url = decodeURIComponent((await page.evaluate(() => window.__wa)) || '');
  const attendus = ['Awa Ndiaye', 'Kimono', 'BEA-006', 'mariage le 12 decembre', 'Tissu bazin'];
  const manquants = attendus.filter((a) => !url.includes(a));
  const okComplet = manquants.length === 0 && url.startsWith('https://wa.me/221772524984?text=');
  resultat.controlesSpecifiques.push({
    nom: 'formulaire complet -> URL WhatsApp',
    valeur: { url: url.slice(0, 280), manquants }, ok: okComplet,
  });
  if (!okComplet) echecs.push(`[sur-mesure] champs absents de l'URL produite : ${manquants.join(', ')}`);

  const okAucunEnvoi = requetesAuClic.length === 0;
  resultat.controlesSpecifiques.push({ nom: 'aucune requete reseau a l\'envoi du formulaire', valeur: requetesAuClic, ok: okAucunEnvoi });
  if (!okAucunEnvoi) echecs.push(`[sur-mesure] ${requetesAuClic.length} requete(s) partie(s) a l'envoi : ${requetesAuClic[0]}`);

  // Formulaire vide : le message reste valide, sans fragments orphelins.
  await page.goto(base + '/sur-mesure', { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.__wa = null; window.open = (u) => { window.__wa = u; return null; }; });
  await page.click('#send');
  await page.waitForTimeout(200);
  const urlVide = decodeURIComponent((await page.evaluate(() => window.__wa)) || '');
  const okVide = urlVide.includes('Bonjour BEA,') && urlVide.includes('Boubou') && !urlVide.includes('undefined');
  resultat.controlesSpecifiques.push({ nom: 'formulaire vide -> message valide', valeur: urlVide.slice(0, 200), ok: okVide });
  if (!okVide) echecs.push(`[sur-mesure] message incorrect sur formulaire vide : ${urlVide.slice(0, 120)}`);
  await ctx.close();
}

/* --- phase 7 : chaque fiche porte SON nom et SA reference dans le lien WhatsApp --- */
if (PHASE >= 7) {
  const pieces = JSON.parse(fs.readFileSync(path.join(RACINE, 'src/data/pieces.json'), 'utf8'));
  const ctx = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const fautives = [];
  for (const p of pieces) {
    await page.goto(`${base}/piece/${p.slug}`, { waitUntil: 'networkidle' });
    const href = await page.locator('.detail .buy a.btn--wa[href^="https://wa.me/"]').first().getAttribute('href');
    const texte = decodeURIComponent(href || '');
    const titre = (await page.locator('.detail h1').textContent().catch(() => '')) || '';
    if (!texte.includes(p.nom) || !texte.includes(p.ref) || titre.trim() !== p.nom) {
      fautives.push({ slug: p.slug, titre: titre.trim(), href: texte.slice(0, 160) });
    }
  }
  await ctx.close();
  const ok = fautives.length === 0;
  resultat.controlesSpecifiques.push({ nom: 'les 8 fiches : titre et lien WhatsApp propres a la piece', valeur: { verifiees: pieces.length, fautives }, ok });
  if (!ok) echecs.push(`[fiches] ${fautives.length} fiche(s) au message WhatsApp incorrect : ${JSON.stringify(fautives)}`);
}

/* --- phase 3 : l'apparition au scroll, sans forcer l'etat final --- */
if (PHASE >= 3) {
  // 1. Mouvement normal : les .rv partent invisibles puis sont revelees par l'observateur.
  const ctx = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });

  // Un element deja dans le viewport doit etre revele immediatement ; un element
  // sous la ligne de flottaison doit rester invisible tant qu'on n'a pas scrolle.
  await page.waitForTimeout(1400);
  const auChargement = await page.$$eval('.rv', (els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return { sousLaLigne: r.top >= window.innerHeight, in: e.classList.contains('in') };
    })
  );
  const visiblesOk = auChargement.filter((e) => !e.sousLaLigne).every((e) => e.in);
  const sousLaLigne = auChargement.filter((e) => e.sousLaLigne);
  const cachesOk = sousLaLigne.every((e) => !e.in);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1400);
  const apresScroll = await page.$$eval('.rv', (els) => els.map((e) => Number(getComputedStyle(e).opacity)));
  const toutesRevelees = apresScroll.length > 0 && apresScroll.every((o) => o > 0.99);

  const okAnim = visiblesOk && cachesOk && toutesRevelees;
  resultat.controlesSpecifiques.push({
    nom: 'apparition au scroll',
    valeur: {
      elementsSousLaLigneAuChargement: sousLaLigne.length,
      portee: sousLaLigne.length === 0
        ? 'page trop courte a cette phase : le cas "sous la ligne de flottaison" n\'est pas exerce'
        : 'les deux cas sont exerces',
      visiblesReveleesAuChargement: visiblesOk,
      sousLaLigneRestentCachees: cachesOk,
      opacitesApresScroll: apresScroll,
    },
    ok: okAnim,
  });
  if (!okAnim) echecs.push('[apparition] les elements .rv ne sont pas reveles correctement');

  // 2. La transition dure bien 0.7s et deplace de 16px.
  const regles = await page.evaluate(() => {
    const el = document.querySelector('.rv');
    const avant = getComputedStyle(el);
    return { duree: avant.transitionDuration, propriete: avant.transitionProperty };
  });
  const okDuree = regles.duree.includes('0.7s');
  resultat.controlesSpecifiques.push({ nom: 'transition de 0.7s', valeur: regles, ok: okDuree });
  if (!okDuree) echecs.push(`[apparition] duree de transition inattendue : ${regles.duree}`);
  await ctx.close();

  // 3. prefers-reduced-motion : visible immediatement, sans scroll ni transition.
  const ctxR = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pageR = await ctxR.newPage();
  await pageR.goto(base + '/', { waitUntil: 'networkidle' });
  const etatReduit = await pageR.$$eval('.rv', (els) =>
    els.map((e) => ({ o: Number(getComputedStyle(e).opacity), t: getComputedStyle(e).transitionDuration }))
  );
  const okReduit = etatReduit.length > 0 && etatReduit.every((e) => e.o > 0.99 && e.t === '0s');
  resultat.controlesSpecifiques.push({ nom: 'prefers-reduced-motion : visible sans transition', valeur: etatReduit.slice(0, 3), ok: okReduit });
  if (!okReduit) echecs.push('[apparition] prefers-reduced-motion n\'est pas respecte');
  await ctxR.close();
}

/* --- données (phase 4+) --- */
if (PHASE >= 4) {
  const pieces = JSON.parse(fs.readFileSync(path.join(RACINE, 'src/data/pieces.json'), 'utf8'));
  const CATEGORIES = ['Boubous', 'Kaftans', 'Ensembles', 'Kimonos'];
  const CHAMPS = ['ref', 'slug', 'nom', 'categorie', 'genre', 'matiere', 'description', 'photos', 'mise_en_avant', 'ordre', 'nom_en', 'description_en'];

  const slugs = new Set(pieces.map((p) => p.slug));
  const refs = new Set(pieces.map((p) => p.ref));
  const photosManquantes = pieces.flatMap((p) =>
    (p.photos || []).filter((ph) => !fs.existsSync(path.join(RACINE, 'public', ph))).map((ph) => `${p.ref} -> ${ph}`)
  );
  const sansPhoto = pieces.filter((p) => !p.photos?.length).map((p) => p.ref);
  const champsManquants = pieces.flatMap((p) => CHAMPS.filter((c) => !(c in p)).map((c) => `${p.ref}.${c}`));
  const categoriesInvalides = pieces.filter((p) => !CATEGORIES.includes(p.categorie)).map((p) => `${p.ref}: ${p.categorie}`);
  // Le prix est toujours « Sur devis » : aucune piece ne doit porter de champ prix.
  const avecPrix = pieces.filter((p) => 'prix' in p || 'price' in p).map((p) => p.ref);
  // Le bilingue est prepare mais desactive : les champs _en existent et restent vides.
  const enRemplis = pieces.filter((p) => p.nom_en != null || p.description_en != null).map((p) => p.ref);

  const detail = {
    nb: pieces.length, slugsUniques: slugs.size, refsUniques: refs.size,
    sansPhoto, photosManquantes, champsManquants, categoriesInvalides, avecPrix, enRemplis,
  };
  const ok = pieces.length === 8 && slugs.size === 8 && refs.size === 8 &&
    sansPhoto.length === 0 && photosManquantes.length === 0 && champsManquants.length === 0 &&
    categoriesInvalides.length === 0 && avecPrix.length === 0 && enRemplis.length === 0;
  resultat.controlesSpecifiques.push({ nom: 'pieces.json : 8 entrees, slugs/refs uniques, photos sur le disque, schema conforme', valeur: detail, ok });
  if (!ok) echecs.push(`[donnees] pieces.json non conforme : ${JSON.stringify(detail)}`);

  // Chaque fichier de content/pieces/ doit se retrouver dans le compile.
  const sources = fs.readdirSync(path.join(RACINE, 'content/pieces')).filter((f) => f.endsWith('.json'));
  const okCompile = sources.length === pieces.length;
  resultat.controlesSpecifiques.push({ nom: 'content/pieces -> src/data/pieces.json', valeur: { sources: sources.length, compilees: pieces.length }, ok: okCompile });
  if (!okCompile) echecs.push(`[donnees] ${sources.length} fichier(s) dans content/pieces mais ${pieces.length} piece(s) compilee(s)`);
}

await navigateur.close();
serveur.close();

resultat.echecs = echecs;
resultat.statut = echecs.length === 0 ? 'OK' : 'ECHEC';
fs.writeFileSync(path.join(dossier, 'resultat.json'), JSON.stringify(resultat, null, 2));

console.log('');
for (const c of resultat.controlesSpecifiques) console.log(`  ${c.ok ? '[ok]' : '[KO]'} ${c.nom}`);
console.log('');
if (echecs.length) {
  console.error(`ECHEC — ${echecs.length} probleme(s) :`);
  echecs.forEach((e) => console.error('  - ' + e));
  console.error(`\nDetail : verification/phase-${PHASE}/resultat.json`);
  process.exit(1);
}
console.log(`VERT — phase ${PHASE} : ${resultat.routes.length} routes, 0 erreur console, 0 erreur reseau.`);
console.log(`Captures et detail : verification/phase-${PHASE}/`);
