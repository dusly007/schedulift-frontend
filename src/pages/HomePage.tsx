import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
    const { isLoggedIn, user } = useAuth();

    return (
        <div>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>
                        Bienvenue chez <span style={styles.accent}>Schedulift</span>
                    </h1>
                    <p style={styles.heroSubtitle}>
                        Réservez vos cours de gym en ligne, gérez vos séances et atteignez vos objectifs.
                    </p>
                    <div style={styles.heroButtons}>
                        <Link to="/courses" style={styles.btnPrimary}>Voir les cours</Link>
                        {/* bouton inscription visible seulement si non connecté */}
                        {!isLoggedIn && (
                            <Link to="/signup" style={styles.btnSecondary}>S'inscrire gratuitement</Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Section services — cohérent avec le seeder backend */}
            <section style={styles.services}>
                <h2 style={styles.sectionTitle}>Nos services</h2>
                <div style={styles.cards}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Musculation — Poitrine</h3>
                        <p style={styles.cardText}>Cours ciblé sur les pectoraux.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Cardio Intensif</h3>
                        <p style={styles.cardText}>Séance cardio pour brûler des calories.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Yoga & Étirements</h3>
                        <p style={styles.cardText}>Yoga axé sur le tronc et la flexibilité.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Musculation — Dos</h3>
                        <p style={styles.cardText}>Renforcement du dos et des lombaires.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Pilates</h3>
                        <p style={styles.cardText}>Pilates centré sur les jambes.</p>
                    </div>
                </div>
            </section>

            {/* Section CTA — différente selon connexion */}
            <section style={styles.cta}>
                {!isLoggedIn ? (
                    // non connecté → s'inscrire
                    <>
                        <h2 style={styles.ctaTitle}>Prêt à commencer ?</h2>
                        <p style={styles.ctaText}>Rejoignez des centaines de membres et transformez votre corps.</p>
                        <Link to="/signup" style={styles.btnPrimary}>Créer un compte</Link>
                    </>
                ) : user?.role === 'admin' ? (
                    // admin → tableau de bord
                    <>
                        <h2 style={styles.ctaTitle}>Tableau de bord Admin</h2>
                        <p style={styles.ctaText}>Gérez les cours, les utilisateurs et les messages.</p>
                        <div style={styles.heroButtons}>
                            <Link to="/courses" style={styles.btnPrimary}>Gérer les cours</Link>
                            <Link to="/admin/users" style={styles.btnSecondary}>Gérer les utilisateurs</Link>
                            <Link to="/admin/reservations" style={styles.btnSecondary}>Voir les réservations</Link>
                            <Link to="/admin/contact" style={styles.btnSecondary}>Voir les messages</Link>
                        </div>
                    </>
                ) : user?.role === 'coach' ? (
                    // coach → gérer les cours
                    <>
                        <h2 style={styles.ctaTitle}>Bon retour !</h2>
                        <p style={styles.ctaText}>Gérez vos cours et créez de nouvelles séances.</p>
                        <div style={styles.heroButtons}>
                            <Link to="/courses" style={styles.btnPrimary}>Voir les cours</Link>
                        </div>
                    </>
                ) : (
                    // client connecté → voir les cours
                    <>
                        <h2 style={styles.ctaTitle}>Bon retour !</h2>
                        <p style={styles.ctaText}>Consultez les cours disponibles et réservez votre prochaine séance.</p>
                        <Link to="/courses" style={styles.btnPrimary}>Voir les cours</Link>
                    </>
                )}
            </section>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    hero: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        padding: '5rem 2rem',
        textAlign: 'center',
    },
    heroContent: {
        maxWidth: '700px',
        margin: '0 auto',
    },
    heroTitle: {
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
    },
    accent: {
        color: '#f47c20',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        marginBottom: '2rem',
        opacity: 0.9,
    },
    heroButtons: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    btnPrimary: {
        backgroundColor: '#f47c20',
        color: 'white',
        padding: '0.75rem 2rem',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
    },
    btnSecondary: {
        backgroundColor: 'transparent',
        color: 'white',
        padding: '0.75rem 2rem',
        borderRadius: '4px',
        textDecoration: 'none',
        border: '2px solid white',
        fontSize: '1rem',
    },
    services: {
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
    },
    sectionTitle: {
        fontSize: '2rem',
        color: '#1a2f5e',
        marginBottom: '2rem',
    },
    cards: {
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    card: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '200px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    cardTitle: {
        fontSize: '1.2rem',
        color: '#1a2f5e',
        marginBottom: '0.5rem',
    },
    cardText: {
        color: '#666',
        fontSize: '0.95rem',
    },
    cta: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
    },
    ctaTitle: {
        fontSize: '2rem',
        marginBottom: '1rem',
    },
    ctaText: {
        fontSize: '1.1rem',
        marginBottom: '2rem',
        opacity: 0.9,
    },
};

export default HomePage;
