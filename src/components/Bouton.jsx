import { Link } from 'react-router-dom';

/**
 * Bouton unique du site. Trois variantes : `or` (fond doré), `contour` (filet blanc),
 * et l'option `pleineLargeur`. Angles droits, aucun dégradé ni ombre (CLAUDE.md §4).
 *
 * Rend un <Link> pour une route interne, un <a> pour une URL externe, un <button> sinon.
 */
export default function Bouton({
  variante = 'contour',
  pleineLargeur = false,
  to,
  href,
  children,
  className = '',
  ...reste
}) {
  const classes = [
    'btn',
    variante === 'or' ? 'btn--wa' : null,
    pleineLargeur ? 'btn--block' : null,
    className || null,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link className={classes} to={to} {...reste}>
        {children}
      </Link>
    );
  }
  if (href) {
    const externe = /^https?:/.test(href);
    return (
      <a
        className={classes}
        href={href}
        {...(externe ? { target: '_blank', rel: 'noopener' } : {})}
        {...reste}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...reste}>
      {children}
    </button>
  );
}
