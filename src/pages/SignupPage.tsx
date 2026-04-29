import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function SignupPage() {
    const navigate = useNavigate(); //redirection
    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [dateNaissance, setDateNaissance] = useState('');
    const [sexe, setSexe] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); //empeche rechargement
        setError(''); // reset error
        
        try {
            await api.post('/auth/signup', { 
                prenom,
                nom,
                dateNaissance,
                sexe,
                email,
                password,
                role: 'client' });

            navigate('/login');
        } catch (err: any) {
            const backendMessage = err.response?.data?.message;

            if (backendMessage === 'email in use') {
                setError('Ce courriel est déjà utilisé.');
            } else if (backendMessage) {
                setError(backendMessage);
            } else {
                setError("Erreur lors de l'inscription.");
            }
        } finally {
            
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.form}>
                <h1 style={styles.title}>Inscription</h1>

                <p style={styles.subtitle}>
                    Déjà membre ? <Link to="/login" style={styles.link}>Se connecter</Link>
                </p>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Prénom</label>
                        <input
                            type="text"
                            value={prenom}
                            onChange={e => setPrenom(e.target.value)}
                            style={styles.input}
                            placeholder="Entrez votre prénom"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Nom</label>
                        <input
                            type="text"
                            value={nom}
                            onChange={e => setNom(e.target.value)}
                            style={styles.input}
                            placeholder="Entrez votre nom"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Date de naissance</label>
                        <input
                            type="date"
                            value={dateNaissance}
                            onChange={e => setDateNaissance(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Sexe</label>
                        <select
                            value={sexe}
                            onChange={e => setSexe(e.target.value)}
                            style={styles.input}
                            required
                        >
                            <option value="">Sélectionnez une option</option>
                            <option value="homme">Homme</option>
                            <option value="femme">Femme</option>
                            <option value="autre">Autre</option>
                        </select>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Courriel</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="exemple@email.com"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Créez un mot de passe"
                            required
                        />
                    </div>

                    <button type="submit" style={styles.button}>
                        Inscription
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: '2rem',
    },
    form: {
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px',
    },
    title: {
        color: '#1a2f5e',
        fontSize: '1.8rem',
        marginBottom: '0.5rem',
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        marginBottom: '2rem',
        fontSize: '0.95rem',
    },
    link: {
        color: '#f47c20',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
    error: {
        backgroundColor: '#ffe0e0',
        color: '#cc0000',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
        textAlign: 'center',
    },
    field: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        color: '#1a2f5e',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        fontSize: '0.95rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        backgroundColor: '#f47c20',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};
export default SignupPage;