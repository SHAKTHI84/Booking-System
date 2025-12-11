import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import { GlobalProvider, useGlobal } from './context/GlobalContext';
import type { ReactNode } from 'react';

const Navbar = () => {
  const { user, logout } = useGlobal();

  return (
    <nav className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        🎟️ TicketMaster
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/" className="btn-ghost">Home</Link>
            {user.role === 'ADMIN' && <Link to="/admin" className="btn-ghost">Admin Dashboard</Link>}
            <div style={{ marginLeft: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
              Hi, {user.name.split(' ')[0]}
            </div>
            <button onClick={logout} className="btn-ghost" style={{ color: '#ef4444' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const ProtectedAdmin = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useGlobal();
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" />;
  return <>{children}</>;
};

const ProtectedUser = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useGlobal();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<ProtectedUser><Home /></ProtectedUser>} />
            <Route path="/book/:id" element={<ProtectedUser><Booking /></ProtectedUser>} />

            <Route path="/admin" element={<ProtectedAdmin><Admin /></ProtectedAdmin>} />
          </Routes>
        </div>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
