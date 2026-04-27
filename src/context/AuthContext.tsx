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
}

//contexte val par défaut
const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {},
    isLoggedIn: false,
});
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        //utilisateur déjà connecté au chargement de l'app
        api.get('/auth/whoami')
            .then(res => setUser(res.data))
            .catch(() => setUser(null));
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

// hook 
export function useAuth() {
    return useContext(AuthContext);
}