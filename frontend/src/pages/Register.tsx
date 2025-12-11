import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
    const { login } = useGlobal();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', form);
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Register</h1>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="input-field"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="input-field"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="input-field"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={6}
                    />
                    <button type="submit" className="btn-primary">Create Account</button>
                    {error && <p style={{ color: '#ef4444' }}>{error}</p>}
                </form>

                <p style={{ marginTop: '1rem', opacity: 0.7 }}>
                    Already have an account? <Link to="/login" style={{ color: '#38bdf8' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
