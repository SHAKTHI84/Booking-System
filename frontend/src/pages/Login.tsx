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
        <div style={{ maxWidth: '900px', margin: '4rem auto', display: 'flex', gap: '2rem', alignItems: 'stretch' }}>

            {/* Left Side: Login Form */}
            <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Login</h1>
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

                <p style={{ marginTop: '1rem', opacity: 0.7, textAlign: 'center' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#38bdf8' }}>Register</Link>
                </p>
            </div>

            {/* Right Side: Demo Mode */}
            <div className="glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fbbf24', textAlign: 'center' }}>Demo Access</h2>
                <p style={{ marginBottom: '2rem', opacity: 0.9, textAlign: 'center', lineHeight: '1.6' }}>
                    Recruiter or Visitor? <br />
                    Click below to access the <b>Full Project</b> (Admin Level) instantly without registration.
                </p>
                <button
                    onClick={handleDemoMode}
                    className="btn-ghost"
                    style={{
                        border: '2px solid #fbbf24',
                        padding: '1rem 2rem',
                        color: '#fbbf24',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        background: 'rgba(251, 191, 36, 0.1)',
                        width: '100%'
                    }}
                >
                    Enter Demo Mode
                </button>
            </div>
        </div>
    );
};

export default Login;
