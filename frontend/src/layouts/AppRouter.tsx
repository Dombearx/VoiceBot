import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VoicesPage from '../pages/VoicesPage';
import BotPage from '../pages/BotPage';
import Navigation from '../components/Navigation';

export default function AppRouter() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/voices" replace />} />
          <Route path="/voices" element={<VoicesPage />} />
          <Route path="/bot" element={<BotPage />} />
        </Routes>
      </div>
    </Router>
  );
} 