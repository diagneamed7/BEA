import Surtitre from '../components/Surtitre.jsx';
import Ornement from '../components/Ornement.jsx';
import TitreSection from '../components/TitreSection.jsx';
import Bouton from '../components/Bouton.jsx';
import useApparition from '../hooks/useApparition.js';
import { waLink, MESSAGES } from '../config/contact.js';

export default function Collection() {
  useApparition();

  return (
    <main className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <Surtitre>Catalogue</Surtitre>
          <Ornement aligne="gauche" />
          <TitreSection niveau={1}>La collection</TitreSection>
          <p>Toutes les pièces disponibles. Chacune est confectionnée à la demande — le tissu, la broderie et les mesures se décident avec vous.</p>
        </div>
        <div className="rv" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Bouton variante="or" href={waLink(MESSAGES.commande)}>Démarrer ma commande</Bouton>
          <Bouton to="/sur-mesure">Demander du sur mesure</Bouton>
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
