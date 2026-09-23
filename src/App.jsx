import { Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil.jsx';
import Collection from './pages/Collection.jsx';
import Piece from './pages/Piece.jsx';
import SurMesure from './pages/SurMesure.jsx';
import Contact from './pages/Contact.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/piece/:slug" element={<Piece />} />
      <Route path="/sur-mesure" element={<SurMesure />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}
