import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth(); //état de connexion

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />; //redirection login
    }

    return <>{children}</>; 

}

export default ProtectedRoute;