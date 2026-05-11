import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

interface Groupe {
    id: number;
    nom: string;
    horaire: string;
    dateDebut: string;
    dateFin: string;
    dureeEnSemaines: number;
    coachName: string;
    courseId: number;
    course?: { title: string; prix: number };
}

interface Reservation {
    id: number;
    userId: number;
    groupeId: number;
    createdAt: string;
    groupe: Groupe;
}

interface WaitList {
    id: number;
    userId: number;
    groupeId: number;
    createdAt: string;
    groupe: Groupe;
}

function ReservationsPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [waitlists, setWaitlists] = useState<WaitList[]>([]);
    const [positions, setPositions] = useState<{ [key: number]: { position: number; total: number; message: string } }>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // modal confirmation annulation réservation
    const [showConfirmId, setShowConfirmId] = useState<number | null>(null);

    // modal confirmation désinscription waitlist
    const [showConfirmWaitlistId, setShowConfirmWaitlistId] = useState<number | null>(null);

    useEffect(() => {
        // coach — pas de réservations à afficher
        if (user?.role === 'coach') {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // charger réservations
                const url = user?.role === 'admin' ? '/reservations' : '/reservations/user';
                const res = await api.get(url);
                setReservations(res.data);

                // charger waitlists — client seulement
                if (user?.role === 'client') {
                    const wlRes = await api.get('/wait-list/user');
                    setWaitlists(wlRes.data);
                    // charger position pour chaque groupe en attente
                    wlRes.data.forEach((wl: WaitList) => {
                        api.get(`/wait-list/position/${wl.groupeId}`)
                            .then(r => setPositions(prev => ({
                                ...prev,
                                [wl.groupeId]: r.data
                            })))
                            .catch(() => {});
                    });
                }
            } catch {
                setError('Erreur lors du chargement des réservations');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.role]);

    // confirmer annulation réservation
    const handleConfirmCancel = async (id: number) => {
        try {
            await api.delete(`/reservations/${id}`);
            setReservations(reservations.filter(r => r.id !== id));
            setShowConfirmId(null);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
            setShowConfirmId(null);
        }
    };

    // confirmer désinscription waitlist
    const handleConfirmWaitlist = async (id: number) => {
        try {
            await api.delete(`/wait-list/${id}`);
            setWaitlists(waitlists.filter(w => w.id !== id));
            setShowConfirmWaitlistId(null);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la désinscription');
            setShowConfirmWaitlistId(null);
        }
    };

    // afficher spinner pendant le chargement
    if (loading) return <Spinner />;

    // coach — afficher message et redirection vers cours
    if (user?.role === 'coach') {
        return (
            <div style={styles.container}>
                <div style={styles.coachMessage}>
                    <h1 style={styles.title}>Espace Coach</h1>
                    <p style={styles.empty}>
                        En tant que coach, vous gérez les cours plutôt que les réservations.
                    </p>
                    <Link to="/gestion/services" style={styles.btnPrimary}>
                        Aller à la gestion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* modal confirmation annulation réservation */}
            {showConfirmId !== null && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Confirmer l'annulation</h2>
                        <p style={styles.modalText}>
                            Voulez-vous vraiment annuler cette réservation ? Cette action est irréversible.
                        </p>
                        <div style={styles.modalButtons}>
                            <button
                                onClick={() => handleConfirmCancel(showConfirmId)}
                                style={styles.btnDanger}
                            >
                                Confirmer l'annulation
                            </button>
                            <button
                                onClick={() => setShowConfirmId(null)}
                                style={styles.btnSecondaire}
                            >
                                Garder la réservation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* modal confirmation désinscription waitlist */}
            {showConfirmWaitlistId !== null && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Se retirer de la liste d'attente</h2>
                        <p style={styles.modalText}>
                            Voulez-vous vraiment vous retirer de cette liste d'attente ? Vous perdrez votre position.
                        </p>
                        <div style={styles.modalButtons}>
                            <button
                                onClick={() => handleConfirmWaitlist(showConfirmWaitlistId)}
                                style={styles.btnDanger}
                            >
                                Confirmer
                            </button>
                            <button
                                onClick={() => setShowConfirmWaitlistId(null)}
                                style={styles.btnSecondaire}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* grille des réservations */}
            <div style={styles.grid}>
                {reservations.map(reservation => (
                    <div key={reservation.id} style={styles.card}>
                        <div style={styles.cardBody}>
                            {/* badge paiement confirmé */}
                            <div style={styles.badgePaye}>✓ Paiement confirmé</div>

                            {/* titre du cours */}
                            {reservation.groupe?.course?.title && (
                                <p style={styles.coursTitle}>
                                    {reservation.groupe.course.title}
                                </p>
                            )}

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
                                {/* prix payé */}
                                {reservation.groupe?.course?.prix && (
                                    <p style={styles.prixPaye}>💰 {reservation.groupe.course.prix}$ payé</p>
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

                            {/* bouton annuler avec modal — client seulement */}
                            {user?.role !== 'admin' && (
                                <button
                                    onClick={() => setShowConfirmId(reservation.id)}
                                    style={styles.btnCancel}
                                >
                                    Annuler la réservation
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* section liste d'attente — client seulement */}
            {user?.role === 'client' && (
                <div style={styles.waitlistSection}>
                    <h2 style={styles.sectionTitle}>Mes listes d'attente</h2>

                    {waitlists.length === 0 ? (
                        <p style={styles.empty}>Vous n'êtes sur aucune liste d'attente.</p>
                    ) : (
                        <div style={styles.grid}>
                            {waitlists.map(wl => (
                                <div key={wl.id} style={styles.cardWaitlist}>
                                    <div style={styles.cardBody}>
                                        {/* badge en attente */}
                                        <div style={styles.badgeAttente}>⏳ En attente</div>

                                        {/* titre du cours */}
                                        {wl.groupe?.course?.title && (
                                            <p style={styles.coursTitle}>
                                                {wl.groupe.course.title}
                                            </p>
                                        )}

                                        {/* nom du groupe */}
                                        <h3 style={styles.cardTitle}>
                                            {wl.groupe?.nom || `Groupe #${wl.groupeId}`}
                                        </h3>

                                        {/* infos du groupe */}
                                        <div style={styles.cardInfo}>
                                            {wl.groupe?.horaire && (
                                                <p style={styles.infoItem}>📅 {wl.groupe.horaire}</p>
                                            )}
                                            {wl.groupe?.dateDebut && (
                                                <p style={styles.infoItem}>
                                                    Du {new Date(wl.groupe.dateDebut).toLocaleDateString('fr-CA')} au {new Date(wl.groupe.dateFin).toLocaleDateString('fr-CA')}
                                                </p>
                                            )}
                                            {wl.groupe?.coachName && (
                                                <p style={styles.infoItem}>Coach : {wl.groupe.coachName}</p>
                                            )}
                                        </div>

                                        {/* position dans la liste */}
                                        {positions[wl.groupeId] && (
                                            <div style={styles.positionBox}>
                                                <p style={styles.positionText}>
                                                    {positions[wl.groupeId].message}
                                                </p>
                                            </div>
                                        )}

                                        {/* date d'inscription */}
                                        <p style={styles.date}>
                                            Inscrit le : {new Date(wl.createdAt).toLocaleDateString('fr-CA')}
                                        </p>

                                        {/* bouton se retirer */}
                                        <button
                                            onClick={() => setShowConfirmWaitlistId(wl.id)}
                                            style={styles.btnRetirer}
                                        >
                                            Se retirer de la liste
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
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
    sectionTitle: {
        color: '#1a2f5e',
        fontSize: '1.5rem',
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
    btnPrimary: {
        backgroundColor: '#f47c20',
        color: 'white',
        padding: '0.75rem 2rem',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
    },
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
        border: '2px solid #e6f4ea',
    },
    cardWaitlist: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '320px',
        overflow: 'hidden',
        border: '2px solid #fff3e0',
    },
    cardBody: {
        padding: '1.5rem',
    },
    badgePaye: {
        backgroundColor: '#e6f4ea',
        color: '#2d7a3a',
        padding: '0.3rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        display: 'inline-block',
        marginBottom: '0.75rem',
    },
    badgeAttente: {
        backgroundColor: '#fff3e0',
        color: '#f47c20',
        padding: '0.3rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        display: 'inline-block',
        marginBottom: '0.75rem',
    },
    coursTitle: {
        color: '#f47c20',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        marginBottom: '0.3rem',
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
    prixPaye: {
        color: '#2d7a3a',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        margin: '0.3rem 0',
    },
    positionBox: {
        backgroundColor: '#fff3e0',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        border: '1px solid #f47c20',
    },
    positionText: {
        color: '#f47c20',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 0,
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
    btnRetirer: {
        width: '100%',
        backgroundColor: 'transparent',
        color: '#cc0000',
        border: '1px solid #cc0000',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        cursor: 'pointer',
    },
    waitlistSection: {
        marginTop: '4rem',
    },
};

export default ReservationsPage;