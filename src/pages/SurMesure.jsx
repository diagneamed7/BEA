import { useState } from 'react';
import Surtitre from '../components/Surtitre.jsx';
import TitreSection from '../components/TitreSection.jsx';
import Bouton from '../components/Bouton.jsx';
import useApparition from '../hooks/useApparition.js';
import useTitrePage from '../hooks/useTitrePage.js';
import { waLink } from '../config/contact.js';
import pieces from '../data/pieces.json';

const ETAPES = [
  {
    num: 'Étape 01', titre: 'Vous nous écrivez',
    texte: 'Vous choisissez un modèle dans la collection ou vous décrivez votre idée. La conversation démarre sur WhatsApp, avec la référence déjà renseignée.',
  },
  {
    num: 'Étape 02', titre: 'Mesures et tissu',
    texte: 'Nous validons ensemble le tissu, la broderie et les finitions. Vous nous transmettez vos mesures par message — nous vous guidons pas à pas.',
  },
  {
    num: 'Étape 03', titre: 'Confection et livraison',
    texte: 'Votre pièce est réalisée à la main en 10 à 15 jours, puis livrée au Sénégal comme à l’international.',
  },
];

const TYPES = ['Boubou', 'Kaftan', 'Ensemble', 'Kimono', 'Autre'];

const VIDE = { nom: '', type: 'Boubou', modele: '', date: '', message: '' };

/** Compose le message WhatsApp à partir du formulaire. Rien n'est envoyé à un serveur. */
export function composerMessage({ nom, type, modele, date, message }) {
  let m = 'Bonjour BEA,';
  if (nom.trim()) m += ` je suis ${nom.trim()}.`;
  m += ` Je souhaite commander : ${type}.`;
  if (modele.trim()) m += ` Modèle de référence : ${modele.trim()}.`;
  if (date.trim()) m += ` Échéance : ${date.trim()}.`;
  if (message.trim()) m += ` Détails : ${message.trim()}`;
  return m;
}

export default function SurMesure() {
  const [champs, setChamps] = useState(VIDE);
  useApparition();
  useTitrePage('Sur mesure', "Trois étapes pour une pièce unique : vous décrivez votre idée, nous validons tissu et mesures, la pièce est confectionnée à la main en 10 à 15 jours.");

  const majChamp = (cle) => (e) => setChamps((c) => ({ ...c, [cle]: e.target.value }));

  const envoyer = () => {
    window.open(waLink(composerMessage(champs)), '_blank', 'noopener');
  };

  return (
    <main>
      <section className="sec">
        <div className="wrap">
          <div className="sec-head rv">
            <Surtitre>Sur mesure</Surtitre>
            <TitreSection niveau={1}>Trois étapes, une pièce unique</TitreSection>
            <p>De la première conversation à la livraison, tout se fait par message, sans intermédiaire.</p>
          </div>
          <div className="steps rv">
            {ETAPES.map((e) => (
              <div className="step" key={e.num}>
                <p className="num">{e.num}</p>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec--chaud">
        <div className="wrap">
          <div className="sec-head rv" style={{ marginBottom: '28px' }}>
            <Surtitre>Votre demande</Surtitre>
            <TitreSection>Décrivez votre projet</TitreSection>
            <p>
              Remplissez ces quelques champs : votre message part sur WhatsApp déjà rédigé,
              vous n&apos;avez plus qu&apos;à l&apos;envoyer.
            </p>
          </div>

          <div className="rv">
            <div className="form">
              <div className="field">
                <label htmlFor="f-nom">Votre nom</label>
                <input id="f-nom" type="text" placeholder="Nom et prénom"
                  value={champs.nom} onChange={majChamp('nom')} />
              </div>

              <div className="field">
                <label htmlFor="f-type">Type de pièce</label>
                <select id="f-type" value={champs.type} onChange={majChamp('type')}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="field">
                <label htmlFor="f-modele">Modèle de référence</label>
                <select id="f-modele" value={champs.modele} onChange={majChamp('modele')}>
                  <option value="">Aucun, c&apos;est une création</option>
                  {pieces.map((p) => (
                    <option key={p.slug} value={`${p.ref} — ${p.nom}`}>{p.ref} — {p.nom}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="f-date">Pour quelle date</label>
                <input id="f-date" type="text" placeholder="Ex. mariage le 12 décembre"
                  value={champs.date} onChange={majChamp('date')} />
              </div>

              <div className="field field--full">
                <label htmlFor="f-msg">Votre idée</label>
                <textarea id="f-msg" placeholder="Tissu souhaité, couleurs, broderie, coupe…"
                  value={champs.message} onChange={majChamp('message')} />
              </div>

              <div className="field field--full">
                <Bouton variante="or" pleineLargeur id="send" onClick={envoyer}>
                  Envoyer sur WhatsApp
                </Bouton>
                <p className="note">
                  Rien n&apos;est envoyé automatiquement : WhatsApp s&apos;ouvre avec votre
                  message prêt. Aucune donnée ne quitte votre navigateur avant cela.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
