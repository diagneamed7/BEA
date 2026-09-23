import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { waLink, MESSAGES } from '../config/contact.js';

const LIENS = [
  { to: '/collection', libelle: 'Collection' },
  { to: '/sur-mesure', libelle: 'Sur mesure' },
  { to: '/contact', libelle: 'Contact' },
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
          <Logo largeur={74} />
          <span className="brand-mots">
            <b>BEA</b>
            <small>Bamba Élégance Africaine</small>
          </span>
        </Link>

        <nav className="nav" aria-label="Navigation principale">
          {LIENS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'on' : undefined)}>
              {l.libelle}
            </NavLink>
          ))}
        </nav>

        <a className="btn btn--wa hdr-wa" href={waLink(MESSAGES.general)} target="_blank" rel="noopener">
          Nous écrire
        </a>

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
        <a href={waLink(MESSAGES.general)} target="_blank" rel="noopener" onClick={fermer}>
          Écrire sur WhatsApp
        </a>
      </div>
    </header>
  );
}
