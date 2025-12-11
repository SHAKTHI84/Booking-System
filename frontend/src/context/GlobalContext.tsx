import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

interface Show {
    id: number;
    name: string;
    type: string;
    start_time: string;
    total_seats: number;
}

interface GlobalContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    shows: Show[];
    fetchShows: () => Promise<void>;
    loading: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Restore session
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        window.location.href = '/login'; // Force redirect
    };

    const fetchShows = async () => {
        try {
            setLoading(true);
            const res = await api.get('/shows');
            setShows(res.data);
        } catch (err) {
            console.error('Failed to fetch shows', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShows();
    }, []);

    return (
        <GlobalContext.Provider value={{ user, login, logout, shows, fetchShows, loading }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};
