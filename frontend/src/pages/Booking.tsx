import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface Seat {
    id: number;
    label: string;
    status: 'AVAILABLE' | 'PENDING' | 'BOOKED';
    user_id: string | null;
    expires_at: string | null;
}

interface ShowDetail {
    id: number;
    name: string;
    type: string;
    seats: Seat[];
}

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [show, setShow] = useState<ShowDetail | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]); // Local selection
    const [userId] = useState(() => 'user-' + Math.random().toString(36).substr(2, 9)); // Mock User ID
    const [bookingStep, setBookingStep] = useState<'SELECT' | 'CONFIRM'>('SELECT');
    const [error, setError] = useState('');
    const [expiryTime, setExpiryTime] = useState<Date | null>(null);

    const fetchShow = useCallback(async () => {
        try {
            const res = await api.get(`/shows/${id}`);
            setShow(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [id]);

    // Polling
    useEffect(() => {
        fetchShow();
        const interval = setInterval(fetchShow, 2000);
        return () => clearInterval(interval);
    }, [fetchShow]);

    const toggleSeat = (label: string) => {
        if (bookingStep !== 'SELECT') return;
        setSelectedSeats(prev =>
            prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
        );
    };

    const handleHold = async () => {
        if (selectedSeats.length === 0) return;
        setError('');
        try {
            const res = await api.post('/bookings/hold', {
                showId: Number(id),
                seatLabels: selectedSeats,
                userId
            });
            setExpiryTime(new Date(res.data.expiry));
            setBookingStep('CONFIRM');
            fetchShow(); // update status immediately
        } catch (err: any) {
            setError(err.response?.data?.error || 'Booking Failed');
        }
    };

    const handleConfirm = async () => {
        try {
            await api.post('/bookings/confirm', {
                showId: Number(id),
                seatLabels: selectedSeats,
                userId
            });
            alert('Booking Confirmed!');
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Confirmation Failed');
            setBookingStep('SELECT'); // Revert
        }
    };

    if (!show) return <div className="text-center p-10">Loading...</div>;

    const renderSeat = (seat: Seat) => {
        const isSelected = selectedSeats.includes(seat.label);
        const isHeldByMe = seat.status === 'PENDING' && seat.user_id === userId;
        const isHeldByOther = seat.status === 'PENDING' && seat.user_id !== userId;
        const isBooked = seat.status === 'BOOKED';

        let bgColor = 'rgba(255,255,255,0.1)';
        let cursor = 'pointer';

        if (isSelected) bgColor = '#6366f1';
        if (isHeldByMe) bgColor = '#fbbf24';
        if (isHeldByOther) { bgColor = '#ef4444'; cursor = 'not-allowed'; }
        if (isBooked) { bgColor = '#dc2626'; cursor = 'not-allowed'; }

        return (
            <button
                key={seat.id}
                onClick={() => (!isHeldByOther && !isBooked) && toggleSeat(seat.label)}
                disabled={isHeldByOther || isBooked || (bookingStep === 'CONFIRM' && !isHeldByMe)}
                style={{
                    backgroundColor: bgColor,
                    border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    height: '40px',
                    color: 'white',
                    cursor: (isHeldByOther || isBooked) ? 'not-allowed' : cursor,
                    transition: '0.2s',
                    minWidth: '40px'
                }}
                title={seat.label}
            >
                {seat.label}
            </button>
        );
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{show.name}</h1>
                <p className="opacity-70">User ID: {userId}</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

                {/* Seat Grid */}
                <div className="glass-panel" style={{ flex: 1, padding: '2rem', minWidth: '300px' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Select Seats</h2>

                    {/* Layout Logic */}
                    {show.type === 'BUS' ? (
                        <div className="bus-container">
                            <div style={{ width: '100%', padding: '1rem', background: '#334155', borderRadius: '8px', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold' }}>
                                🚌 Front / Driver
                            </div>
                            <div className="bus-seats-row">
                                {/* Left Column */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
                                    {show.seats.filter(s => s.label.startsWith('L')).map(seat => renderSeat(seat))}
                                </div>
                                {/* Aisle */}
                                <div style={{ width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>
                                {/* Right Column */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
                                    {show.seats.filter(s => s.label.startsWith('R')).map(seat => renderSeat(seat))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Theater / Doctor Layout
                        <div className="theater-container">
                            {show.type === 'SHOW' && (
                                <div style={{
                                    width: '80%',
                                    height: '60px',
                                    marginBottom: '3rem',
                                    borderTop: '4px solid rgba(255,255,255,0.2)',
                                    borderRadius: '50% 50% 0 0 / 20px 20px 0 0',
                                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
                                    boxShadow: '0 -20px 30px rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(255,255,255,0.4)',
                                    letterSpacing: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    transform: 'perspective(500px) rotateX(20deg)'
                                }}>
                                    SCREEN
                                </div>
                            )}
                            <div className="theater-grid">
                                {show.seats.map(seat => renderSeat(seat))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 16, height: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}></div> Available</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 16, height: 16, background: '#6366f1', borderRadius: 4 }}></div> Selected</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 16, height: 16, background: '#ef4444', borderRadius: 4 }}></div> Pending/Taken</div>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="glass-panel" style={{ width: '300px', padding: '1.5rem', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Summary</h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <p>Selected: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
                        <p style={{ marginTop: '0.5rem' }}>Total: ${selectedSeats.length * 10}</p>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    {bookingStep === 'SELECT' ? (
                        <button
                            className="btn-primary"
                            style={{ width: '100%', opacity: selectedSeats.length ? 1 : 0.5 }}
                            disabled={!selectedSeats.length}
                            onClick={handleHold}
                        >
                            Proceed to Pay
                        </button>
                    ) : (
                        <div>
                            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(251, 191, 36, 0.2)', borderRadius: '4px', color: '#fcd34d' }}>
                                Seats Reserved! {expiryTime ? `Expires at ${expiryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Complete payment soon.'}
                            </div>
                            <button
                                className="btn-primary"
                                style={{ width: '100%', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                                onClick={handleConfirm}
                            >
                                Confirm Payment
                            </button>
                            <button
                                className="btn-ghost"
                                style={{ width: '100%', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', background: 'transparent', color: 'white' }}
                                onClick={() => {
                                    setBookingStep('SELECT');
                                    setSelectedSeats([]);
                                    setError('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div >
    );
};

export default Booking;
