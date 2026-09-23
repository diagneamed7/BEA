import { Link, useParams } from 'react-router-dom';
import Surtitre from '../components/Surtitre.jsx';
import Bouton from '../components/Bouton.jsx';
import PageErreur from '../components/PageErreur.jsx';
import useApparition from '../hooks/useApparition.js';
import useTitrePage from '../hooks/useTitrePage.js';
import { waLink, MESSAGES } from '../config/contact.js';
import pieces from '../data/pieces.json';

export default function Piece() {
  const { slug } = useParams();
  const piece = pieces.find((p) => p.slug === slug);
  useApparition([slug]);
  useTitrePage(
    piece ? piece.nom : 'Pièce introuvable',
    piece
      ? `${piece.nom} (${piece.ref}) — ${piece.categorie.toLowerCase()} ${piece.genre.toLowerCase()} en ${piece.matiere.toLowerCase()}. Confectionné à la main, sur mesure, sur devis.`
      : 'Cette pièce n’est pas à la collection BEA. Découvrez les boubous, kaftans, ensembles et kimonos disponibles.'
  );

  if (!piece) {
    return (
      <PageErreur
        code="404"
        titre="Cette pièce n’est pas à la collection"
        texte="La référence demandée n’existe pas ou n’est plus proposée. La collection complète est juste là."
      />
    );
  }

  const { ref, nom, categorie, genre, matiere, description, photos } = piece;

  const SPECS = [
    ['Référence', ref],
    ['Matière', matiere],
    ['Confection', 'À la main, sur mesure, 10 à 15 jours'],
    ['Tailles', 'Toutes tailles, à vos mesures'],
    ['Livraison', 'Sénégal et international'],
  ];

  return (
    <main className="sec sec--tight">
      <div className="wrap">
        <Link className="back" to="/collection">← Retour à la collection</Link>

        <div className="detail">
          <div className="gal rv">
            <div className="frame">
              <img src={photos[0]} alt={nom} width="414" height="414" />
            </div>
          </div>

          <div className="info rv">
            <Surtitre>{categorie} · {genre}</Surtitre>
            <h1>{nom}</h1>
            <p className="price-big">Sur devis</p>
            <p className="desc">{description}</p>

            <dl className="spec">
              {SPECS.map(([cle, valeur]) => (
                <div key={cle}>
                  <dt>{cle}</dt>
                  <dd>{valeur}</dd>
                </div>
              ))}
            </dl>

            <div className="buy">
              <Bouton variante="or" pleineLargeur href={waLink(MESSAGES.piece(nom, ref))}>
                Commander sur WhatsApp
              </Bouton>
              <Bouton pleineLargeur to="/sur-mesure">
                Demander une variante sur mesure
              </Bouton>
              <p className="note">
                La conversation s&apos;ouvre avec la référence déjà renseignée. Aucun compte à créer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
