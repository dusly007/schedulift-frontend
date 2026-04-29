import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

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

function CoursesPage() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [error, setError] = useState('');
    // afficher ou cacher le modal
    const [showModal, setShowModal] = useState(false);
    // champs formulaire création
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCapacity, setNewCapacity] = useState('');
    const [newBodyPart, setNewBodyPart] = useState('');

    useEffect(() => {
        // appel GET /courses au chargement de la page
        api.get('/courses')
            .then(res => setCourses(res.data))
            .catch(() => setError('Erreur lors du chargement des cours'));
    }, []);

    // créer un cours — coach ou admin
    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/courses', {
                title: newTitle,
                description: newDescription,
                capacity: parseInt(newCapacity),
                bodyPart: newBodyPart,
            });
            // fermer modal et reset champs
            setShowModal(false);
            setNewTitle('');
            setNewDescription('');
            setNewCapacity('');
            setNewBodyPart('');
            // recharger la liste des cours
            const res = await api.get('/courses');
            setCourses(res.data);
            alert(user?.role === 'coach' ? 'Cours créé — en attente de validation admin !' : 'Cours créé avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Nos cours</h1>
            <p style={styles.subtitle}>Réservez votre prochaine séance</p>

            {/* bouton créer un cours — coach et admin seulement */}
            {(user?.role === 'coach' || user?.role === 'admin') && (
                <div style={styles.createBtn}>
                    <button onClick={() => setShowModal(true)} style={styles.btnCreate}>
                        + Créer un cours
                    </button>
                </div>
            )}

            {/* modal de création */}
            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Créer un cours</h2>
                        <form onSubmit={handleCreateCourse}>
                            <div style={styles.field}>
                                <label style={styles.label}>Titre</label>
                                <input
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    style={styles.input}
                                    placeholder="Titre du cours"
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Description</label>
                                <input
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    style={styles.input}
                                    placeholder="Description du cours"
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Capacité</label>
                                <input
                                    type="number"
                                    value={newCapacity}
                                    onChange={e => setNewCapacity(e.target.value)}
                                    style={styles.input}
                                    placeholder="Nombre de places"
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Zone musculaire</label>
                                <input
                                    value={newBodyPart}
                                    onChange={e => setNewBodyPart(e.target.value)}
                                    style={styles.input}
                                    placeholder="ex: chest, cardio, back..."
                                />
                            </div>

                            {/* message pour coach — cours en attente de validation */}
                            {user?.role === 'coach' && (
                                <p style={styles.infoMsg}>
                                    Le cours sera en attente de validation par un admin.
                                </p>
                            )}

                            <div style={styles.modalButtons}>
                                {/* soumettre le formulaire */}
                                <button type="submit" style={styles.btnSubmit}>
                                    Créer
                                </button>
                                {/* fermer le modal */}
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={styles.btnCancel}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* afficher erreur si problème */}
            {error && <p style={styles.error}>{error}</p>}

            {/* afficher les cours */}
            <div style={styles.grid}>
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>

            {/* message si aucun cours */}
            {courses.length === 0 && !error && (
                <p style={styles.empty}>Aucun cours disponible pour le moment.</p>
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
    title: {
        color: '#1a2f5e',
        fontSize: '2rem',
        textAlign: 'center',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#666',
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '1rem',
    },
    createBtn: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem',
    },
    btnCreate: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        border: 'none',
        padding: '0.75rem 2rem',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
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
        maxWidth: '450px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
    modalTitle: {
        color: '#1a2f5e',
        fontSize: '1.5rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
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
    infoMsg: {
        color: '#f47c20',
        fontSize: '0.85rem',
        marginBottom: '1rem',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    modalButtons: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    btnSubmit: {
        flex: 1,
        backgroundColor: '#f47c20',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    btnCancel: {
        flex: 1,
        backgroundColor: 'transparent',
        color: '#1a2f5e',
        border: '1px solid #1a2f5e',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    error: {
        backgroundColor: '#ffe0e0',
        color: '#cc0000',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
    },
    empty: {
        textAlign: 'center',
        color: '#666',
        fontSize: '1rem',
        marginTop: '2rem',
    },
};

export default CoursesPage;