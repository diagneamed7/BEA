/**
 * Titre de section. `niveau` permet de garder une hiérarchie correcte :
 * un h1 par page, des h2 pour les sections.
 */
export default function TitreSection({ niveau = 2, children, ...reste }) {
  const Balise = `h${niveau}`;
  return <Balise {...reste}>{children}</Balise>;
}
