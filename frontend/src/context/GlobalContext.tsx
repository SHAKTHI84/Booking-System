import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api';

interface Show {
    id: number;
    name: string;
    type: string;
    start_time: string;
    total_seats: number;
}

interface GlobalContextType {
    shows: Show[];
    fetchShows: () => Promise<void>;
    loading: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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
        <GlobalContext.Provider value={{ shows, fetchShows, loading }}>
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
