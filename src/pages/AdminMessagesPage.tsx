import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // modal confirmation suppression
    const [showConfirmId, setShowConfirmId] = useState<number | null>(null);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/contact');
            setMessages(res.data);
        } catch {
            setError('Accès refusé ou erreur serveur.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleConfirmDelete = async (id: number) => {
        try {
            await api.delete(`/contact/${id}`);
            setMessages(messages.filter(m => m.id !== id));
            setShowConfirmId(null);
        } catch {
            setError('Erreur lors de la suppression.');
            setShowConfirmId(null);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div style={styles.container}>
            {/* modal confirmation suppression */}
            {showConfirmId !== null && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Supprimer le message</h2>
                        <p style={styles.modalText}>
                            Voulez-vous vraiment supprimer ce message ? Cette action est irréversible.
                        </p>
                        <div style={styles.modalButtons}>
                            <button
                                onClick={() => handleConfirmDelete(showConfirmId)}
                                style={styles.btnDanger}
                            >
                                Confirmer la suppression
                            </button>
                            <button
                                onClick={() => setShowConfirmId(null)}
                                style={styles.btnSecondaire}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 style={styles.title}>Messages reçus</h1>

            {/* erreur */}
            {error && <p style={styles.error}>{error}</p>}

            {/* aucun message */}
            {messages.length === 0 && !error && (
                <p style={styles.empty}>Aucun message pour le moment.</p>
            )}

            {/* liste des messages */}
            <div style={styles.grid}>
                {messages.map(msg => (
                    <div key={msg.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div>
                                <p style={styles.name}>{msg.name}</p>
                                <p style={styles.email}>{msg.email}</p>
                            </div>
                            <span style={styles.date}>
                                {new Date(msg.createdAt).toLocaleDateString('fr-CA')}
                            </span>
                        </div>
                        <p style={styles.message}>{msg.message}</p>
                        <button
                            onClick={() => setShowConfirmId(msg.id)}
                            style={styles.btnDelete}
                        >
                            Supprimer
                        </button>
                    </div>
                ))}
            </div>
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
        textAlign: 'center',
        marginBottom: '2rem',
    },
    error: {
        backgroundColor: '#ffe0e0',
        color: '#cc0000',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    empty: {
        textAlign: 'center',
        color: '#666',
        fontSize: '1rem',
        marginTop: '2rem',
    },
    // fond sombre derrière le modal
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    modal: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
    modalTitle: {
        color: '#1a2f5e',
        fontSize: '1.3rem',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    modalText: {
        color: '#666',
        fontSize: '0.95rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
    },
    modalButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    btnDanger: {
        width: '100%',
        backgroundColor: '#cc0000',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    btnSecondaire: {
        width: '100%',
        backgroundColor: 'transparent',
        color: '#1a2f5e',
        border: '1px solid #1a2f5e',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        cursor: 'pointer',
    },
    grid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '800px',
        margin: '0 auto',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        borderLeft: '4px solid #f47c20',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
    },
    name: {
        color: '#1a2f5e',
        fontWeight: 'bold',
        fontSize: '1rem',
        margin: 0,
    },
    email: {
        color: '#f47c20',
        fontSize: '0.85rem',
        margin: '0.2rem 0 0 0',
    },
    date: {
        color: '#999',
        fontSize: '0.8rem',
        whiteSpace: 'nowrap',
    },
    message: {
        color: '#444',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        marginBottom: '1.5rem',
        backgroundColor: '#f9f9f9',
        padding: '1rem',
        borderRadius: '4px',
        border: '1px solid #eee',
    },
    btnDelete: {
        backgroundColor: 'transparent',
        color: '#cc0000',
        border: '1px solid #cc0000',
        padding: '0.5rem 1.25rem',
        borderRadius: '4px',
        fontSize: '0.9rem',
        cursor: 'pointer',
    },
};