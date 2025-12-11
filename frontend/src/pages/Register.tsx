import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const { login } = useGlobal();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
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

    const handleDemoMode = async () => {
        try {
            const res = await api.post('/auth/login', {
                email: 'ss0068@srmist.edu.in',
                password: 'Hello@2002'
            });
            login(res.data.token, res.data.user);
            navigate('/admin');
        } catch (err: any) {
            setError('Demo Login Failed');
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '4rem auto', display: 'flex', gap: '2rem', alignItems: 'stretch' }}>

            {/* Left Side: Register Form */}
            <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Register</h1>
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
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="input-field"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                            style={{ width: '100%' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button type="submit" className="btn-primary">Create Account</button>
                    {error && <p style={{ color: '#ef4444' }}>{error}</p>}
                </form>

                <p style={{ marginTop: '1rem', opacity: 0.7, textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: '#38bdf8' }}>Login</Link>
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

export default Register;
