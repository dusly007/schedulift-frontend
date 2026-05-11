import logo from '../assets/logo.png';

function Footer() {
    return (
        <footer style={styles.footer}>
            <div style={styles.content}>

                {/* logo + slogan */}
                <div style={styles.brand}>
                    <img src={logo} alt="Schedulift" style={styles.logo} />
                    <p style={styles.slogan}>
                        Réservez vos cours de gym en ligne, simplement.
                    </p>
                </div>

            </div>

            {/* bas du footer */}
            <div style={styles.bottom}>
                <p style={styles.copyright}>© 2025 Schedulift — Tous droits réservés</p>
            </div>
        </footer>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    footer: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        marginTop: 'auto',
    },
    content: {
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem',
    },
    brand: {
        textAlign: 'center',
    },
    logo: {
        height: '50px',
        width: 'auto',
        marginBottom: '1rem',
        filter: 'brightness(0) invert(1)',
    },
    slogan: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.9rem',
        margin: 0,
    },
    bottom: {
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem 2rem',
        textAlign: 'center',
    },
    copyright: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.8rem',
        margin: 0,
    },
};

export default Footer;