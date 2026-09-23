import { useEffect } from 'react';

/**
 * Apparition au scroll : fondu ascendant de 16px sur 0.7s (CLAUDE.md §4).
 * Ajoute la classe `in` aux éléments `.rv` dès qu'ils entrent dans le viewport.
 *
 * `prefers-reduced-motion: reduce` : les éléments sont révélés immédiatement, sans
 * observateur. La CSS neutralise en plus la transition, pour le cas où la préférence
 * change après le montage.
 */
export default function useApparition(dependances = []) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.rv:not(.in)'));
    if (elements.length === 0) return undefined;

    const mouvementReduit =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (mouvementReduit || typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('in'));
      return undefined;
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (!entree.isIntersecting) return;
          entree.target.classList.add('in');
          observateur.unobserve(entree.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    elements.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 3) * 70}ms`;
      observateur.observe(el);
    });

    return () => observateur.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependances);
}
