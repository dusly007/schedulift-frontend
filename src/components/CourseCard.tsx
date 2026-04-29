import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Course {
    id: number;
    title: string;
    description: string;
    capacity: number;
    isActive: boolean;
    gifUrl: string;
    coachName: string;
    bodyPart: string;
}

interface Props {
    course: Course;
}

function CourseCard({ course }: Props) {
    const { isLoggedIn, user } = useAuth();
    // places restantes
    const [placesRestantes, setPlacesRestantes] = useState<number | null>(null);
    // état  isActive 
    const [isActive, setIsActive] = useState(course.isActive);
    // état liste d'attente — visible par admin
    const [waitlist, setWaitlist] = useState<any[]>([]);
    //  coach et admin
    const [isEditing, setIsEditing] = useState(false);
    // valeurs formulaire édition
    const [editTitle, setEditTitle] = useState(course.title);
    const [editDescription, setEditDescription] = useState(course.description);
    const [editCapacity, setEditCapacity] = useState(course.capacity);

    useEffect(() => {
        api.get(`/reservations/places/${course.id}`)
            .then(res => setPlacesRestantes(res.data.placesRestantes))
            .catch(() => setPlacesRestantes(null));

        // si admin charge liste d'attente
        if (user?.role === 'admin') {
            api.get(`/wait-list/course/${course.id}`)
                .then(res => setWaitlist(res.data))
                .catch(() => setWaitlist([]));
        }
    }, [course.id, user?.role]);

    const handleReserver = async () => {
        try {
            await api.post('/reservations', { courseId: course.id });
            // places restantes après réservation
            setPlacesRestantes(prev => prev !== null ? prev - 1 : null);
            alert('Réservation effectuée avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la réservation');
        }
    };

    const handleWaitlist = async () => {
        try {
            await api.post('/wait-list', { courseId: course.id });
            alert('Inscrit sur la liste d\'attente !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de l\'inscription');
        }
    };

    // activer ou désactiver le cours — admin seulement
    const handleToggle = async () => {
        try {
            await api.patch(`/courses/${course.id}/toggle`);
            setIsActive(prev => !prev);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    // supprimer cours
    const handleDelete = async () => {
        if (!confirm('Voulez-vous vraiment supprimer ce cours ?')) return;
        try {
            await api.delete(`/courses/${course.id}`);
            alert('Cours supprimé avec succès !');
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    // modifier cours — coach et admin
    const handleEdit = async () => {
        try {
            await api.patch(`/courses/${course.id}`, {
                title: editTitle,
                description: editDescription,
                capacity: editCapacity,
            });
            setIsEditing(false);
            alert('Cours modifié avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la modification');
        }
    };

    return (
        <div style={styles.card}>
            {/* image du cours */}
            {course.gifUrl && (
                <img
                    src={course.gifUrl}
                    alt={course.title}
                    style={styles.gif}
                />
            )}

            <div style={styles.cardBody}>

                {/* mode édition — coach et admin */}
                {isEditing ? (
                    <div>
                        <input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            style={styles.input}
                            placeholder="Titre"
                        />
                        <input
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            style={styles.input}
                            placeholder="Description"
                        />
                        <input
                            type="number"
                            value={editCapacity}
                            onChange={e => setEditCapacity(parseInt(e.target.value))}
                            style={styles.input}
                            placeholder="Capacité"
                        />
                        <div style={styles.buttons}>
                            {/* sauvegarder */}
                            <button onClick={handleEdit} style={styles.btnActiver}>
                                Sauvegarder
                            </button>
                            {/* annuler édition */}
                            <button onClick={() => setIsEditing(false)} style={styles.btnWaitlist}>
                                Annuler
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* titre + disponibilité */}
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>{editTitle}</h3>
                            <span style={isActive ? styles.badgeActive : styles.badgeInactive}>
                                {isActive ? 'Disponible' : 'Indisponible'}
                            </span>
                        </div>

                        {/* description */}
                        <p style={styles.cardText}>{editDescription}</p>

                        {/* infos du cours */}
                        <div style={styles.cardInfo}>
                            <span style={styles.infoItem}>
                                Places restantes : {placesRestantes !== null ? `${placesRestantes}/${editCapacity}` : '...'}
                            </span>
                            {course.bodyPart && (
                                <span style={styles.infoItem}>Zone : {course.bodyPart}</span>
                            )}
                            {course.coachName && (
                                <span style={styles.infoItem}>Coach : {course.coachName}</span>
                            )}
                        </div>

                        {/* liste d'attente — seulement admin */}
                        {user?.role === 'admin' && waitlist.length > 0 && (
                            <div style={styles.waitlistSection}>
                                <p style={styles.waitlistTitle}>
                                    Liste d'attente ({waitlist.length} personne{waitlist.length > 1 ? 's' : ''})
                                </p>
                                {waitlist.map((entry, index) => (
                                    <p key={entry.id} style={styles.waitlistItem}>
                                        {index + 1}. Utilisateur #{entry.userId}
                                    </p>
                                ))}
                            </div>
                        )}

                        {/* boutons admin */}
                        {user?.role === 'admin' && (
                            <div>
                                {/* première rangée — activer/désactiver + modifier */}
                                <div style={{ ...styles.buttons, marginBottom: '0.5rem' }}>
                                    <button
                                        onClick={handleToggle}
                                        style={isActive ? styles.btnDesactiver : styles.btnActiver}
                                    >
                                        {isActive ? 'Désactiver' : 'Activer'}
                                    </button>
                                    <button onClick={() => setIsEditing(true)} style={styles.btnWaitlist}>
                                        Modifier
                                    </button>
                                </div>
                                {/* deuxième rangée — supprimer */}
                                <div style={styles.buttons}>
                                    <button onClick={handleDelete} style={styles.btnDelete}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* boutons coach */}
                        {user?.role === 'coach' && (
                            <div style={styles.buttons}>
                                {/* modifier */}
                                <button onClick={() => setIsEditing(true)} style={styles.btnWaitlist}>
                                    Modifier
                                </button>
                                {/* supprimer */}
                                <button onClick={handleDelete} style={styles.btnDelete}>
                                    Supprimer
                                </button>
                            </div>
                        )}

                        {/* boutons client — seulement si connecté, pas admin, cours actif */}
                        {isLoggedIn && user?.role === 'client' && isActive && (
                            <div style={styles.buttons}>
                                <button
                                    onClick={handleReserver}
                                    style={placesRestantes === 0 ? styles.btnDisabled : styles.btnReserver}
                                    disabled={placesRestantes === 0 ? true : false}
                                >
                                    {placesRestantes === 0 ? 'Complet' : 'Réserver'}
                                </button>
                                {/* visible seulement si complet */}
                                {placesRestantes === 0 && (
                                    <button onClick={handleWaitlist} style={styles.btnWaitlist}>
                                        Liste d'attente
                                    </button>
                                )}
                            </div>
                        )}

                        {/* message si non connecté */}
                        {!isLoggedIn && isActive && (
                            <p style={styles.loginMsg}>
                                Connectez-vous pour réserver
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
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
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
    },
    cardTitle: {
        color: '#1a2f5e',
        fontSize: '1.1rem',
        margin: 0,
    },
    badgeActive: {
        backgroundColor: '#e6f4ea',
        color: '#2d7a3a',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    badgeInactive: {
        backgroundColor: '#ffe0e0',
        color: '#cc0000',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    cardText: {
        color: '#666',
        fontSize: '0.9rem',
        marginBottom: '1rem',
    },
    cardInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        marginBottom: '1rem',
    },
    infoItem: {
        color: '#1a2f5e',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    waitlistSection: {
        backgroundColor: '#f9f9f9',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        border: '1px solid #ddd',
    },
    waitlistTitle: {
        color: '#1a2f5e',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        marginBottom: '0.5rem',
    },
    waitlistItem: {
        color: '#666',
        fontSize: '0.8rem',
        margin: '0.2rem 0',
    },
    input: {
        width: '100%',
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.95rem',
        marginBottom: '0.75rem',
        boxSizing: 'border-box',
    },
    buttons: {
        display: 'flex',
        gap: '0.5rem',
    },
    btnReserver: {
        flex: 1,
        backgroundColor: '#f47c20',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    btnDisabled: {
        flex: 1,
        backgroundColor: '#ccc',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'not-allowed',
    },
    btnWaitlist: {
        flex: 1,
        backgroundColor: 'transparent',
        color: '#1a2f5e',
        border: '1px solid #1a2f5e',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        cursor: 'pointer',
    },
    btnActiver: {
        flex: 1,
        backgroundColor: '#2d7a3a',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    btnDesactiver: {
        flex: 1,
        backgroundColor: '#f47c20',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    btnDelete: {
        flex: 1,
        backgroundColor: '#cc0000',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    loginMsg: {
        color: '#666',
        fontSize: '0.9rem',
        textAlign: 'center',
        fontStyle: 'italic',
    },
};

export default CourseCard;