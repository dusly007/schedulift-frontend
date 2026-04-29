import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Course {
    id: number;
    title: string;
    description: string;
    gifUrl: string;
}

interface Reservation {
    id: number;
    userId: number;
    courseId: number;
    createdAt: string;
    course: Course;
}

function ReservationsPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
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

                        {/* image du cours */}
                        {reservation.course?.gifUrl && (
                            <img
                                src={reservation.course.gifUrl}
                                alt={reservation.course?.title}
                                style={styles.gif}
                            />
                        )}

                        <div style={styles.cardBody}>
                            <h3 style={styles.cardTitle}>{reservation.course?.title}</h3>
                            <p style={styles.cardText}>{reservation.course?.description}</p>

                            {/* afficher userId si admin */}
                            {user?.role === 'admin' && (
                                <p style={styles.infoItem}>Utilisateur #{reservation.userId}</p>
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
        width: '300px',
        overflow: 'hidden',
    },
    gif: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
    },
    cardBody: {
        padding: '1.5rem',
    },
    cardTitle: {
        color: '#1a2f5e',
        fontSize: '1.1rem',
        marginBottom: '0.5rem',
    },
    cardText: {
        color: '#666',
        fontSize: '0.9rem',
        marginBottom: '0.75rem',
    },
    infoItem: {
        color: '#1a2f5e',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    },
    date: {
        color: '#1a2f5e',
        fontSize: '0.85rem',
        fontWeight: '500',
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