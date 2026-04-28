import { useState, useEffect } from 'react';
import api from '../services/api';

interface Course {
    id: number;
    title: string;
    description: string;
    capacity: number;
    isActive: boolean;
    gifUrl: string;
}

interface Reservation {
    id: number;
    courseId: number;
    createdAt: string;
    course: Course; 
}

function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        
        api.get('/reservations/user')
            .then(res => setReservations(res.data))
            .catch(() => setError('Erreur lors du chargement des réservations'));
    }, []);

    const handleCancel = async (id: number) => {
        try {
            // DELETE
            await api.delete(`/reservations/${id}`);
            // retirer la réservation de la liste sans recharger
            setReservations(reservations.filter(r => r.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Mes réservations</h1>

            {error && <p style={styles.error}>{error}</p>}

            {/* si aucune réservation */}
            {reservations.length === 0 && !error && (
                <p style={styles.empty}>Vous n'avez aucune réservation pour le moment.</p>
            )}

            <div style={styles.grid}>
                {reservations.map(reservation => (
                    <div key={reservation.id} style={styles.card}>
                        {/* image du cours */}
                        {reservation.course.gifUrl && (
                            <img
                                src={reservation.course.gifUrl}
                                alt={reservation.course.title}
                                style={styles.gif}
                            />
                        )}

                        <div style={styles.cardBody}>
                            <h3 style={styles.cardTitle}>{reservation.course.title}</h3>
                            <p style={styles.cardText}>{reservation.course.description}</p>

                            {/* date de réservation */}
                            <p style={styles.date}>
                                Réservé le : {new Date(reservation.createdAt).toLocaleDateString('fr-CA')}
                            </p>

                            {/* bouton annuler */}
                            <button
                                onClick={() => handleCancel(reservation.id)}
                                style={styles.btnCancel}
                            >
                                Annuler la réservation
                            </button>
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