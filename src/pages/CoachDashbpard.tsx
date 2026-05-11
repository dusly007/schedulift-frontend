import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';

function CoachDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // stats
    const [nbCoursActifs, setNbCoursActifs] = useState(0);
    const [nbCoursEnAttente, setNbCoursEnAttente] = useState(0);
    const [nbGroupes, setNbGroupes] = useState(0);
    const [nbGroupesEnAttente, setNbGroupesEnAttente] = useState(0);
    const [mesCours, setMesCours] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [coursRes, groupesRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/groupes'),
                ]);

                // filtrer par email du coach
                const tousCours = coursRes.data;
                const mesCoursFiltres = tousCours.filter((c: any) => c.coachName === user?.email);
                setMesCours(mesCoursFiltres);
                setNbCoursActifs(mesCoursFiltres.filter((c: any) => c.isActive).length);
                setNbCoursEnAttente(mesCoursFiltres.filter((c: any) => !c.isActive).length);

                // filtrer les groupes par email du coach
                const tousGroupes = groupesRes.data;
                const mesGroupesFiltres = tousGroupes.filter((g: any) => g.coachName === user?.email);
                setNbGroupes(mesGroupesFiltres.length);
                setNbGroupesEnAttente(mesGroupesFiltres.filter((g: any) => !g.estValide).length);

            } catch {
                // continuer même si une stat échoue
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (loading) return <Spinner />;

    return (
        <div style={styles.container}>
            {/* titre */}
            <h1 style={styles.title}>
                Bonjour, <span style={styles.accent}>{user?.email || 'Coach'}</span> 👋
            </h1>
            <p style={styles.subtitle}>Voici un aperçu de vos cours et groupes.</p>

            {/* stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <p style={styles.statNumber}>{nbCoursActifs}</p>
                    <p style={styles.statLabel}>Mes cours actifs</p>
                    <p style={styles.statDetail}>{nbCoursEnAttente} en attente de validation</p>
                </div>
                <div style={styles.statCard}>
                    <p style={styles.statNumber}>{nbGroupes}</p>
                    <p style={styles.statLabel}>Mes groupes</p>
                    <p style={styles.statDetail}>{nbGroupesEnAttente} en attente de validation</p>
                </div>
            </div>

            {/* raccourcis */}
            <h2 style={styles.sectionTitle}>Accès rapides</h2>
            <div style={styles.raccourcis}>
                <Link to="/gestion/cours" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>📚</span>
                    <p style={styles.raccourciLabel}>Mes cours</p>
                </Link>
                <Link to="/gestion/groupes" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>👥</span>
                    <p style={styles.raccourciLabel}>Mes groupes</p>
                </Link>
                <Link to="/gestion/services" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>🏋️</span>
                    <p style={styles.raccourciLabel}>Voir les services</p>
                </Link>
                <Link to="/contact" style={styles.raccourciCard}>
                    <span style={styles.raccourciIcon}>✉️</span>
                    <p style={styles.raccourciLabel}>Contacter l'admin</p>
                </Link>
            </div>

            {/* mes cours récents */}
            {mesCours.length > 0 && (
                <>
                    <h2 style={styles.sectionTitle}>Mes cours</h2>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Titre</th>
                                    <th style={styles.th}>Niveau</th>
                                    <th style={styles.th}>Prix</th>
                                    <th style={styles.th}>Statut</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mesCours.map(cours => (
                                    <tr key={cours.id} style={styles.tr}>
                                        <td style={styles.td}>{cours.title}</td>
                                        <td style={styles.td}>{cours.niveau || '—'}</td>
                                        <td style={styles.td}>{cours.prix ? `${cours.prix}$` : '—'}</td>
                                        <td style={styles.td}>
                                            <span style={cours.isActive ? styles.badgeActif : styles.badgeAttente}>
                                                {cours.isActive ? 'Actif' : 'En attente'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <Link
                                                to={`/gestion/groupes?courseId=${cours.id}`}
                                                style={styles.btnGroupes}
                                            >
                                                Groupes →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* message si aucun cours */}
            {mesCours.length === 0 && (
                <div style={styles.emptyBox}>
                    <p style={styles.emptyText}>Vous n'avez pas encore créé de cours.</p>
                    <Link to="/gestion/cours" style={styles.btnCreate}>
                        + Créer mon premier cours
                    </Link>
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '3rem 2rem',
        backgroundColor: '#f9f9f9',
        minHeight: '80vh',
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
        marginBottom: '3rem',
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
        border: '1px solid #eee',
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
    tableContainer: {
        overflowX: 'auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
    },
    tr: {
        borderBottom: '1px solid #eee',
    },
    td: {
        padding: '0.75rem 1rem',
        color: '#333',
        fontSize: '0.9rem',
        verticalAlign: 'middle',
    },
    badgeActif: {
        backgroundColor: '#e6f4ea',
        color: '#2d7a3a',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    badgeAttente: {
        backgroundColor: '#fff3e0',
        color: '#f47c20',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    btnGroupes: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        textDecoration: 'none',
    },
    emptyBox: {
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '3rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    emptyText: {
        color: '#666',
        fontSize: '1rem',
        marginBottom: '1.5rem',
    },
    btnCreate: {
        backgroundColor: '#f47c20',
        color: 'white',
        padding: '0.75rem 2rem',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
    },
};

export default CoachDashboard;