import { useState } from 'react';
import Surtitre from '../components/Surtitre.jsx';
import TitreSection from '../components/TitreSection.jsx';
import Bouton from '../components/Bouton.jsx';
import useApparition from '../hooks/useApparition.js';
import useTitrePage from '../hooks/useTitrePage.js';
import { waLink } from '../config/contact.js';
import pieces from '../data/pieces.json';

const CREATION = 'Création sur mesure';

const VIDE = { nom: '', modele: CREATION, epaules: '', longueur: '', manches: '', date: '', ville: '', precisions: '' };

const v = (x) => (x.trim() ? x.trim() : '…');

/**
 * Compose la commande complète envoyée sur WhatsApp : le client donne tout d'un coup,
 * sans passer par « slt, bsr ». Rien n'est envoyé à un serveur.
 */
export function composerMessage(c) {
  const lignes = [
    'Bonjour BEA, je souhaite commander :',
    `Modèle : ${c.modele}`,
    `Nom : ${v(c.nom)}`,
    `Mesures : épaules ${v(c.epaules)} / longueur ${v(c.longueur)} / manches ${v(c.manches)} cm`,
    `Pour le : ${v(c.date)}`,
    `Livraison : ${v(c.ville)}`,
  ];
  if (c.precisions.trim()) lignes.push(`Précisions : ${c.precisions.trim()}`);
  return lignes.join('\n');
}

export default function Commander() {
  const [champs, setChamps] = useState(VIDE);
  useApparition();
  useTitrePage(
    'Commander',
    'Commandez une pièce BEA en une fois : modèle, mesures, date et ville de livraison. Votre commande part complète sur WhatsApp, confectionnée à la main en 10 à 15 jours.'
  );

  const majChamp = (cle) => (e) => setChamps((c) => ({ ...c, [cle]: e.target.value }));
  const message = composerMessage(champs);

  const envoyer = () => {
    window.open(waLink(message), '_blank', 'noopener');
  };

  return (
    <main className="sec">
      <div className="wrap commande">
        <div className="rv">
          <div className="intro">
            <TitreSection niveau={1}>Commander</TitreSection>
            <p>Remplissez ces champs : votre commande part complète sur WhatsApp.</p>
          </div>

          <form className="form" onSubmit={(e) => { e.preventDefault(); envoyer(); }}>
            <div className="field">
              <label htmlFor="f-nom">Nom et prénom</label>
              <input id="f-nom" type="text" placeholder="Ex. Awa Diop" autoComplete="name"
                value={champs.nom} onChange={majChamp('nom')} />
            </div>

            <div className="field">
              <label htmlFor="f-modele">Modèle</label>
              <select id="f-modele" value={champs.modele} onChange={majChamp('modele')}>
                <option value={CREATION}>{CREATION}</option>
                {pieces.map((p) => (
                  <option key={p.slug} value={`${p.nom} (${p.ref})`}>{p.nom} — {p.ref}</option>
                ))}
              </select>
            </div>

            <fieldset className="field field--full">
              <legend>Vos mesures (en cm)</legend>
              <div className="trio">
                <input type="text" inputMode="numeric" aria-label="Épaules, en cm" placeholder="Épaules"
                  value={champs.epaules} onChange={majChamp('epaules')} />
                <input type="text" inputMode="numeric" aria-label="Longueur, en cm" placeholder="Longueur"
                  value={champs.longueur} onChange={majChamp('longueur')} />
                <input type="text" inputMode="numeric" aria-label="Manches, en cm" placeholder="Manches"
                  value={champs.manches} onChange={majChamp('manches')} />
              </div>
            </fieldset>

            <div className="field">
              <label htmlFor="f-date">Pour quelle date</label>
              <input id="f-date" type="text" placeholder="Ex. mariage le 12 décembre"
                value={champs.date} onChange={majChamp('date')} />
            </div>

            <div className="field">
              <label htmlFor="f-ville">Ville de livraison</label>
              <input id="f-ville" type="text" placeholder="Ex. Dakar, Paris…"
                value={champs.ville} onChange={majChamp('ville')} />
            </div>

            <div className="field field--full">
              <label htmlFor="f-precisions">Précisions (facultatif)</label>
              <textarea id="f-precisions" placeholder="Couleur, tissu, broderie…"
                value={champs.precisions} onChange={majChamp('precisions')} />
            </div>

            <div className="field field--full envoi">
              <Bouton variante="plein" id="send" type="submit">Commander ici</Bouton>
              <p className="note">WhatsApp s&apos;ouvre avec votre commande déjà rédigée.</p>
            </div>
          </form>
        </div>

        <aside className="apercu rv" aria-label="Aperçu de votre message">
          <Surtitre>Votre message</Surtitre>
          <p className="message" aria-live="polite">{message}</p>
          <div className="ensuite">
            <Surtitre>Ensuite</Surtitre>
            <ol>
              <li>Nous confirmons le tissu et le prix.</li>
              <li>Confection à la main, 10 à 15 jours.</li>
              <li>Livraison au Sénégal et à l&apos;international.</li>
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}
