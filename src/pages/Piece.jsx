import { useParams } from 'react-router-dom';
import Surtitre from '../components/Surtitre.jsx';
import Ornement from '../components/Ornement.jsx';
import TitreSection from '../components/TitreSection.jsx';
import Bouton from '../components/Bouton.jsx';
import useApparition from '../hooks/useApparition.js';

export default function Piece() {
  const { slug } = useParams();
  useApparition([slug]);

  return (
    <main className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <Surtitre>Fiche pièce</Surtitre>
          <Ornement aligne="gauche" />
          <TitreSection niveau={1}>Fiche pièce</TitreSection>
          <p>
            Référence demandée : {slug}. Le prix est toujours sur devis et la commande passe par
            WhatsApp, avec le nom du modèle et sa référence déjà renseignés dans le message.
          </p>
        </div>
        <div className="rv">
          <Bouton to="/collection">Retour à la collection</Bouton>
        </div>
        <p className="rv" style={{ marginTop: '32px', color: 'var(--texte-3)' }}>
          Écran provisoire : la fiche définitive, alimentée par les données, arrive en phase 7.
        </p>
      </div>
    </main>
  );
}
