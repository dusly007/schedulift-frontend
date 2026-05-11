import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const searchParams = new URLSearchParams(location.search);
    const courseId = searchParams.get('courseId');
    const groupeId = searchParams.get('groupeId');

    // montant récupéré depuis le cours
    const [amount, setAmount] = useState<number>(0);
    const [courseTitre, setCourseTitre] = useState('');

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        expiration: '',
        cvv: '',
    });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // charger le prix du cours depuis le backend
        if (courseId) {
            api.get(`/courses/${courseId}`)
                .then(res => {
                    setAmount(res.data.prix || 0);
                    setCourseTitre(res.data.title || '');
                })
                .catch(() => setStatus('Erreur lors du chargement du cours'));
        }
    }, [courseId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!courseId || !groupeId) {
            setStatus('CourseId ou GroupeId manquant');
            return;
        }

        if (!user) {
            setStatus('Utilisateur non connecté');
            return;
        }

        setLoading(true);
        try {
            // envoyer paiement — le backend crée la réservation automatiquement
            await api.post('/payment', {
                groupeId: parseInt(groupeId),
                amount,
                expiration: paymentInfo.expiration,
                cardNumber: paymentInfo.cardNumber,
                cvv: paymentInfo.cvv,
            });

            setStatus('Paiement effectué avec succès !');

            // rediriger vers mes réservations après succès
            setTimeout(() => {
                navigate('/reservations', { replace: true });
            }, 1500);
        } catch (err: any) {
            setStatus(err.response?.data?.message || 'Erreur paiement');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement utilisateur...</p>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Paiement</h2>

                {/* infos du cours */}
                {courseTitre && (
                    <div style={styles.infoBox}>
                        <p style={styles.infoText}>Cours : <strong>{courseTitre}</strong></p>
                        <p style={styles.infoText}>Montant : <strong>{amount}$</strong></p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Numéro de carte</label>
                        <input
                            name="cardNumber"
                            type="text"
                            value={paymentInfo.cardNumber}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="1234 5678 9012 3456"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Date d'expiration</label>
                        <input
                            name="expiration"
                            type="date"
                            value={paymentInfo.expiration}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>CVV</label>
                        <input
                            name="cvv"
                            type="text"
                            value={paymentInfo.cvv}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="123"
                            maxLength={3}
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Montant</label>
                        <input
                            type="number"
                            value={amount}
                            readOnly
                            style={{ ...styles.input, backgroundColor: '#f9f9f9', color: '#666' }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={loading ? styles.btnLoading : styles.btn}
                        disabled={loading}
                    >
                        {loading ? 'Traitement...' : `Payer ${amount}$`}
                    </button>
                </form>

                {/* message statut */}
                {status && (
                    <p style={{
                        ...styles.status,
                        color: status.includes('succès') ? '#2d7a3a' : '#cc0000',
                        backgroundColor: status.includes('succès') ? '#e6f4ea' : '#ffe0e0',
                    }}>
                        {status}
                    </p>
                )}

                {/* bouton annuler */}
                <button
                    onClick={() => navigate(-1)}
                    style={styles.btnAnnuler}
                >
                    Annuler
                </button>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: '2rem',
    },
    card: {
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
        textAlign: 'center',
        marginBottom: '1.5rem',
    },
    infoBox: {
        backgroundColor: '#f9f9f9',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        border: '1px solid #ddd',
    },
    infoText: {
        color: '#1a2f5e',
        fontSize: '0.95rem',
        margin: '0.3rem 0',
    },
    field: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        color: '#1a2f5e',
        fontWeight: 'bold',
        marginBottom: '0.4rem',
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
    btn: {
        width: '100%',
        backgroundColor: '#f47c20',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '0.5rem',
    },
    btnLoading: {
        width: '100%',
        backgroundColor: '#ccc',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'not-allowed',
        marginTop: '0.5rem',
    },
    btnAnnuler: {
        width: '100%',
        backgroundColor: 'transparent',
        color: '#1a2f5e',
        border: '1px solid #1a2f5e',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '0.75rem',
    },
    status: {
        padding: '0.75rem',
        borderRadius: '4px',
        textAlign: 'center',
        marginTop: '1rem',
        fontSize: '0.95rem',
        fontWeight: 'bold',
    },
};