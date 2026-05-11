import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';

interface Course {
    id: number;
    title: string;
    description: string;
    isActive: boolean;
    gifUrl: string;
    coachName: string;
    bodyPart: string;
    niveau: string;
    serviceId: number;
    prix: number;
}

interface Service {
    id: number;
    nom: string;
}

function CoursesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceId = searchParams.get('serviceId');

    const [courses, setCourses] = useState<Course[]>([]);
    const [service, setService] = useState<Service | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // afficher ou cacher le modal
    const [showModal, setShowModal] = useState(false);
    // champs formulaire création
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newBodyPart, setNewBodyPart] = useState('');
    const [newNiveau, setNewNiveau] = useState('');
    // états pour édition cours
    const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // charger les infos du service si serviceId présent
                if (serviceId) {
                    const serviceRes = await api.get(`/services/${serviceId}`);
                    setService(serviceRes.data);
                }

                // charger les cours
                const coursesRes = await api.get('/courses');
                const allCourses = coursesRes.data;
                if (serviceId) {
                    setCourses(allCourses.filter((c: Course) => c.serviceId === parseInt(serviceId)));
                } else {
                    setCourses(allCourses);
                }
            } catch {
                setError('Erreur lors du chargement des cours');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [serviceId]);

    // recharger les cours
    const rechargerCours = async () => {
        const res = await api.get('/courses');
        const allCourses = res.data;
        if (serviceId) {
            setCourses(allCourses.filter((c: Course) => c.serviceId === parseInt(serviceId)));
        } else {
            setCourses(allCourses);
        }
    };

    // créer un cours — coach ou admin
    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/courses', {
                title: newTitle,
                description: newDescription,
                bodyPart: newBodyPart,
                niveau: newNiveau,
                serviceId: serviceId ? parseInt(serviceId) : undefined,
            });
            // fermer modal et reset champs
            setShowModal(false);
            setNewTitle('');
            setNewDescription('');
            setNewBodyPart('');
            setNewNiveau('');
            await rechargerCours();
            alert(user?.role === 'coach' ? 'Cours créé — en attente de validation admin !' : 'Cours créé avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    // ouvrir mode édition
    const handleEditCourse = (course: Course) => {
        setEditingCourseId(course.id);
        setEditTitle(course.title);
        setEditDescription(course.description);
    };

    // sauvegarder modifications cours
    const handleSaveCourse = async (id: number) => {
        try {
            await api.patch(`/courses/${id}`, {
                title: editTitle,
                description: editDescription,
            });
            setEditingCourseId(null);
            await rechargerCours();
            alert('Cours modifié avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la modification');
        }
    };

    // activer ou désactiver un cours — admin seulement
    const handleToggleCourse = async (id: number) => {
        try {
            await api.patch(`/courses/${id}/toggle`);
            setCourses(courses.map(c =>
                c.id === id ? { ...c, isActive: !c.isActive } : c
            ));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    // supprimer un cours — coach ou admin
    const handleDeleteCourse = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer ce cours ?')) return;
        try {
            await api.delete(`/courses/${id}`);
            setCourses(courses.filter(c => c.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    // afficher spinner pendant le chargement
    if (loading) return <Spinner />;

    return (
        <div style={styles.container}>
            {/* breadcrumb — retour aux services */}
            <div style={styles.breadcrumb}>
                <Link to="/services" style={styles.breadcrumbLink}>← Retour aux services</Link>
            </div>

            <h1 style={styles.title}>
                {service ? `Cours — ${service.nom}` : 'Nos cours'}
            </h1>
            <p style={styles.subtitle}>Choisissez un cours pour voir les groupes disponibles</p>

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
                                <label style={styles.label}>Zone musculaire</label>
                                <input
                                    value={newBodyPart}
                                    onChange={e => setNewBodyPart(e.target.value)}
                                    style={styles.input}
                                    placeholder="ex: chest, cardio, back..."
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Niveau</label>
                                <select
                                    value={newNiveau}
                                    onChange={e => setNewNiveau(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="">Sélectionner un niveau</option>
                                    <option value="débutant">Débutant</option>
                                    <option value="intermédiaire">Intermédiaire</option>
                                    <option value="avancé">Avancé</option>
                                </select>
                            </div>

                            {/* message pour coach — cours en attente de validation */}
                            {user?.role === 'coach' && (
                                <p style={styles.infoMsg}>
                                    Le cours sera en attente de validation par un admin.
                                </p>
                            )}

                            <div style={styles.modalButtons}>
                                <button type="submit" style={styles.btnSubmit}>
                                    Créer
                                </button>
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
                    <div key={course.id} style={styles.card}>
                        {/* image du cours — clic vers groupes */}
                        {course.gifUrl && (
                            <img
                                src={course.gifUrl}
                                alt={course.title}
                                style={styles.gif}
                                onClick={() => navigate(`/groupes?courseId=${course.id}`)}
                            />
                        )}

                        <div style={styles.cardBody}>
                            {/* mode édition — coach et admin */}
                            {editingCourseId === course.id ? (
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
                                    <div style={styles.modalButtons}>
                                        <button onClick={() => handleSaveCourse(course.id)} style={styles.btnSubmit}>
                                            Sauvegarder
                                        </button>
                                        <button onClick={() => setEditingCourseId(null)} style={styles.btnCancel}>
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* titre + badge disponibilité */}
                                    <div
                                        style={styles.cardHeader}
                                        onClick={() => navigate(`/groupes?courseId=${course.id}`)}
                                    >
                                        <h3 style={styles.cardTitle}>{course.title}</h3>
                                        <span style={course.isActive ? styles.badgeActive : styles.badgeInactive}>
                                            {course.isActive ? 'Disponible' : 'Indisponible'}
                                        </span>
                                    </div>

                                    <p
                                        style={styles.cardText}
                                        onClick={() => navigate(`/groupes?courseId=${course.id}`)}
                                    >
                                        {course.description}
                                    </p>

                                    {/* infos du cours */}
                                    <div style={styles.cardInfo}>
                                        {course.niveau && (
                                            <span style={styles.infoItem}>Niveau : {course.niveau}</span>
                                        )}
                                        {course.bodyPart && (
                                            <span style={styles.infoItem}>Zone : {course.bodyPart}</span>
                                        )}
                                        {course.coachName && (
                                            <span style={styles.infoItem}>Coach : {course.coachName}</span>
                                        )}
                                        {/* prix du cours */}
                                        {course.prix > 0 && (
                                            <span style={styles.prix}>{course.prix}$ / groupe</span>
                                        )}
                                    </div>

                                    {/* boutons admin */}
                                    {user?.role === 'admin' && (
                                        <div>
                                            <div style={{ ...styles.modalButtons, marginBottom: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleToggleCourse(course.id)}
                                                    style={course.isActive ? styles.btnDesactiver : styles.btnActiver}
                                                >
                                                    {course.isActive ? 'Désactiver' : 'Activer'}
                                                </button>
                                                <button onClick={() => handleEditCourse(course)} style={styles.btnWaitlist}>
                                                    Modifier
                                                </button>
                                            </div>
                                            <div style={styles.modalButtons}>
                                                <button onClick={() => handleDeleteCourse(course.id)} style={styles.btnDelete}>
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* boutons coach */}
                                    {user?.role === 'coach' && (
                                        <div style={styles.modalButtons}>
                                            <button onClick={() => handleEditCourse(course)} style={styles.btnWaitlist}>
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDeleteCourse(course.id)} style={styles.btnDelete}>
                                                Supprimer
                                            </button>
                                        </div>
                                    )}

                                    {/* bouton voir les groupes — visiteur et client */}
                                    {(!user || user?.role === 'client') && (
                                        <button
                                            onClick={() => navigate(`/groupes?courseId=${course.id}`)}
                                            style={styles.btnVoir}
                                        >
                                            Voir les groupes →
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* message si aucun cours */}
            {courses.length === 0 && !error && (
                <p style={styles.empty}>Aucun cours disponible pour ce service.</p>
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
    breadcrumb: {
        marginBottom: '1rem',
    },
    breadcrumbLink: {
        color: '#1a2f5e',
        textDecoration: 'none',
        fontSize: '0.9rem',
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
        marginBottom: '0.75rem',
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
        marginTop: '0.5rem',
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
        cursor: 'pointer',
    },
    cardBody: {
        padding: '1.5rem',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        cursor: 'pointer',
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
        cursor: 'pointer',
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
    prix: {
        color: '#f47c20',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        marginTop: '0.5rem',
    },
    btnVoir: {
        width: '100%',
        backgroundColor: '#f47c20',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    empty: {
        textAlign: 'center',
        color: '#666',
        fontSize: '1rem',
        marginTop: '2rem',
    },
};

export default CoursesPage;