import { useState } from 'react';
import Surtitre from '../components/Surtitre.jsx';
import TitreSection from '../components/TitreSection.jsx';
import CartePiece from '../components/CartePiece.jsx';
import useApparition from '../hooks/useApparition.js';
import pieces from '../data/pieces.json';

const CATEGORIES = ['Tout', 'Boubous', 'Kaftans', 'Ensembles', 'Kimonos'];

export default function Collection() {
  const [categorie, setCategorie] = useState('Tout');
  const visibles = categorie === 'Tout' ? pieces : pieces.filter((p) => p.categorie === categorie);

  // Relancé à chaque filtre : les cartes remontées doivent être révélées à leur tour.
  useApparition([categorie]);

  return (
    <main className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <Surtitre>Catalogue</Surtitre>
          <TitreSection niveau={1}>La collection</TitreSection>
          <p>
            Toutes les pièces disponibles. Chacune est confectionnée à la demande — le tissu,
            la broderie et les mesures se décident avec vous.
          </p>
        </div>

        <div className="chips rv" role="group" aria-label="Filtrer par catégorie">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${c === categorie ? ' on' : ''}`}
              aria-pressed={c === categorie}
              onClick={() => setCategorie(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="pieces">
          {visibles.map((p) => (
            <CartePiece key={p.slug} piece={p} />
          ))}
        </div>

        <p aria-live="polite" className="compte">
          {visibles.length} pièce{visibles.length > 1 ? 's' : ''}
          {categorie === 'Tout' ? '' : ` dans « ${categorie} »`}
        </p>
      </div>
    </main>
  );
}
