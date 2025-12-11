import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const { login } = useGlobal();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', form);
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    const handleDemoMode = async () => {
        try {
            // Auto-fill admin credentials for Demo Mode as requested "See every part"
            // Alternatively, we could have a specific 'guest' endpoint, but using admin creds is easiest to fulfill "view admin section" requirement for demo.
            const res = await api.post('/auth/login', {
                email: 'ss0068@srmist.edu.in',
                password: 'Hello@2002'
            });
            login(res.data.token, res.data.user);
            navigate('/admin');
        } catch (err: any) {
            setError('Demo Login Failed: ' + (err.response?.data?.error || 'Unknown'));
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Login</h1>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    />
                    <button type="submit" className="btn-primary">Login</button>
                    {error && <p style={{ color: '#ef4444' }}>{error}</p>}
                </form>

                <p style={{ marginTop: '1rem', opacity: 0.7 }}>
                    Don't have an account? <Link to="/register" style={{ color: '#38bdf8' }}>Register</Link>
                </p>
            </div>

            {/* Demo Mode Section */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fbbf24' }}>Demo Mode</h2>
                <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
                    Click here to view the full project without logging in or registering.
                </p>
                <button
                    onClick={handleDemoMode}
                    className="btn-ghost"
                    style={{
                        border: '1px solid #fbbf24',
                        padding: '0.8rem 2rem',
                        color: '#fbbf24',
                        background: 'rgba(251, 191, 36, 0.1)'
                    }}
                >
                    Enter as Guest (Full Access)
                </button>
            </div>
        </div>
    );
};

export default Login;
