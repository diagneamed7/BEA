import { Link } from 'react-router-dom';

/**
 * Carte d'une pièce : photo 1:1, pastille de référence, filet or, nom, « Sur devis »,
 * matière, lien. Le prix est toujours sur devis (CLAUDE.md §6).
 */
export default function CartePiece({ piece }) {
  const { slug, ref, nom, matiere, photos } = piece;

  return (
    <Link className="piece rv" to={`/piece/${slug}`}>
      <span className="shot">
        <span className="ref">{ref}</span>
        <img src={photos[0]} alt={nom} loading="lazy" width="414" height="414" />
      </span>
      <span className="meta">
        <h3>{nom}</h3>
        <span className="price">Sur devis</span>
      </span>
      <span className="fabric">{matiere}</span>
      <span className="see">Voir la pièce →</span>
    </Link>
  );
}
