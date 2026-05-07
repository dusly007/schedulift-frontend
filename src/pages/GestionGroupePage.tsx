import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

interface Groupe {
    id: number;
    nom: string;
    dateDebut: string;
    dateFin: string;
    dureeEnSemaines: number;
    horaire: string;
    ageMin: number;
    ageMax: number;
    genre: string;
    capaciteMax: number;
    coachName: string;
    estValide: boolean;
    courseId: number;
    course?: { title: string };
}

interface Course {
    id: number;
    title: string;
}

function GestionGroupesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseIdFilter = searchParams.get('courseId');

    const [groupes, setGroupes] = useState<Groupe[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [placesRestantes, setPlacesRestantes] = useState<{ [key: number]: number }>({});
    const [error, setError] = useState('');

    // modal création
    const [showModal, setShowModal] = useState(false);
    const [newNom, setNewNom] = useState('');
    const [newCourseId, setNewCourseId] = useState(courseIdFilter || '');
    const [newDateDebut, setNewDateDebut] = useState('');
    const [newDateFin, setNewDateFin] = useState('');
    const [newDuree, setNewDuree] = useState('');
    const [newHoraire, setNewHoraire] = useState('');
    const [newAgeMin, setNewAgeMin] = useState('');
    const [newAgeMax, setNewAgeMax] = useState('');
    const [newGenre, setNewGenre] = useState('mixte');
    const [newCapacite, setNewCapacite] = useState('');

    // mode édition
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editNom, setEditNom] = useState('');
    const [editHoraire, setEditHoraire] = useState('');
    const [editCapacite, setEditCapacite] = useState('');
    const [editAgeMin, setEditAgeMin] = useState('');
    const [editAgeMax, setEditAgeMax] = useState('');

    useEffect(() => {
        // rediriger si pas coach ou admin
        if (user && user.role !== 'coach' && user.role !== 'admin') {
            navigate('/');
            return;
        }

        // charger les cours pour le formulaire
        api.get('/courses')
            .then(res => setCourses(res.data))
            .catch(() => {});

        // charger les groupes — filtrer par courseId si présent
        const url = courseIdFilter
            ? `/groupes/course/${courseIdFilter}`
            : '/groupes';

        api.get(url)
            .then(res => {
                setGroupes(res.data);
                // charger les places restantes
                res.data.forEach((groupe: Groupe) => {
                    api.get(`/reservations/places/${groupe.id}`)
                        .then(r => setPlacesRestantes(prev => ({
                            ...prev,
                            [groupe.id]: r.data.placesRestantes
                        })))
                        .catch(() => {});
                });
            })
            .catch(() => setError('Erreur lors du chargement des groupes'));
    }, [user, courseIdFilter]);

    // recharger les groupes
    const rechargerGroupes = async () => {
        const url = courseIdFilter
            ? `/groupes/course/${courseIdFilter}`
            : '/groupes';
        const res = await api.get(url);
        setGroupes(res.data);
    };

    // créer un groupe
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/groupes', {
                nom: newNom,
                courseId: parseInt(newCourseId),
                dateDebut: newDateDebut,
                dateFin: newDateFin,
                dureeEnSemaines: parseInt(newDuree),
                horaire: newHoraire,
                ageMin: parseInt(newAgeMin),
                ageMax: parseInt(newAgeMax),
                genre: newGenre,
                capaciteMax: parseInt(newCapacite),
                coachName: user?.email,
            });
            // fermer modal et reset champs
            setShowModal(false);
            setNewNom('');
            setNewDateDebut('');
            setNewDateFin('');
            setNewDuree('');
            setNewHoraire('');
            setNewAgeMin('');
            setNewAgeMax('');
            setNewGenre('mixte');
            setNewCapacite('');
            await rechargerGroupes();
            alert(user?.role === 'coach' ? 'Groupe créé — en attente de validation admin !' : 'Groupe créé avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    // ouvrir mode édition
    const handleEdit = (groupe: Groupe) => {
        setEditingId(groupe.id);
        setEditNom(groupe.nom);
        setEditHoraire(groupe.horaire);
        setEditCapacite(String(groupe.capaciteMax));
        setEditAgeMin(String(groupe.ageMin));
        setEditAgeMax(String(groupe.ageMax));
    };

    // sauvegarder modifications
    const handleSave = async (id: number) => {
        try {
            await api.patch(`/groupes/${id}`, {
                nom: editNom,
                horaire: editHoraire,
                capaciteMax: parseInt(editCapacite),
                ageMin: parseInt(editAgeMin),
                ageMax: parseInt(editAgeMax),
            });
            setEditingId(null);
            await rechargerGroupes();
            alert('Groupe modifié avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la modification');
        }
    };

    // valider ou invalider — admin seulement
    const handleToggle = async (id: number) => {
        try {
            await api.patch(`/groupes/${id}/toggle`);
            setGroupes(groupes.map(g =>
                g.id === id ? { ...g, estValide: !g.estValide } : g
            ));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    // supprimer un groupe
    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer ce groupe ?')) return;
        try {
            await api.delete(`/groupes/${id}`);
            setGroupes(groupes.filter(g => g.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    // trouver le titre du cours
    const getTitreCours = (courseId: number) => {
        return courses.find(c => c.id === courseId)?.title || `Cours #${courseId}`;
    };

    return (
        <div style={styles.container}>
            {/* navigation entre les deux pages de gestion */}
            <div style={styles.tabs}>
                <Link to="/gestion/services" style={styles.tab}>Services</Link>
                <Link to="/gestion/cours" style={styles.tab}>Cours</Link>
                <Link to="/gestion/groupes" style={styles.tabActive}>Groupes</Link>
            </div>

            <h1 style={styles.title}>
                {courseIdFilter
                    ? `Groupes — ${getTitreCours(parseInt(courseIdFilter))}`
                    : 'Gestion des groupes'
                }
            </h1>

            {/* bouton créer */}
            <div style={styles.topBar}>
                {/* retour aux cours si filtré */}
                {courseIdFilter && (
                    <Link to="/gestion/cours" style={styles.btnRetour}>
                        ← Retour aux cours
                    </Link>
                )}
                <button onClick={() => setShowModal(true)} style={styles.btnCreate}>
                    + Créer un groupe
                </button>
            </div>

            {/* modal création */}
            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Créer un groupe</h2>
                        <form onSubmit={handleCreate}>
                            <div style={styles.field}>
                                <label style={styles.label}>Cours</label>
                                <select
                                    value={newCourseId}
                                    onChange={e => setNewCourseId(e.target.value)}
                                    style={styles.input}
                                    required
                                >
                                    <option value="">Sélectionner un cours</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Nom du groupe</label>
                                <input value={newNom} onChange={e => setNewNom(e.target.value)} style={styles.input} placeholder="ex: Groupe A — Débutants" required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Date de début</label>
                                <input type="date" value={newDateDebut} onChange={e => setNewDateDebut(e.target.value)} style={styles.input} required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Date de fin</label>
                                <input type="date" value={newDateFin} onChange={e => setNewDateFin(e.target.value)} style={styles.input} required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Durée (semaines)</label>
                                <input type="number" value={newDuree} onChange={e => setNewDuree(e.target.value)} style={styles.input} placeholder="ex: 3" required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Horaire</label>
                                <input value={newHoraire} onChange={e => setNewHoraire(e.target.value)} style={styles.input} placeholder="ex: Lundi/Mercredi 9h-10h" required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Âge minimum</label>
                                <input type="number" value={newAgeMin} onChange={e => setNewAgeMin(e.target.value)} style={styles.input} placeholder="ex: 18" required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Âge maximum</label>
                                <input type="number" value={newAgeMax} onChange={e => setNewAgeMax(e.target.value)} style={styles.input} placeholder="ex: 60" required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Genre</label>
                                <select value={newGenre} onChange={e => setNewGenre(e.target.value)} style={styles.input}>
                                    <option value="mixte">Mixte</option>
                                    <option value="homme">Homme</option>
                                    <option value="femme">Femme</option>
                                </select>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Capacité maximale</label>
                                <input type="number" value={newCapacite} onChange={e => setNewCapacite(e.target.value)} style={styles.input} placeholder="ex: 10" required />
                            </div>

                            {/* message pour coach — groupe en attente de validation */}
                            {user?.role === 'coach' && (
                                <p style={styles.infoMsg}>Le groupe sera en attente de validation.</p>
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

            {/* tableau des groupes */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nom</th>
                            <th style={styles.th}>Cours</th>
                            <th style={styles.th}>Horaire</th>
                            <th style={styles.th}>Dates</th>
                            <th style={styles.th}>Durée</th>
                            <th style={styles.th}>Âge</th>
                            <th style={styles.th}>Genre</th>
                            <th style={styles.th}>Places</th>
                            <th style={styles.th}>Statut</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupes.map(groupe => (
                            <tr key={groupe.id} style={styles.tr}>
                                {/* mode édition */}
                                {editingId === groupe.id ? (
                                    <>
                                        <td style={styles.td}>
                                            <input value={editNom} onChange={e => setEditNom(e.target.value)} style={styles.inputInline} />
                                        </td>
                                        <td style={styles.td}>{getTitreCours(groupe.courseId)}</td>
                                        <td style={styles.td}>
                                            <input value={editHoraire} onChange={e => setEditHoraire(e.target.value)} style={styles.inputInline} />
                                        </td>
                                        <td style={styles.td}>
                                            {new Date(groupe.dateDebut).toLocaleDateString('fr-CA')}
                                        </td>
                                        <td style={styles.td}>{groupe.dureeEnSemaines} sem.</td>
                                        <td style={styles.td}>
                                            <input type="number" value={editAgeMin} onChange={e => setEditAgeMin(e.target.value)} style={{ ...styles.inputInline, width: '50px' }} />
                                            {' — '}
                                            <input type="number" value={editAgeMax} onChange={e => setEditAgeMax(e.target.value)} style={{ ...styles.inputInline, width: '50px' }} />
                                        </td>
                                        <td style={styles.td}>{groupe.genre}</td>
                                        <td style={styles.td}>
                                            <input type="number" value={editCapacite} onChange={e => setEditCapacite(e.target.value)} style={{ ...styles.inputInline, width: '60px' }} />
                                        </td>
                                        <td style={styles.td}>
                                            <span style={groupe.estValide ? styles.badgeActive : styles.badgeInactive}>
                                                {groupe.estValide ? 'Validé' : 'En attente'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {/* sauvegarder */}
                                                <button onClick={() => handleSave(groupe.id)} style={styles.btnSave}>✓</button>
                                                {/* annuler édition */}
                                                <button onClick={() => setEditingId(null)} style={styles.btnAnnuler}>✕</button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={styles.td}>{groupe.nom}</td>
                                        <td style={styles.td}>{getTitreCours(groupe.courseId)}</td>
                                        <td style={styles.td}>{groupe.horaire}</td>
                                        <td style={styles.td} >
                                            {new Date(groupe.dateDebut).toLocaleDateString('fr-CA')} →{' '}
                                            {new Date(groupe.dateFin).toLocaleDateString('fr-CA')}
                                        </td>
                                        <td style={styles.td}>{groupe.dureeEnSemaines} sem.</td>
                                        <td style={styles.td}>{groupe.ageMin} — {groupe.ageMax} ans</td>
                                        <td style={styles.td}>{groupe.genre}</td>
                                        <td style={styles.td}>
                                            {placesRestantes[groupe.id] !== undefined
                                                ? `${placesRestantes[groupe.id]}/${groupe.capaciteMax}`
                                                : '...'}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={groupe.estValide ? styles.badgeActive : styles.badgeInactive}>
                                                {groupe.estValide ? 'Validé' : 'En attente'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {/* modifier */}
                                                <button onClick={() => handleEdit(groupe)} style={styles.btnEdit}>
                                                    Modifier
                                                </button>
                                                {/* valider/invalider — admin seulement */}
                                                {user?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleToggle(groupe.id)}
                                                        style={groupe.estValide ? styles.btnDesactiver : styles.btnActiver}
                                                    >
                                                        {groupe.estValide ? 'Invalider' : 'Valider'}
                                                    </button>
                                                )}
                                                {/* supprimer */}
                                                <button onClick={() => handleDelete(groupe.id)} style={styles.btnDelete}>
                                                    Supprimer
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

            {/* message si aucun groupe */}
            {groupes.length === 0 && !error && (
                <p style={styles.empty}>Aucun groupe pour le moment.</p>
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
        marginBottom: '1.5rem',
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
    empty: {
        textAlign: 'center',
        color: '#666',
        fontSize: '1rem',
        marginTop: '2rem',
    },
};

export default GestionGroupesPage;