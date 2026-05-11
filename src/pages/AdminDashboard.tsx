import AdminNotifications from '../components/AdminNotification';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';

function AdminDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // stats
    const [nbUsers, setNbUsers] = useState(0);
    const [nbClients, setNbClients] = useState(0);
    const [nbCoachs, setNbCoachs] = useState(0);
    const [nbCoursActifs, setNbCoursActifs] = useState(0);
    const [nbCoursInactifs, setNbCoursInactifs] = useState(0);
    const [nbGroupesEnAttente, setNbGroupesEnAttente] = useState(0);
    const [nbMessages, setNbMessages] = useState(0);
    const [nbReservations, setNbReservations] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, coursRes, groupesRes, messagesRes, reservationsRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/courses'),
                    api.get('/groupes'),
                    api.get('/contact'),
                    api.get('/reservations'),
                ]);

                // stats utilisateurs
                const users = usersRes.data;
                setNbUsers(users.length);
                setNbClients(users.filter((u: any) => u.role === 'client').length);
                setNbCoachs(users.filter((u: any) => u.role === 'coach').length);

                // stats cours
                const cours = coursRes.data;
                setNbCoursActifs(cours.filter((c: any) => c.isActive).length);
                setNbCoursInactifs(cours.filter((c: any) => !c.isActive).length);

                // stats groupes en attente de validation
                const groupes = groupesRes.data;
                setNbGroupesEnAttente(groupes.filter((g: any) => !g.estValide).length);

                // stats messages
                setNbMessages(messagesRes.data.length);

                // stats réservations
                setNbReservations(reservationsRes.data.length);

            } catch {
                // continuer même si une stat échoue
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <Spinner />;

    return (
        <div style={styles.container}>
            {/* titre */}
            <h1 style={styles.title}>
                Bonjour, <span style={styles.accent}>{user?.email || 'Admin'}</span> 
            </h1>
            <p style={styles.subtitle}>Voici un aperçu de l'état du système.</p>

            {/* grille de stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <p style={styles.statNumber}>{nbUsers}</p>
                    <p style={styles.statLabel}>Utilisateurs total</p>
                    <p style={styles.statDetail}>{nbClients} clients · {nbCoachs} coachs</p>
                </div>
                <div style={styles.statCard}>
                    <p style={styles.statNumber}>{nbCoursActifs}</p>
                    <p style={styles.statLabel}>Cours actifs</p>
                    <p style={styles.statDetail}>{nbCoursInactifs} inactifs</p>
                </div>
                <div style={{ ...styles.statCard, ...(nbGroupesEnAttente > 0 ? styles.statCardWarning : {}) }}>
                    <p style={styles.statNumber}>{nbGroupesEnAttente}</p>
                    <p style={styles.statLabel}>Groupes en attente</p>
                    <p style={styles.statDetail}>À valider</p>
                </div>
                <div style={{ ...styles.statCard, ...(nbMessages > 0 ? styles.statCardWarning : {}) }}>
                    <p style={styles.statNumber}>{nbMessages}</p>
                    <p style={styles.statLabel}>Messages reçus</p>
                    <p style={styles.statDetail}>Non lus</p>
                </div>
                <div style={styles.statCard}>
                    <p style={styles.statNumber}>{nbReservations}</p>
                    <p style={styles.statLabel}>Réservations totales</p>
                    <p style={styles.statDetail}>Tous clients confondus</p>
                </div>
            </div>
            
            {/* notifications admin */}
            <AdminNotifications />

            {/* raccourcis */}
            <h2 style={styles.sectionTitle}>Accès rapides</h2>
            <div style={styles.raccourcis}>
                <Link to="/gestion/groupes" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>📋</span>
                    <p style={styles.raccourciLabel}>Valider les groupes</p>
                    {nbGroupesEnAttente > 0 && (
                        <span style={styles.badge}>{nbGroupesEnAttente}</span>
                    )}
                </Link>
                <Link to="/admin/messages" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>✉️</span>
                    <p style={styles.raccourciLabel}>Voir les messages</p>
                    {nbMessages > 0 && (
                        <span style={styles.badge}>{nbMessages}</span>
                    )}
                </Link>
                <Link to="/admin/users" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>👥</span>
                    <p style={styles.raccourciLabel}>Gérer les utilisateurs</p>
                </Link>
                <Link to="/gestion/cours" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>📚</span>
                    <p style={styles.raccourciLabel}>Gérer les cours</p>
                </Link>
                <Link to="/gestion/services" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>🏋️</span>
                    <p style={styles.raccourciLabel}>Gérer les services</p>
                </Link>
                <Link to="/reservations" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>📅</span>
                    <p style={styles.raccourciLabel}>Voir les réservations</p>
                </Link>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        marginTop: '2rem',
        marginBottom: '3rem',
        width: '100%',
    },
    title: {
        color: '#1a2f5e',
        fontSize: '2rem',
        marginBottom: '0.5rem',
    },
    accent: {
        color: '#f47c20',
    },
    subtitle: {
        color: '#666',
        fontSize: '1rem',
        marginBottom: '2.5rem',
    },
    statsGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '3rem',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        padding: '1.5rem 2rem',
        minWidth: '180px',
        flex: 1,
        borderTop: '4px solid #1a2f5e',
    },
    statCardWarning: {
        borderTop: '4px solid #f47c20',
    },
    statNumber: {
        color: '#1a2f5e',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        margin: 0,
    },
    statLabel: {
        color: '#444',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        margin: '0.3rem 0',
    },
    statDetail: {
        color: '#999',
        fontSize: '0.8rem',
        margin: 0,
    },
    sectionTitle: {
        color: '#1a2f5e',
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
    },
    raccourcis: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    raccourciCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        padding: '1.5rem',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        minWidth: '140px',
        flex: 1,
        position: 'relative',
        border: '1px solid #eee',
        transition: 'box-shadow 0.2s',
    },
    raccourciIcon: {
        fontSize: '2rem',
    },
    raccourciLabel: {
        color: '#1a2f5e',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 0,
    },
    badge: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        backgroundColor: '#f47c20',
        color: 'white',
        borderRadius: '50%',
        width: '22px',
        height: '22px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

export default AdminDashboard;