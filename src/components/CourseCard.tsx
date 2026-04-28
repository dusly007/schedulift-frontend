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
    const { isLoggedIn } = useAuth();

    const handleReserver = async () => {
        try {
            // appel POST /reservations avec courseId
            await api.post('/reservations', { courseId: course.id });
            alert('Réservation effectuée avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la réservation');
        }
    };

    const handleWaitlist = async () => {
        try {
            // appel POST /wait-list avec courseId
            await api.post('/wait-list', { courseId: course.id });
            alert('Inscrit sur la liste d\'attente !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de l\'inscription');
        }
    };

return (
    <div style={styles.card}>
            {/* image gif du cours */}
            {course.gifUrl && (
                <img
                    src={course.gifUrl}
                    alt={course.title}
                    style={styles.gif}
                />
            )}

            <div style={styles.cardBody}>
                {/* titre + badge disponibilité */}
                <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{course.title}</h3>
                    <span style={course.isActive ? styles.badgeActive : styles.badgeInactive}>
                        {course.isActive ? 'Disponible' : 'Indisponible'}
                    </span>
                </div>

                {/* description */}
                <p style={styles.cardText}>{course.description}</p>

                {/* infos du cours */}
                <div style={styles.cardInfo}>
                    <span style={styles.infoItem}>Capacité : {course.capacity}</span>
                    {course.bodyPart && (
                        <span style={styles.infoItem}>Zone : {course.bodyPart}</span>
                    )}
                    {course.coachName && (
                        <span style={styles.infoItem}>Coach : {course.coachName}</span>
                    )}
                </div>

                {/* boutons — seulement si connecté et cours actif */}
                {isLoggedIn && course.isActive && (
                    <div style={styles.buttons}>
                        <button onClick={handleReserver} style={styles.btnReserver}>
                            Réserver
                        </button>
                        <button onClick={handleWaitlist} style={styles.btnWaitlist}>
                            Liste d'attente
                        </button>
                    </div>
                )}

                {!isLoggedIn && course.isActive && (
                    <p style={styles.loginMsg}>
                        Connectez-vous pour réserver
                    </p>
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
    loginMsg: {
        color: '#666',
        fontSize: '0.9rem',
        textAlign: 'center',
        fontStyle: 'italic',
    },
};

export default CourseCard;

