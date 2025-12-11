import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Booking from './pages/Booking';
import { GlobalProvider } from './context/GlobalContext';

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <nav className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              🎟️ TicketMaster
            </Link>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/" className="btn-ghost">Home</Link>
              <Link to="/admin" className="btn-ghost">Admin Dashboard</Link>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/book/:id" element={<Booking />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
