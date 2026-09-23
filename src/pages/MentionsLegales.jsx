import Surtitre from '../components/Surtitre.jsx';
import Ornement from '../components/Ornement.jsx';
import TitreSection from '../components/TitreSection.jsx';
import useApparition from '../hooks/useApparition.js';
import useTitrePage from '../hooks/useTitrePage.js';
import { CONTACT } from '../config/contact.js';

/**
 * Structure vide, à compléter par le client.
 *
 * Rien n'est inventé ici : ni raison sociale, ni numéro d'immatriculation, ni adresse, ni
 * hébergeur. Chaque rubrique porte la mention « À compléter » pour que le manque soit
 * visible plutôt que masqué par un texte plausible.
 */
const RUBRIQUES = [
  { titre: 'Éditeur du site', contenu: null },
  { titre: 'Forme juridique et immatriculation', contenu: null },
  { titre: 'Siège social', contenu: null },
  { titre: 'Directeur de la publication', contenu: null },
  { titre: 'Hébergeur', contenu: null },
  { titre: 'Contact', contenu: `WhatsApp ${CONTACT.affichage}` },
  { titre: 'Propriété intellectuelle', contenu: null },
  { titre: 'Données personnelles', contenu: 'Le site ne collecte aucune donnée : il n’y a ni compte client, ni formulaire envoyé à un serveur, ni cookie de mesure d’audience. Les informations saisies dans le formulaire sur mesure composent un message WhatsApp dans votre navigateur et ne transitent par aucun serveur de BEA.' },
  { titre: 'Cookies', contenu: 'Aucun cookie n’est déposé par ce site.' },
];

export default function MentionsLegales() {
  useApparition();
  useTitrePage(
    'Mentions légales',
    'Mentions légales du site BEA — Bamba Élégance Africaine : éditeur, hébergeur, propriété intellectuelle et données personnelles.'
  );

  return (
    <main className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <Surtitre>Informations légales</Surtitre>
          <Ornement aligne="gauche" />
          <TitreSection niveau={1}>Mentions légales</TitreSection>
        </div>

        <dl className="spec spec--legales rv" style={{ maxWidth: '820px' }}>
          {RUBRIQUES.map((r) => (
            <div key={r.titre}>
              <dt>{r.titre}</dt>
              <dd>{r.contenu || <span className="a-completer">À compléter</span>}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
