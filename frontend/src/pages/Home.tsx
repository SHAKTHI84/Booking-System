import { Link } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { Calendar, Clock } from 'lucide-react';

const Home = () => {
    const { shows, loading } = useGlobal();

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading shows...</div>;

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Upcoming Events
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {shows.map((show) => (
                    <div key={show.id} className="glass-panel" style={{ padding: '1.5rem', transition: '0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {show.type}
                            </span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{show.name}</h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                            <Calendar size={16} />
                            <span>{new Date(show.start_time).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
                            <Clock size={16} />
                            <span>{new Date(show.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <Link to={`/book/${show.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                            Book Now
                        </Link>
                    </div>
                ))}
            </div>

            {shows.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.7, marginTop: '2rem' }}>
                    No shows available. Check the Admin panel to create one!
                </div>
            )}
        </div>
    );
};

export default Home;
