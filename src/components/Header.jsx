import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';

const LIENS = [
  { to: '/collection', libelle: 'Collection' },
  { to: '/commander', libelle: 'Sur mesure' },
];

export default function Header() {
  const [ouvert, setOuvert] = useState(false);
  const { pathname } = useLocation();

  // Le tiroir se referme à chaque changement de route.
  useEffect(() => setOuvert(false), [pathname]);

  const fermer = () => setOuvert(false);

  return (
    <header className="hdr">
      <div className="wrap">
        <Link className="brand" to="/" onClick={fermer}>
          <Logo largeur={72} />
          <span className="brand-mots">
            Bamba Élégance
            <br />
            Africaine
          </span>
        </Link>

        <nav className="nav" aria-label="Navigation principale">
          {LIENS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'on' : undefined)}>
              {l.libelle}
            </NavLink>
          ))}
          <a href="#reseaux">Nos réseaux sociaux</a>
        </nav>

        <Link className="btn btn--plein hdr-cmd" to="/commander">
          Commander ici
        </Link>

        <button
          className="burger"
          aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={ouvert}
          aria-controls="tiroir"
          onClick={() => setOuvert((v) => !v)}
        >
          <span aria-hidden="true">{ouvert ? '✕' : '☰'}</span>
        </button>
      </div>

      <div id="tiroir" className={`drawer${ouvert ? ' open' : ''}`} hidden={!ouvert}>
        {LIENS.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={fermer}>
            {l.libelle}
          </NavLink>
        ))}
        <a href="#reseaux" onClick={fermer}>Nos réseaux sociaux</a>
        <Link className="drawer-cmd" to="/commander" onClick={fermer}>Commander ici</Link>
      </div>
    </header>
  );
}
