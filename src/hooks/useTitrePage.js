import { useEffect } from 'react';

const SUFFIXE = 'BEA — Bamba Élégance Africaine';

/**
 * Renseigne le <title> et la meta description de la page courante.
 *
 * Le site est une SPA : ces balises sont posées côté client. Les moteurs qui exécutent
 * JavaScript les voient ; un partage sur un réseau social qui lit le HTML brut verra les
 * valeurs par défaut de index.html. Un pré-rendu serait nécessaire pour aller plus loin —
 * signalé dans RAPPORT-FINAL.md.
 */
export default function useTitrePage(titre, description) {
  useEffect(() => {
    document.title = titre ? `${titre} · ${SUFFIXE}` : SUFFIXE;

    let balise = document.querySelector('meta[name="description"]');
    if (!balise) {
      balise = document.createElement('meta');
      balise.setAttribute('name', 'description');
      document.head.appendChild(balise);
    }
    balise.setAttribute('content', description);
  }, [titre, description]);
}
