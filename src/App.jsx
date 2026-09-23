import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import HautDePage from './components/HautDePage.jsx';
import Footer from './components/Footer.jsx';
import PageErreur from './components/PageErreur.jsx';
import useTitrePage from './hooks/useTitrePage.js';
import Accueil from './pages/Accueil.jsx';
import Collection from './pages/Collection.jsx';
import Piece from './pages/Piece.jsx';
import SurMesure from './pages/SurMesure.jsx';
import Contact from './pages/Contact.jsx';
import MentionsLegales from './pages/MentionsLegales.jsx';

function Introuvable() {
  useTitrePage(
    'Page introuvable',
    'Cette page n’existe pas. Retrouvez la collection BEA : boubous, kaftans, ensembles et kimonos confectionnés à la main.'
  );
  return <PageErreur />;
}

export default function App() {
  return (
    <>
      <HautDePage />
      <Header />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/piece/:slug" element={<Piece />} />
        <Route path="/sur-mesure" element={<SurMesure />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="*" element={<Introuvable />} />
      </Routes>
      <Footer />
    </>
  );
}
