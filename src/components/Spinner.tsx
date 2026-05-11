function Spinner() {
    return (
        <div style={styles.container}>
            <div style={styles.spinner}></div>
            <p style={styles.text}>Chargement...</p>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5rem 2rem',
        minHeight: '40vh',
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '5px solid #e0e0e0',
        borderTop: '5px solid #f47c20',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    text: {
        color: '#1a2f5e',
        marginTop: '1rem',
        fontSize: '0.95rem',
    },
};

export default Spinner;