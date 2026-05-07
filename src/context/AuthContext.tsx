import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import type { ReactNode } from 'react'; 

interface User {
    id: number;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoggedIn: boolean;
    loading: boolean; 
}

//contexte val par défaut
const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {},
    isLoggedIn: false,
    loading: true, // ✅ ajouter
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        //utilisateur déjà connecté au chargement de l'app
        api.get('/auth/whoami')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false)); 
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoggedIn: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// hook 
export function useAuth() {
    return useContext(AuthContext);
}