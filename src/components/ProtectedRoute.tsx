import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return <>{children}</>;  //pas de vérif pour l'instant
}

export default ProtectedRoute;