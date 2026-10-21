import Surtitre from '../components/Surtitre.jsx';
import Ornement from '../components/Ornement.jsx';
import TitreSection from '../components/TitreSection.jsx';
import Bouton from '../components/Bouton.jsx';
import CartePiece from '../components/CartePiece.jsx';
import useApparition from '../hooks/useApparition.js';
import useTitrePage from '../hooks/useTitrePage.js';
import pieces from '../data/pieces.json';

const VALEURS = [
  { titre: 'Authenticité', texte: 'Des tissus et des gestes d’ici.' },
  { titre: 'Élégance', texte: 'Le soin du détail, du col à l’ourlet.' },
  { titre: 'Excellence', texte: 'Des pièces faites pour durer.' },
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
            Des vêtements qui racontent une histoire, coupés, brodés et assemblés à la main,
            à vos mesures.
          </p>
          <div className="cta">
            <Bouton variante="plein" to="/commander">Commander ici</Bouton>
            <Bouton to="/collection">Voir la collection</Bouton>
          </div>
        </div>
      </section>

      {/* Les tenues d'abord */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head sec-head--split rv">
            <div>
              <Surtitre>La collection</Surtitre>
              <TitreSection>Les pièces du moment</TitreSection>
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

      {/* Les valeurs viennent ensuite justifier ce qu'on a vu */}
      <section className="promise">
        <div className="wrap row">
          {VALEURS.map((v) => (
            <div className="cell rv" key={v.titre}>
              <span className="mark" aria-hidden="true" />
              <h3>{v.titre}</h3>
              <p>{v.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sur mesure : une phrase, un bouton */}
      <section className="sec sm-split">
        <div className="wrap">
          <div className="rv">
            <div className="frame">
              <img src="/images/sur-mesure.jpg" alt="Pièce BEA confectionnée à la main" loading="lazy" />
            </div>
          </div>
          <div className="rv">
            <Surtitre>Sur mesure</Surtitre>
            <TitreSection style={{ marginTop: '16px' }}>Une pièce pensée pour vous</TitreSection>
            <p style={{ marginTop: '18px', maxWidth: '44ch' }}>
              Choisissez un modèle ou décrivez votre idée : nous la confectionnons à vos mesures.
            </p>
            <Bouton variante="plein" to="/commander" style={{ marginTop: '28px' }}>
              Commander ici
            </Bouton>
          </div>
        </div>
      </section>
    </main>
  );
}
