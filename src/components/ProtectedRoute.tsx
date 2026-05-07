import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, loading } = useAuth(); //état de connexion

    // attendre que whoami soit terminé avant de rediriger
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '5rem', color: '#1a2f5e' }}>Chargement...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />; //redirection login
    }

    return <>{children}</>; 
}

export default ProtectedRoute;