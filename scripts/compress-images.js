/**
 * Compression des images de dist/ après le build.
 *
 * Travaille sur `dist/`, jamais sur `public/` : les sources restent intactes et le build
 * reste reproductible. Ne réécrit un fichier que si la version compressée est réellement
 * plus légère — sinon on dégraderait la qualité pour rien.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RACINE, 'dist');

function lister(dossier) {
  if (!fs.existsSync(dossier)) return [];
  return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dossier, e.name);
    return e.isDirectory() ? lister(p) : [p];
  });
}

const images = lister(DIST).filter((f) => /\.(jpe?g|png)$/i.test(f));
let gagnes = 0;
let reecrits = 0;

for (const fichier of images) {
  const avant = fs.statSync(fichier).size;
  const jpeg = /\.jpe?g$/i.test(fichier);
  const compresse = await sharp(fichier)
    .rotate() // respecte l'orientation EXIF avant de la perdre
    [jpeg ? 'jpeg' : 'png']({
      quality: jpeg ? 82 : undefined,
      mozjpeg: jpeg || undefined,
      compressionLevel: jpeg ? undefined : 9,
    })
    .toBuffer();

  if (compresse.length < avant) {
    fs.writeFileSync(fichier, compresse);
    gagnes += avant - compresse.length;
    reecrits += 1;
  }
}

const ko = (o) => `${(o / 1024).toFixed(1)} ko`;
console.log(`compress-images : ${reecrits}/${images.length} image(s) réécrite(s), ${ko(gagnes)} gagné(s)`);
