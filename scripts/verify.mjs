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
    { phase: 7, sel: 'a.btn--wa[href^="https://wa.me/"]' },
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
  if (PHASE >= 6 && route.nom === 'collection') {
    await page.getByRole('button', { name: 'Kimonos', exact: true }).click();
    await page.waitForTimeout(200);
    const visibles = await page.locator('.piece:visible').count();
    const ok = visibles === 2;
    resultat.controlesSpecifiques.push({ nom: 'filtre Kimonos = 2 pieces', valeur: visibles, ok });
    if (!ok) echecs.push(`[collection] filtre Kimonos : ${visibles} piece(s) visible(s), 2 attendues`);
  }

  if (PHASE >= 7 && route.nom === 'piece') {
    const href = await page.locator('a.btn--wa[href^="https://wa.me/"]').first().getAttribute('href');
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
  const okAdmin = rep && rep.status() === 200 && (await page.content()).includes('netlify-cms') || (await page.content()).includes('decap-cms');
  resultat.controlesSpecifiques.push({ nom: '/admin/ repond', valeur: rep ? rep.status() : null, ok: !!okAdmin });
  if (!okAdmin) echecs.push('[admin] /admin/ ne repond pas correctement');
  await page.context().close();

  const { default: YAML } = await import('yaml');
  const brut = fs.readFileSync(path.join(RACINE, 'public/admin/config.yml'), 'utf8');
  let conf = null, err = null;
  try { conf = YAML.parse(brut); } catch (e) { err = String(e); }
  const champsAttendus = ['ref', 'slug', 'nom', 'categorie', 'genre', 'matiere', 'description', 'photos', 'mise_en_avant', 'ordre', 'nom_en', 'description_en'];
  const noms = conf?.collections?.[0]?.fields?.map((f) => f.name) || [];
  const manquants = champsAttendus.filter((c) => !noms.includes(c));
  const ok = !err && manquants.length === 0;
  resultat.controlesSpecifiques.push({ nom: 'config.yml YAML valide + champs', valeur: { erreur: err, champs: noms, manquants }, ok });
  if (!ok) echecs.push(`[admin] config.yml : ${err || 'champs manquants ' + manquants.join(', ')}`);
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

/* --- données (phase 4+) --- */
if (PHASE >= 4) {
  const pieces = JSON.parse(fs.readFileSync(path.join(RACINE, 'src/data/pieces.json'), 'utf8'));
  const slugs = new Set(pieces.map((p) => p.slug));
  const photosOk = pieces.every((p) => p.photos?.length && fs.existsSync(path.join(RACINE, 'public', p.photos[0])));
  const ok = pieces.length === 8 && slugs.size === 8 && photosOk;
  resultat.controlesSpecifiques.push({ nom: 'pieces.json : 8 entrees, slugs uniques, photos presentes', valeur: { nb: pieces.length, slugsUniques: slugs.size, photosOk }, ok });
  if (!ok) echecs.push('[donnees] pieces.json ne respecte pas les contraintes de la phase 4');
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
