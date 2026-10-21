import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { CONTACT } from '../config/contact.js';

export default function Footer() {
  return (
    <footer className="ft" id="reseaux">
      <div className="wrap">
        <div className="cols">
          <div className="fbrand">
            <Logo largeur={96} />
            <span className="brand-mots">Bamba Élégance Africaine</span>
          </div>

          <div>
            <h3>Nos réseaux sociaux</h3>
            <ul>
              <li><a href={CONTACT.instagram} target="_blank" rel="noopener">Instagram</a></li>
              <li><a href={CONTACT.tiktok} target="_blank" rel="noopener">TikTok</a></li>
              <li><a href={CONTACT.facebook} target="_blank" rel="noopener">Facebook</a></li>
            </ul>
          </div>

          <div>
            <h3>Commander</h3>
            <span className="tel">{CONTACT.affichage}</span>
            <Link className="btn btn--plein" to="/commander">Commander ici</Link>
          </div>
        </div>

        <div className="base">
          <span>© {new Date().getFullYear()} BEA — Bamba Élégance Africaine</span>
          <Link to="/mentions-legales">Mentions légales</Link>
        </div>
      </div>
    </footer>
  );
}
