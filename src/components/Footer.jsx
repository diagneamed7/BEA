import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { CONTACT, waLink, MESSAGES } from '../config/contact.js';

export default function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="cols">
          <div className="fbrand">
            <Logo largeur={96} />
            <p>Bamba Élégance Africaine. Vêtements traditionnels et contemporains, confectionnés à la main.</p>
          </div>

          <div>
            <h3>Navigation</h3>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/collection">Collection</Link></li>
              <li><Link to="/sur-mesure">Sur mesure</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3>Suivre BEA</h3>
            <ul>
              <li><a href={CONTACT.instagram} target="_blank" rel="noopener">Instagram</a></li>
              <li><a href={CONTACT.facebook} target="_blank" rel="noopener">Facebook</a></li>
              <li><a href={CONTACT.tiktok} target="_blank" rel="noopener">TikTok</a></li>
              <li><a href={waLink(MESSAGES.general)} target="_blank" rel="noopener">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        <div className="base">
          <span>© {new Date().getFullYear()} BEA — Bamba Élégance Africaine</span>
          <span>Mentions légales</span>
        </div>
      </div>
    </footer>
  );
}
