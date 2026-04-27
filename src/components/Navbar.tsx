import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom'; 

function Navbar() {
    const { isLoggedIn, setUser } = useAuth(); //état de connexion
    const navigate = useNavigate();

    const handleSignout = async () => {
        // appel POST /auth/signout
        await api.post('/auth/signout');
        // déconnecté(maj)
        setUser(null);
        //vers connexion
        navigate('/login');
    };
    return (
        <nav style={styles.nav}>
            <Link to="/">
                <img src={logo} alt="Schedulift" style={styles.logo} />
            </Link>

            <div style={styles.links}>
                <Link to="/" style={styles.link}>Accueil</Link>
                <Link to="/courses" style={styles.link}>Cours</Link>
                <Link to="/contact" style={styles.link}>Contact</Link>
                {/* affiche réservations et déconnexion */}
                {isLoggedIn ? (
                    <>
                        <Link to="/reservations" style={styles.link}>Mes réservations</Link>
                        <button onClick={handleSignout} style={styles.buttonSignout}>
                            Déconnexion
                        </button>
                    </>
                ) : (
                    /* afficher connexion et inscription */
                    <>
                        <Link to="/login" style={styles.buttonLogin}>Connexion</Link>
                        <Link to="/signup" style={styles.buttonSignup}>Inscription</Link>
                    </>
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
    link: {
        color: '#1a2f5e',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    buttonLogin: {
        color: '#1a2f5e',
        textDecoration: 'none',
        border: '1px solid #1a2f5e',
        padding: '0.4rem 1rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
    },
    buttonSignup: {
        backgroundColor: '#f47c20',
        color: 'white',
        textDecoration: 'none',
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