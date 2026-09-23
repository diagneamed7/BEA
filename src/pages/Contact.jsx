import Surtitre from '../components/Surtitre.jsx';
import Ornement from '../components/Ornement.jsx';
import TitreSection from '../components/TitreSection.jsx';
import Bouton from '../components/Bouton.jsx';
import useApparition from '../hooks/useApparition.js';
import { waLink, MESSAGES } from '../config/contact.js';

export default function Contact() {
  useApparition();

  return (
    <main className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <Surtitre>Contact</Surtitre>
          <Ornement aligne="gauche" />
          <TitreSection niveau={1}>Écrivez-nous, on vous répond</TitreSection>
          <p>Tout se passe à distance, par message. Vous décrivez ce que vous voulez, nous vous guidons pour les mesures, et la pièce vous est livrée au Sénégal comme à l'international.</p>
        </div>
        <div className="rv" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Bouton variante="or" href={waLink(MESSAGES.commande)}>Démarrer ma commande</Bouton>
          <Bouton to="/sur-mesure">Démarrer un sur mesure</Bouton>
        </div>
        <p className="rv" style={{ marginTop: '32px', color: 'var(--texte-3)' }}>
          Écran provisoire : la mise en page définitive de cette page arrive dans une phase
          ultérieure. Les composants partagés — surtitre, ornement, titre, boutons, apparition
          au scroll — sont en place et se comportent déjà comme sur la maquette.
        </p>
      </div>
    </main>
  );
}
