import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Remonte en haut à chaque changement de route, comme la maquette. */
export default function HautDePage() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
