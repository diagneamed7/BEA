/* Compile content/pieces/*.json -> src/data/pieces.json (phase 4). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(RACINE, 'content/pieces');
const OUT = path.join(RACINE, 'src/data/pieces.json');

const fichiers = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => f.endsWith('.json')) : [];
const pieces = fichiers
  .map((f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')))
  .sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pieces, null, 2) + '\n');
console.log(`build-pieces : ${pieces.length} piece(s) -> src/data/pieces.json`);
