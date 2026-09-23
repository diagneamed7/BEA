import { useParams } from 'react-router-dom';

export default function Piece() {
  const { slug } = useParams();
  return (
    <main className="sec">
      <div className="wrap">
        <h1>Fiche pièce</h1>
        <p style={{ marginTop: '20px' }}>
          Référence demandée : {slug}. Page provisoire — la fiche définitive arrive dans les
          phases suivantes. Le prix est toujours sur devis et la commande passe par WhatsApp,
          avec la référence du modèle déjà renseignée dans le message.
        </p>
      </div>
    </main>
  );
}
