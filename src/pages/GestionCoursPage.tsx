import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

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

function GestionCoursPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceIdFilter = searchParams.get('serviceId');

    const [courses, setCourses] = useState<Course[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [error, setError] = useState('');

    // filtres
    const [filtreService, setFiltreService] = useState(serviceIdFilter || '');
    const [filtreStatut, setFiltreStatut] = useState('');
    const [filtreRecherche, setFiltreRecherche] = useState('');

    // modal création
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newBodyPart, setNewBodyPart] = useState('');
    const [newNiveau, setNewNiveau] = useState('');
    const [newServiceId, setNewServiceId] = useState(serviceIdFilter || '');
    const [newPrix, setNewPrix] = useState('');

    // mode édition
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editNiveau, setEditNiveau] = useState('');
    const [editPrix, setEditPrix] = useState('');

    useEffect(() => {
        // rediriger si pas coach ou admin
        if (user && user.role !== 'coach' && user.role !== 'admin') {
            navigate('/');
            return;
        }

        // charger tous les services pour le formulaire
        api.get('/services')
            .then(res => setServices(res.data))
            .catch(() => {});

        // charger tous les cours
        api.get('/courses')
            .then(res => setCourses(res.data))
            .catch(() => setError('Erreur lors du chargement des cours'));
    }, [user]);

    // recharger les cours
    const rechargerCours = async () => {
        const res = await api.get('/courses');
        setCourses(res.data);
    };

    // appliquer les filtres localement
    const coursesFiltres = courses.filter(course => {
        // filtre service
        if (filtreService && course.serviceId !== parseInt(filtreService)) return false;
        // filtre statut
        if (filtreStatut === 'actif' && !course.isActive) return false;
        if (filtreStatut === 'inactif' && course.isActive) return false;
        // filtre recherche — titre ou coach
        if (filtreRecherche && !course.title.toLowerCase().includes(filtreRecherche.toLowerCase())
            && !course.coachName?.toLowerCase().includes(filtreRecherche.toLowerCase())) return false;
        return true;
    });

    // créer un cours
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/courses', {
                title: newTitle,
                description: newDescription,
                bodyPart: newBodyPart,
                niveau: newNiveau,
                serviceId: newServiceId ? parseInt(newServiceId) : undefined,
                prix: newPrix ? parseFloat(newPrix) : 0,
            });
            // fermer modal et reset champs
            setShowModal(false);
            setNewTitle('');
            setNewDescription('');
            setNewBodyPart('');
            setNewNiveau('');
            setNewServiceId(serviceIdFilter || '');
            setNewPrix('');
            await rechargerCours();
            alert(user?.role === 'coach' ? 'Cours créé — en attente de validation admin !' : 'Cours créé avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    // ouvrir mode édition
    const handleEdit = (course: Course) => {
        setEditingId(course.id);
        setEditTitle(course.title);
        setEditDescription(course.description);
        setEditNiveau(course.niveau || '');
        setEditPrix(String(course.prix || 0));
    };

    // sauvegarder modifications
    const handleSave = async (id: number) => {
        try {
            await api.patch(`/courses/${id}`, {
                title: editTitle,
                description: editDescription,
                niveau: editNiveau,
                prix: parseFloat(editPrix),
            });
            setEditingId(null);
            await rechargerCours();
            alert('Cours modifié avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la modification');
        }
    };

    // activer ou désactiver — admin seulement
    const handleToggle = async (id: number) => {
        try {
            await api.patch(`/courses/${id}/toggle`);
            setCourses(courses.map(c =>
                c.id === id ? { ...c, isActive: !c.isActive } : c
            ));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    // supprimer un cours
    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer ce cours ?')) return;
        try {
            await api.delete(`/courses/${id}`);
            setCourses(courses.filter(c => c.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    // trouver le nom du service
    const getNomService = (serviceId: number) => {
        return services.find(s => s.id === serviceId)?.nom || '—';
    };

    return (
        <div style={styles.container}>
            {/* navigation entre les trois pages de gestion */}
            <div style={styles.tabs}>
                <Link to="/gestion/services" style={styles.tab}>Services</Link>
                <Link to="/gestion/cours" style={styles.tabActive}>Cours</Link>
                <Link to="/gestion/groupes" style={styles.tab}>Groupes</Link>
            </div>

            <h1 style={styles.title}>
                {serviceIdFilter
                    ? `Cours — ${services.find(s => s.id === parseInt(serviceIdFilter))?.nom || ''}`
                    : 'Gestion des cours'
                }
            </h1>

            {/* bouton créer + retour */}
            <div style={styles.topBar}>
                {/* retour aux services si filtré */}
                {serviceIdFilter && (
                    <Link to="/gestion/services" style={styles.btnRetour}>
                        ← Retour aux services
                    </Link>
                )}
                <button onClick={() => setShowModal(true)} style={styles.btnCreate}>
                    + Créer un cours
                </button>
            </div>

            {/* filtres */}
            <div style={styles.filtres}>
                {/* recherche par titre ou coach */}
                <input
                    value={filtreRecherche}
                    onChange={e => setFiltreRecherche(e.target.value)}
                    style={styles.filtreInput}
                    placeholder="Rechercher par titre ou coach..."
                />

                {/* filtre par service */}
                <select
                    value={filtreService}
                    onChange={e => setFiltreService(e.target.value)}
                    style={styles.filtreSelect}
                >
                    <option value="">Tous les services</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id}>{s.nom}</option>
                    ))}
                </select>

                {/* filtre par statut */}
                <select
                    value={filtreStatut}
                    onChange={e => setFiltreStatut(e.target.value)}
                    style={styles.filtreSelect}
                >
                    <option value="">Tous les statuts</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                </select>

                {/* réinitialiser les filtres */}
                {(filtreService || filtreStatut || filtreRecherche) && (
                    <button
                        onClick={() => { setFiltreService(''); setFiltreStatut(''); setFiltreRecherche(''); }}
                        style={styles.btnReset}
                    >
                        Réinitialiser
                    </button>
                )}

                {/* nombre de résultats */}
                <span style={styles.resultCount}>
                    {coursesFiltres.length} cours
                </span>
            </div>

            {/* modal création */}
            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Créer un cours</h2>
                        <form onSubmit={handleCreate}>
                            <div style={styles.field}>
                                <label style={styles.label}>Titre</label>
                                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} style={styles.input} placeholder="Titre du cours" required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Description</label>
                                <input value={newDescription} onChange={e => setNewDescription(e.target.value)} style={styles.input} placeholder="Description" required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Zone musculaire</label>
                                <input value={newBodyPart} onChange={e => setNewBodyPart(e.target.value)} style={styles.input} placeholder="ex: chest, back..." />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Niveau</label>
                                <select value={newNiveau} onChange={e => setNewNiveau(e.target.value)} style={styles.input}>
                                    <option value="">Sélectionner</option>
                                    <option value="débutant">Débutant</option>
                                    <option value="intermédiaire">Intermédiaire</option>
                                    <option value="avancé">Avancé</option>
                                </select>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Service</label>
                                <select value={newServiceId} onChange={e => setNewServiceId(e.target.value)} style={styles.input}>
                                    <option value="">Sélectionner un service</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Prix ($)</label>
                                <input
                                    type="number"
                                    value={newPrix}
                                    onChange={e => setNewPrix(e.target.value)}
                                    style={styles.input}
                                    placeholder="ex: 25"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            {/* message pour coach */}
                            {user?.role === 'coach' && (
                                <p style={styles.infoMsg}>Le cours sera en attente de validation.</p>
                            )}

                            <div style={styles.modalButtons}>
                                <button type="submit" style={styles.btnSubmit}>Créer</button>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.btnCancel}>Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* erreur */}
            {error && <p style={styles.error}>{error}</p>}

            {/* tableau des cours filtrés */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Titre</th>
                            <th style={styles.th}>Service</th>
                            <th style={styles.th}>Niveau</th>
                            <th style={styles.th}>Coach</th>
                            <th style={styles.th}>Prix</th>
                            <th style={styles.th}>Statut</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coursesFiltres.map(course => (
                            <tr key={course.id} style={styles.tr}>
                                {/* mode édition */}
                                {editingId === course.id ? (
                                    <>
                                        <td style={styles.td}>
                                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={styles.inputInline} />
                                        </td>
                                        <td style={styles.td}>{getNomService(course.serviceId)}</td>
                                        <td style={styles.td}>
                                            <select value={editNiveau} onChange={e => setEditNiveau(e.target.value)} style={styles.inputInline}>
                                                <option value="">—</option>
                                                <option value="débutant">Débutant</option>
                                                <option value="intermédiaire">Intermédiaire</option>
                                                <option value="avancé">Avancé</option>
                                            </select>
                                        </td>
                                        <td style={styles.td}>{course.coachName || '—'}</td>
                                        <td style={styles.td}>
                                            {/* édition du prix */}
                                            <input
                                                type="number"
                                                value={editPrix}
                                                onChange={e => setEditPrix(e.target.value)}
                                                style={{ ...styles.inputInline, width: '70px' }}
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <span style={course.isActive ? styles.badgeActive : styles.badgeInactive}>
                                                {course.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {/* sauvegarder */}
                                                <button onClick={() => handleSave(course.id)} style={styles.btnSave}>✓</button>
                                                {/* annuler édition */}
                                                <button onClick={() => setEditingId(null)} style={styles.btnAnnuler}>✕</button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={styles.td}>{course.title}</td>
                                        <td style={styles.td}>{getNomService(course.serviceId)}</td>
                                        <td style={styles.td}>{course.niveau || '—'}</td>
                                        <td style={styles.td}>{course.coachName || '—'}</td>
                                        <td style={styles.td}>{course.prix ? `${course.prix}$` : '—'}</td>
                                        <td style={styles.td}>
                                            <span style={course.isActive ? styles.badgeActive : styles.badgeInactive}>
                                                {course.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {/* modifier */}
                                                <button onClick={() => handleEdit(course)} style={styles.btnEdit}>
                                                    Modifier
                                                </button>
                                                {/* activer/désactiver — admin seulement */}
                                                {user?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleToggle(course.id)}
                                                        style={course.isActive ? styles.btnDesactiver : styles.btnActiver}
                                                    >
                                                        {course.isActive ? 'Désactiver' : 'Activer'}
                                                    </button>
                                                )}
                                                {/* supprimer */}
                                                <button onClick={() => handleDelete(course.id)} style={styles.btnDelete}>
                                                    Supprimer
                                                </button>
                                                {/* voir les groupes */}
                                                <button
                                                    onClick={() => navigate(`/gestion/groupes?courseId=${course.id}`)}
                                                    style={styles.btnGroupes}
                                                >
                                                    Groupes →
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* message si aucun cours */}
            {coursesFiltres.length === 0 && !error && (
                <p style={styles.empty}>Aucun cours pour le moment.</p>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '2rem',
        backgroundColor: '#f9f9f9',
        minHeight: '80vh',
    },
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
    },
    tabActive: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        padding: '0.5rem 1.5rem',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.95rem',
    },
    tab: {
        backgroundColor: 'transparent',
        color: '#1a2f5e',
        padding: '0.5rem 1.5rem',
        borderRadius: '4px',
        textDecoration: 'none',
        border: '1px solid #1a2f5e',
        fontSize: '0.95rem',
    },
    title: {
        color: '#1a2f5e',
        fontSize: '1.8rem',
        marginBottom: '1.5rem',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    btnRetour: {
        color: '#1a2f5e',
        textDecoration: 'none',
        fontSize: '0.9rem',
    },
    btnCreate: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '4px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginLeft: 'auto',
    },
    filtres: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
    },
    filtreInput: {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
        flex: 1,
        minWidth: '200px',
    },
    filtreSelect: {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
        color: '#1a2f5e',
        cursor: 'pointer',
    },
    btnReset: {
        backgroundColor: 'transparent',
        color: '#cc0000',
        border: '1px solid #cc0000',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        cursor: 'pointer',
    },
    resultCount: {
        color: '#666',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
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
        maxHeight: '90vh',
        overflowY: 'auto',
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
    tableContainer: {
        overflowX: 'auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
    },
    tr: {
        borderBottom: '1px solid #eee',
    },
    td: {
        padding: '0.75rem 1rem',
        color: '#333',
        fontSize: '0.9rem',
        verticalAlign: 'middle',
    },
    inputInline: {
        padding: '0.4rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
        width: '100%',
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
    actions: {
        display: 'flex',
        gap: '0.4rem',
        flexWrap: 'wrap',
    },
    btnEdit: {
        backgroundColor: 'transparent',
        color: '#1a2f5e',
        border: '1px solid #1a2f5e',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        cursor: 'pointer',
    },
    btnSave: {
        backgroundColor: '#2d7a3a',
        color: 'white',
        border: 'none',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.9rem',
        cursor: 'pointer',
    },
    btnAnnuler: {
        backgroundColor: '#666',
        color: 'white',
        border: 'none',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.9rem',
        cursor: 'pointer',
    },
    btnActiver: {
        backgroundColor: '#2d7a3a',
        color: 'white',
        border: 'none',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        cursor: 'pointer',
    },
    btnDesactiver: {
        backgroundColor: '#f47c20',
        color: 'white',
        border: 'none',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        cursor: 'pointer',
    },
    btnDelete: {
        backgroundColor: '#cc0000',
        color: 'white',
        border: 'none',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        cursor: 'pointer',
    },
    btnGroupes: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        border: 'none',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        cursor: 'pointer',
    },
    empty: {
        textAlign: 'center',
        color: '#666',
        fontSize: '1rem',
        marginTop: '2rem',
    },
};

export default GestionCoursPage;