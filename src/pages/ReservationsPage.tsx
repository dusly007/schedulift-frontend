import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

interface Groupe {
    id: number;
    nom: string;
    horaire: string;
    dateDebut: string;
    dateFin: string;
    dureeEnSemaines: number;
    coachName: string;
}

interface Reservation {
    id: number;
    userId: number;
    groupeId: number;
    createdAt: string;
    groupe: Groupe;
}

function ReservationsPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // coach — pas de réservations à afficher
        if (user?.role === 'coach') return;

        // si admin — voir toutes les réservations
        // sinon — voir seulement les siennes
        const url = user?.role === 'admin' ? '/reservations' : '/reservations/user';
        api.get(url)
            .then(res => setReservations(res.data))
            .catch(() => setError('Erreur lors du chargement des réservations'));
    }, [user?.role]);

    const handleCancel = async (id: number) => {
        try {
            // appel DELETE /reservations/:id
            await api.delete(`/reservations/${id}`);
            // retirer la réservation de la liste sans recharger
            setReservations(reservations.filter(r => r.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
        }
    };

    // coach — afficher message et redirection vers cours
    if (user?.role === 'coach') {
        return (
            <div style={styles.container}>
                <div style={styles.coachMessage}>
                    <h1 style={styles.title}>Espace Coach</h1>
                    <p style={styles.empty}>
                        En tant que coach, vous gérez les cours plutôt que les réservations.
                    </p>
                    <Link to="/services" style={styles.btnCours}>
                        Gérer les cours
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* titre différent selon le rôle */}
            <h1 style={styles.title}>
                {user?.role === 'admin' ? 'Toutes les réservations' : 'Mes réservations'}
            </h1>

            {/* message d'erreur */}
            {error && <p style={styles.error}>{error}</p>}

            {/* message si aucune réservation */}
            {reservations.length === 0 && !error && (
                <p style={styles.empty}>Aucune réservation pour le moment.</p>
            )}

            <div style={styles.grid}>
                {reservations.map(reservation => (
                    <div key={reservation.id} style={styles.card}>
                        <div style={styles.cardBody}>
                            {/* nom du groupe */}
                            <h3 style={styles.cardTitle}>
                                {reservation.groupe?.nom || `Groupe #${reservation.groupeId}`}
                            </h3>

                            {/* infos du groupe */}
                            <div style={styles.cardInfo}>
                                {reservation.groupe?.horaire && (
                                    <p style={styles.infoItem}>📅 {reservation.groupe.horaire}</p>
                                )}
                                {reservation.groupe?.dateDebut && (
                                    <p style={styles.infoItem}>
                                        Du {new Date(reservation.groupe.dateDebut).toLocaleDateString('fr-CA')} au {new Date(reservation.groupe.dateFin).toLocaleDateString('fr-CA')}
                                    </p>
                                )}
                                {reservation.groupe?.dureeEnSemaines && (
                                    <p style={styles.infoItem}>⏱ {reservation.groupe.dureeEnSemaines} semaines</p>
                                )}
                                {reservation.groupe?.coachName && (
                                    <p style={styles.infoItem}>Coach : {reservation.groupe.coachName}</p>
                                )}
                            </div>

                            {/* afficher userId si admin */}
                            {user?.role === 'admin' && (
                                <p style={styles.adminInfo}>Utilisateur #{reservation.userId}</p>
                            )}

                            {/* date de réservation */}
                            <p style={styles.date}>
                                Réservé le : {new Date(reservation.createdAt).toLocaleDateString('fr-CA')}
                            </p>

                            {/* bouton annuler — client seulement */}
                            {user?.role !== 'admin' && (
                                <button
                                    onClick={() => handleCancel(reservation.id)}
                                    style={styles.btnCancel}
                                >
                                    Annuler la réservation
                                </button>
                            )}
                        </div>
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
    coachMessage: {
        textAlign: 'center',
        marginTop: '5rem',
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
        marginBottom: '2rem',
    },
    btnCours: {
        backgroundColor: '#f47c20',
        color: 'white',
        padding: '0.75rem 2rem',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '320px',
        overflow: 'hidden',
    },
    cardBody: {
        padding: '1.5rem',
    },
    cardTitle: {
        color: '#1a2f5e',
        fontSize: '1.1rem',
        marginBottom: '1rem',
    },
    cardInfo: {
        marginBottom: '1rem',
    },
    infoItem: {
        color: '#1a2f5e',
        fontSize: '0.85rem',
        fontWeight: '500',
        margin: '0.3rem 0',
    },
    adminInfo: {
        color: '#666',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    },
    date: {
        color: '#999',
        fontSize: '0.8rem',
        marginBottom: '1rem',
    },
    btnCancel: {
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
};

export default ReservationsPage;