export const CONTACT = {
  whatsapp:  '221772524984',
  affichage: '+221 77 252 49 84',
  instagram: 'https://www.instagram.com/bea_bambaeleganceafricaine',
  tiktok:    'https://www.tiktok.com/@bambaeleganceafricaine',
  facebook:  'https://www.facebook.com/share/1GGdEbryMR/',
  email:     null,
};

export const waLink = (message) =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;

export const MESSAGES = {
  general: 'Bonjour BEA, je souhaite des informations.',
  infosPieces: 'Bonjour BEA, je souhaite des informations sur vos pièces.',
  commande: 'Bonjour BEA, je souhaite commander une pièce.',
  piece: (nom, ref) =>
    `Bonjour BEA, je souhaite commander le modèle ${nom} (${ref}). Pouvez-vous me confirmer le prix et le délai ?`,
};
