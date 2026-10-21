import { Link } from 'react-router-dom';

/**
 * Carte d'une pièce, allégée : photo, nom, référence. Toute la carte mène à la fiche.
 * La référence reste visible : elle sert aussi à la gestion du stock.
 */
export default function CartePiece({ piece }) {
  const { slug, ref, nom, photos } = piece;

  return (
    <Link className="piece rv" to={`/piece/${slug}`}>
      <span className="shot">
        <img src={photos[0]} alt={nom} loading="lazy" width="414" height="414" />
      </span>
      <span className="meta">
        <h3>{nom}</h3>
        <span className="ref">{ref}</span>
      </span>
    </Link>
  );
}
