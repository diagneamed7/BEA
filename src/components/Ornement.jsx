/**
 * Losange or entre deux filets. `aligne="gauche"` supprime le filet de gauche.
 * Purement décoratif : masqué aux lecteurs d'écran.
 */
export default function Ornement({ aligne = 'centre' }) {
  return (
    <div className={`rule${aligne === 'gauche' ? ' rule--left' : ''}`} aria-hidden="true">
      <i />
    </div>
  );
}
