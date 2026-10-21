import logo from '../assets/logo-bea.svg';

/**
 * Logo BEA officiel (Logo BEA Version 3) : marron foncé et or caramel, sur fond clair.
 * Jamais recoloré, étiré, pivoté, ni surchargé d'effet.
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
