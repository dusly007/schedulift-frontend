import { Link } from 'react-router-dom';

function HomePage() {
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
                        <Link to="/signup" style={styles.btnSecondary}>S'inscrire gratuitement</Link>
                    </div>
                </div>
            </section>

            {/* Section services */}
            <section style={styles.services}>
                <h2 style={styles.sectionTitle}>Nos services</h2>
                <div style={styles.cards}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Musculation</h3>
                        <p style={styles.cardText}>Des cours adaptés à tous les niveaux pour développer votre force.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Yoga & Étirements</h3>
                        <p style={styles.cardText}>Améliorez votre flexibilité et votre bien-être mental.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Cardio Intensif</h3>
                        <p style={styles.cardText}>Brûlez des calories et améliorez votre endurance cardiovasculaire.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Pilates</h3>
                        <p style={styles.cardText}>Renforcez votre corps en douceur et améliorez votre posture.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Musculation — Dos</h3>
                        <p style={styles.cardText}>Renforcement musculaire du dos et des lombaires.</p>
                    </div>
                </div>
            </section>

            {/* Section CTA */}
            <section style={styles.cta}>
                <h2 style={styles.ctaTitle}>Prêt à commencer ?</h2>
                <p style={styles.ctaText}>Rejoignez des centaines de membres et transformez votre corps.</p>
                <Link to="/signup" style={styles.btnPrimary}>Créer un compte</Link>
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