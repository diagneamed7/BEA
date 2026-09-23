import Surtitre from '../components/Surtitre.jsx';
import Ornement from '../components/Ornement.jsx';
import TitreSection from '../components/TitreSection.jsx';
import Bouton from '../components/Bouton.jsx';
import useApparition from '../hooks/useApparition.js';
import { CONTACT, waLink, MESSAGES } from '../config/contact.js';

const MESURES = [
  { num: 'Mesure 01', titre: 'Épaules et poitrine', texte: 'Largeur d’une épaule à l’autre, puis tour de poitrine au plus large, mètre bien à plat.' },
  { num: 'Mesure 02', titre: 'Longueur', texte: 'De la base du cou jusqu’à l’endroit où vous voulez que la pièce s’arrête.' },
  { num: 'Mesure 03', titre: 'Manches', texte: 'De l’épaule au poignet, bras légèrement plié. Envoyez le tout par message, on vérifie avec vous.' },
];

export default function Contact() {
  useApparition();

  return (
    <main>
      <section className="sec">
        <div className="wrap">
          <div className="contact-grid">
            <div className="rv">
              <Surtitre>Contact</Surtitre>
              <Ornement aligne="gauche" />
              <TitreSection niveau={1} style={{ marginTop: '16px' }}>
                Écrivez-nous, on vous répond
              </TitreSection>
              <p style={{ marginTop: '20px' }}>
                Tout se passe à distance, par message. Vous décrivez ce que vous voulez, nous
                vous guidons pour les mesures, et la pièce vous est livrée.
              </p>

              <ul className="info-list">
                <li>
                  <span className="k">WhatsApp — le plus rapide</span>
                  <a href={waLink(MESSAGES.infosPieces)} target="_blank" rel="noopener">
                    {CONTACT.affichage}
                  </a>
                </li>
                <li>
                  <span className="k">Réseaux</span>
                  <a href={CONTACT.instagram} target="_blank" rel="noopener">Instagram</a>
                  {' · '}
                  <a href={CONTACT.tiktok} target="_blank" rel="noopener">TikTok</a>
                  {' · '}
                  <a href={CONTACT.facebook} target="_blank" rel="noopener">Facebook</a>
                </li>
                <li><span className="k">Réponse</span>Du lundi au samedi, sous 24 h</li>
                <li><span className="k">Livraison</span>Partout au Sénégal et à l&apos;international</li>
                {CONTACT.email && (
                  <li>
                    <span className="k">E-mail</span>
                    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  </li>
                )}
              </ul>

              <Bouton variante="or" href={waLink(MESSAGES.infosPieces)} style={{ marginTop: '30px' }}>
                Démarrer une conversation
              </Bouton>
            </div>

            <div className="rv">
              <div className="frame" style={{ aspectRatio: '1 / 1' }}>
                <img src="/images/pieces/bea-007-1.jpg" alt="Boubou Cérémonie Crème, pièce BEA" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec--chaud" style={{ paddingTop: 'clamp(44px,5vw,72px)' }}>
        <div className="wrap">
          <div className="sec-head rv" style={{ marginBottom: '30px' }}>
            <Surtitre>Prise de mesures</Surtitre>
            <TitreSection>Se faire mesurer chez soi</TitreSection>
            <p>Pas besoin de se déplacer. Un mètre ruban, quelqu&apos;un pour aider, et cinq minutes suffisent.</p>
          </div>
          <div className="steps rv">
            {MESURES.map((m) => (
              <div className="step" key={m.num}>
                <p className="num">{m.num}</p>
                <h3>{m.titre}</h3>
                <p>{m.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
