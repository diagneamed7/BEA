import Surtitre from './Surtitre.jsx';
import Ornement from './Ornement.jsx';
import Bouton from './Bouton.jsx';
import { waLink, MESSAGES } from '../config/contact.js';

/**
 * Page d'erreur sobre, partagée par la fiche d'un slug inexistant et le 404 global.
 * Jamais d'écran blanc : la page reste navigable, avec des sorties utiles.
 */
export default function PageErreur({
  code = '404',
  titre = 'Cette page n’existe pas',
  texte = 'Le lien est peut-être incomplet, ou la page a changé d’adresse.',
}) {
  return (
    <main className="sec erreur">
      <div className="wrap">
        <Surtitre>Erreur {code}</Surtitre>
        <Ornement aligne="gauche" />
        <h1>{titre}</h1>
        <p className="lead">{texte}</p>
        <div className="erreur-cta">
          <Bouton variante="or" to="/collection">Voir la collection</Bouton>
          <Bouton to="/">Retour à l&apos;accueil</Bouton>
          <Bouton href={waLink(MESSAGES.infosPieces)}>Écrire sur WhatsApp</Bouton>
        </div>
      </div>
    </main>
  );
}
