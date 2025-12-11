import { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Eye, EyeOff, User, ShieldCheck } from 'lucide-react';

const Login = () => {
    const { login } = useGlobal();
    const navigate = useNavigate();
    const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', form);

            // Optional: Check if the logged-in user actually matches the selected tab role
            if (res.data.user.role !== role) {
                setError(`Please login through the ${res.data.user.role === 'ADMIN' ? 'Admin' : 'User'} tab.`);
                return;
            }

            login(res.data.token, res.data.user);
            navigate(res.data.user.role === 'ADMIN' ? '/admin' : '/');
        } catch (err: any) {
            console.error('Login Error:', err);
            const status = err.response?.status;
            const url = err.config?.baseURL + err.config?.url;
            setError(`Failed at ${url} (${status}) - ${err.message}`);
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
            console.error('Demo Login Error:', err);
            const status = err.response?.status;
            const url = err.config?.baseURL + err.config?.url;
            setError(`Failed at ${url} (${status}) - ${err.message}`);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '4rem auto', display: 'flex', gap: '2rem', alignItems: 'stretch' }}>

            {/* Left Side: Login Form with Tabs */}
            <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>

                {/* Role Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <button
                        onClick={() => setRole('USER')}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: role === 'USER' ? '#3b82f6' : 'transparent',
                            color: role === 'USER' ? 'white' : '#94a3b8',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <User size={18} /> User Login
                    </button>
                    <button
                        onClick={() => setRole('ADMIN')}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: role === 'ADMIN' ? '#ec4899' : 'transparent',
                            color: role === 'ADMIN' ? 'white' : '#94a3b8',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <ShieldCheck size={18} /> Admin Login
                    </button>
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                    {role === 'ADMIN' ? 'Admin Portal' : 'Welcome Back'}
                </h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder={role === 'ADMIN' ? "Admin Email" : "User Email"}
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
                            style={{ width: '100%' }}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer'
                            }}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button type="submit" className="btn-primary" style={{ background: role === 'ADMIN' ? '#ec4899' : '#3b82f6' }}>
                        {role === 'ADMIN' ? 'Access Dashboard' : 'Login'}
                    </button>

                    {error && <div style={{ color: '#ef4444', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
                </form>

                {role === 'USER' && (
                    <p style={{ marginTop: '1rem', opacity: 0.7, textAlign: 'center' }}>
                        New here? <Link to="/register" style={{ color: '#38bdf8' }}>Create an Account</Link>
                    </p>
                )}
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
