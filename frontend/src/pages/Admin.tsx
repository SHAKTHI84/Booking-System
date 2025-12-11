import React, { useState } from 'react';
import api from '../api';
import { useGlobal } from '../context/GlobalContext';

const Admin = () => {
    const { shows, fetchShows } = useGlobal(); // Use global shows
    const [form, setForm] = useState({
        name: '',
        type: 'SHOW',
        start_time: '',
        total_seats: 50
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/shows', {
                ...form,
                start_time: new Date(form.start_time).toISOString()
            });
            setMessage('Created successfully!');
            fetchShows(); // Refresh global list
            setForm({ name: '', type: 'SHOW', start_time: '', total_seats: 50 });
        } catch (err) {
            setMessage('Error creating show');
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.delete(`/shows/${id}`);
            fetchShows();
        } catch (err) {
            console.error(err);
            alert('Failed to delete show');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Create Form */}
                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Create New Event</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Event Name</label>
                            <input
                                className="input-field"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
                            <select
                                className="input-field"
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                            >
                                <option value="SHOW">Movie Show</option>
                                <option value="BUS">Bus Trip</option>
                                <option value="DOCTOR">Doctor Appointment</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Time</label>
                            <input
                                type="datetime-local"
                                className="input-field"
                                value={form.start_time}
                                onChange={e => setForm({ ...form, start_time: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Total Seats (for auto-generation)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={form.total_seats}
                                onChange={e => setForm({ ...form, total_seats: parseInt(e.target.value) })}
                                min={1}
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                            Create Event
                        </button>

                        {message && <p style={{ marginTop: '1rem', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
                    </form>
                </div>

                {/* List View */}
                <div>
                    <h2 style={{ marginBottom: '1rem' }}>Existing Events</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {shows.map(show => (
                            <div key={show.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{show.name}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{new Date(show.start_time).toLocaleDateString()}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        className="btn-ghost"
                                        style={{ color: '#fbbf24', padding: '0.5rem', cursor: 'pointer', border: 'none', background: 'transparent' }}
                                        onClick={async () => {
                                            if (confirm('Reset all bookings for this show?')) {
                                                await api.post('/bookings/reset', { showId: show.id });
                                                alert('Bookings reset!');
                                            }
                                        }}
                                    >
                                        Reset Seats
                                    </button>
                                    <button
                                        className="btn-ghost"
                                        style={{ color: '#ef4444', padding: '0.5rem', cursor: 'pointer', border: 'none', background: 'transparent' }}
                                        onClick={() => handleDelete(show.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {shows.length === 0 && <p style={{ opacity: 0.7 }}>No events found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
