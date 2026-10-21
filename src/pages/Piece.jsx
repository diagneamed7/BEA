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

  // Deux lignes seulement : le reste se précise dans la conversation.
  const SPECS = [
    ['Matière', matiere],
    ['Délai', '10 à 15 jours, à vos mesures'],
  ];

  return (
    <main className="sec sec--tight">
      <div className="wrap">
        <Link className="back" to="/collection">← La collection</Link>

        <div className="detail">
          <div className="gal rv">
            <div className="frame">
              <img src={photos[0]} alt={nom} width="414" height="414" />
            </div>
          </div>

          <div className="info rv">
            <Surtitre>{categorie} · {genre}</Surtitre>
            <h1>{nom}</h1>
            <p className="ref-big">Réf. {ref}</p>
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
              <Bouton variante="plein" href={waLink(MESSAGES.piece(nom, ref))}>
                Commander ici
              </Bouton>
              <p className="note">Le message est déjà rempli avec le nom et la référence.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
