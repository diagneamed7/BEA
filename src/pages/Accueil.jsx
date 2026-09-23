import { Link } from 'react-router-dom';
import Surtitre from '../components/Surtitre.jsx';
import Ornement from '../components/Ornement.jsx';
import TitreSection from '../components/TitreSection.jsx';
import Bouton from '../components/Bouton.jsx';
import CartePiece from '../components/CartePiece.jsx';
import useApparition from '../hooks/useApparition.js';
import useTitrePage from '../hooks/useTitrePage.js';
import { waLink, MESSAGES } from '../config/contact.js';
import pieces from '../data/pieces.json';

const VALEURS = [
  { titre: 'Authenticité', texte: 'Fidèles à nos racines culturelles. Nous valorisons le vrai, le local et le fait main.' },
  { titre: 'Élégance', texte: 'Chaque création incarne le raffinement, la noblesse et le souci du détail.' },
  { titre: 'Excellence', texte: 'Des pièces de qualité supérieure, pensées pour durer bien au-delà d’une saison.' },
  { titre: 'Fierté', texte: 'Porter son identité avec assurance et dignité, ici comme partout ailleurs.' },
];

export default function Accueil() {
  const misesEnAvant = pieces.filter((p) => p.mise_en_avant);
  useApparition();
  useTitrePage(null, "Vêtements traditionnels et contemporains confectionnés à la main au Sénégal. Boubous, kaftans, ensembles et kimonos, à vos mesures, sur devis.");

  return (
    <main>
      {/* Ouverture plein cadre */}
      <section className="opener">
        <img src="/images/ouverture.jpg" alt="" />
        <div className="veil" aria-hidden="true" />
        <div className="wrap">
          <Surtitre>Bamba Élégance Africaine</Surtitre>
          <Ornement />
          <h1>
            L&apos;élégance africaine
            <br />
            dans toute sa <em>splendeur</em>
          </h1>
          <p className="lead">
            Des vêtements qui racontent une histoire. Chaque pièce est coupée, brodée et
            assemblée à la main, à vos mesures.
          </p>
          <div className="cta">
            <Bouton variante="or" href={waLink(MESSAGES.commande)}>Démarrer ma commande</Bouton>
            <Bouton to="/collection">Voir la collection</Bouton>
          </div>
        </div>
      </section>

      {/* Les quatre valeurs */}
      <section className="promise">
        <div className="row">
          {VALEURS.map((v) => (
            <div className="cell rv" key={v.titre}>
              <span className="mark" aria-hidden="true" />
              <h3>{v.titre}</h3>
              <p>{v.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Les pièces mises en avant */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head sec-head--split rv">
            <div>
              <Surtitre>Collection en cours</Surtitre>
              <TitreSection>Les pièces du moment</TitreSection>
              <p>
                Une sélection renouvelée régulièrement. Chaque modèle est réalisé à la demande,
                à vos mesures, dans le tissu de votre choix.
              </p>
            </div>
            <Bouton to="/collection">Toute la collection</Bouton>
          </div>
          <div className="pieces">
            {misesEnAvant.map((p) => (
              <CartePiece key={p.slug} piece={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Sur mesure, deux colonnes */}
      <section className="sec sm-split">
        <div className="wrap">
          <div className="rv">
            <Surtitre>Sur mesure</Surtitre>
            <Ornement aligne="gauche" />
            <TitreSection style={{ marginTop: '16px' }}>Une pièce pensée pour vous</TitreSection>
            <p style={{ marginTop: '20px' }}>
              Un modèle de la collection dans un autre tissu, ou une idée entièrement nouvelle :
              tout part d&apos;une conversation. Vous décrivez ce que vous voulez, nous vous
              guidons pour les mesures, et la pièce est confectionnée à la main.
            </p>
            <Bouton variante="or" to="/sur-mesure" style={{ marginTop: '30px' }}>
              Démarrer ma commande
            </Bouton>
          </div>
          <div className="rv">
            <div className="frame">
              <img src="/images/sur-mesure.jpg" alt="Pièce BEA confectionnée à la main" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Appel final */}
      <section className="sec cta-band">
        <div className="wrap">
          <Surtitre>Prêt à commander</Surtitre>
          <Ornement />
          <TitreSection>Parlons de votre pièce</TitreSection>
          <p>
            Un modèle vous plaît, ou vous avez une idée précise en tête ? Écrivez-nous, nous
            répondons directement.
          </p>
          <Bouton variante="or" href={waLink(MESSAGES.commande)}>Discuter sur WhatsApp</Bouton>
        </div>
      </section>
    </main>
  );
}
