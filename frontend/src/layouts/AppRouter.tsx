import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VoicesPage from '../pages/VoicesPage';

export default function AppRouter() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/voices" replace />} />
          <Route path="/voices" element={<VoicesPage />} />
        </Routes>
      </div>
    </Router>
  );
} 