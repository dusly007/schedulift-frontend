import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/logo.png';

function Navbar() {
    const { isLoggedIn, user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleSignout = async () => {
        await api.post('/auth/signout');
        // déconnecté
        setUser(null);
        // vers login
        navigate('/login');
    };

    // style dynamique selon si le lien est actif
    const getLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
        color: isActive ? '#f47c20' : '#1a2f5e',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: isActive ? 'bold' : '500',
        borderBottom: isActive ? '2px solid #f47c20' : '2px solid transparent',
        paddingBottom: '0.2rem',
        transition: 'all 0.2s',
    });

    return (
        <nav style={styles.nav}>
            {/* Logo */}
            <NavLink to="/" style={{ lineHeight: 0 }}>
                <img src={logo} alt="Schedulift" style={styles.logo} />
            </NavLink>

            <div style={styles.links}>
                {/* liens accessibles à tous */}
                <NavLink to="/" end style={getLinkStyle}>Accueil</NavLink>

                {/* services — visiteur et client seulement */}
                {(!user || user?.role === 'client') && (
                    <NavLink to="/services" style={getLinkStyle}>Services</NavLink>
                )}

                {/* réservations — client seulement */}
                {user?.role === 'client' && (
                    <NavLink to="/reservations" style={getLinkStyle}>Mes réservations</NavLink>
                )}

                {/* lien gestion — coach et admin seulement */}
                {(user?.role === 'coach' || user?.role === 'admin') && (
                    <NavLink to="/gestion/services" style={getLinkStyle}>Gestion</NavLink>
                )}

                {/* admin — voir les messages / contact */}
                {user?.role === 'admin' ? (
                    <NavLink to="/admin/messages" style={getLinkStyle}>Voir les messages</NavLink>
                ) : (
                    <NavLink to="/contact" style={getLinkStyle}>Contact</NavLink>
                )}

                {/* lien gérer utilisateurs — admin seulement */}
                {user?.role === 'admin' && (
                    <NavLink to="/admin/users" style={getLinkStyle}>Gérer les utilisateurs</NavLink>
                )}

                {/* lien dashboard — admin seulement */}
                {user?.role === 'admin' && (
                    <NavLink to="/admin/dashboard" style={getLinkStyle}>Dashboard</NavLink>
                )}

                {/* si connecté — bouton déconnexion */}
                {isLoggedIn ? (
                    <button onClick={handleSignout} style={styles.buttonSignout}>
                        Déconnexion
                    </button>
                ) : (
                    <NavLink to="/login" style={styles.buttonLogin}>Connexion</NavLink>
                )}
            </div>
        </nav>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 2rem',
        backgroundColor: '#ffffff',
        borderBottom: '3px solid #f47c20',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    logo: {
        height: '60px',
        width: 'auto',
    },
    links: {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
    },
    buttonLogin: {
        color: '#1a2f5e',
        textDecoration: 'none',
        border: '1px solid #1a2f5e',
        padding: '0.4rem 1rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
    },
    buttonSignout: {
        backgroundColor: 'transparent',
        color: '#1a2f5e',
        border: '1px solid #1a2f5e',
        padding: '0.4rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.95rem',
    },
};

export default Navbar;
