import logo from '../assets/logo-bea.svg';

/**
 * Logo BEA — version blanche et or sur fond sombre, extraite de la maquette validée.
 * Jamais recoloré, étiré, pivoté, ni surchargé d'effet (CLAUDE.md §4).
 */
export default function Logo({ largeur = 74, className = '' }) {
  return (
    <img
      src={logo}
      alt="BEA — Bamba Élégance Africaine"
      width={largeur}
      className={className}
      style={{ width: largeur, height: 'auto' }}
    />
  );
}
