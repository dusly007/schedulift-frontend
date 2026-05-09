import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
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
}

interface Course {
    id: number;
    title: string;
    gifUrl: string;
}

function GroupesPage() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('courseId');

    const [groupes, setGroupes] = useState<Groupe[]>([]);
    const [course, setCourse] = useState<Course | null>(null);
    const [error, setError] = useState('');
    const [placesRestantes, setPlacesRestantes] = useState<{ [key: number]: number }>({});

    // filtres
    const [filtreGenre, setFiltreGenre] = useState('');
    const [filtreAge, setFiltreAge] = useState('');

    // modal confirmation réservation
    const [showConfirm, setShowConfirm] = useState(false);
    const [groupeSelectionne, setGroupeSelectionne] = useState<Groupe | null>(null);

    // modal création groupe
    const [showModal, setShowModal] = useState(false);
    const [newNom, setNewNom] = useState('');
    const [newDateDebut, setNewDateDebut] = useState('');
    const [newDateFin, setNewDateFin] = useState('');
    const [newDuree, setNewDuree] = useState('');
    const [newHoraire, setNewHoraire] = useState('');
    const [newAgeMin, setNewAgeMin] = useState('');
    const [newAgeMax, setNewAgeMax] = useState('');
    const [newGenre, setNewGenre] = useState('mixte');
    const [newCapacite, setNewCapacite] = useState('');

    // états pour édition groupe
    const [editingGroupeId, setEditingGroupeId] = useState<number | null>(null);
    const [editNom, setEditNom] = useState('');
    const [editHoraire, setEditHoraire] = useState('');
    const [editCapacite, setEditCapacite] = useState('');

    useEffect(() => {
        if (!courseId) return;

        // charger les infos du cours
        api.get(`/courses/${courseId}`)
            .then(res => setCourse(res.data))
            .catch(() => setError('Cours non trouvé'));

        // charger les groupes du cours
        api.get(`/groupes/course/${courseId}`)
            .then(res => {
                setGroupes(res.data);
                // charger les places restantes pour chaque groupe
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
    }, [courseId]);

    // filtrer les groupes selon les filtres sélectionnés
    const groupesFiltres = groupes.filter(groupe => {
        // filtre genre
        if (filtreGenre && groupe.genre !== filtreGenre && groupe.genre !== 'mixte') return false;
        // filtre âge
        if (filtreAge) {
            const age = parseInt(filtreAge);
            if (age < groupe.ageMin || age > groupe.ageMax) return false;
        }
        // seulement les groupes validés pour les clients
        if (user?.role === 'client' && !groupe.estValide) return false;
        return true;
    });

    // ouvrir modal confirmation avant réservation
    const handleReserverClick = (groupe: Groupe) => {
        if (!isLoggedIn) {
            // rediriger vers login avec retour sur cette page
            navigate(`/login?redirect=/groupes?courseId=${courseId}`);
            return;
        }
        // ouvrir modal confirmation
        setGroupeSelectionne(groupe);
        setShowConfirm(true);
    };

    // confirmer la réservation
    const handleConfirmerReservation = async () => {
        if (!groupeSelectionne) return;
        try {
            await api.post('/reservations', { groupeId: groupeSelectionne.id });
            // mettre à jour les places restantes localement
            setPlacesRestantes(prev => ({
                ...prev,
                [groupeSelectionne.id]: (prev[groupeSelectionne.id] || 0) - 1
            }));
            setShowConfirm(false);
            setGroupeSelectionne(null);
            alert('Réservation effectuée avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la réservation');
            setShowConfirm(false);
        }
    };

    // s'inscrire sur la liste d'attente
    const handleWaitlist = async (groupeId: number) => {
        try {
            await api.post('/wait-list', { groupeId });
            alert('Inscrit sur la liste d\'attente !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de l\'inscription');
        }
    };

    // créer un groupe — coach ou admin
    const handleCreateGroupe = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/groupes', {
                nom: newNom,
                courseId: parseInt(courseId!),
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
            // fermer modal et recharger groupes
            setShowModal(false);
            const res = await api.get(`/groupes/course/${courseId}`);
            setGroupes(res.data);
            alert(user?.role === 'coach' ? 'Groupe créé — en attente de validation admin !' : 'Groupe créé avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    // valider ou invalider un groupe — admin seulement
    const handleToggle = async (groupeId: number) => {
        try {
            await api.patch(`/groupes/${groupeId}/toggle`);
            // mettre à jour localement
            setGroupes(groupes.map(g =>
                g.id === groupeId ? { ...g, estValide: !g.estValide } : g
            ));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    // supprimer un groupe — coach ou admin
    const handleDelete = async (groupeId: number) => {
        if (!confirm('Voulez-vous vraiment supprimer ce groupe ?')) return;
        try {
            await api.delete(`/groupes/${groupeId}`);
            // retirer le groupe de la liste
            setGroupes(groupes.filter(g => g.id !== groupeId));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    // ouvrir mode édition groupe
    const handleEditGroupe = (groupe: Groupe) => {
        setEditingGroupeId(groupe.id);
        setEditNom(groupe.nom);
        setEditHoraire(groupe.horaire);
        setEditCapacite(String(groupe.capaciteMax));
    };

    // sauvegarder modifications groupe
    const handleSaveGroupe = async (id: number) => {
        try {
            await api.patch(`/groupes/${id}`, {
                nom: editNom,
                horaire: editHoraire,
                capaciteMax: parseInt(editCapacite),
            });
            setEditingGroupeId(null);
            // recharger les groupes
            const res = await api.get(`/groupes/course/${courseId}`);
            setGroupes(res.data);
            alert('Groupe modifié avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la modification');
        }
    };

    return (
        <div style={styles.container}>
            {/* breadcrumb */}
            <div style={styles.breadcrumb}>
                <Link to="/services" style={styles.breadcrumbLink}>Services</Link>
                <span style={styles.breadcrumbSep}> → </span>
                <Link to={`/courses?serviceId=${course?.id}`} style={styles.breadcrumbLink}>Cours</Link>
                <span style={styles.breadcrumbSep}> → </span>
                <span style={styles.breadcrumbCurrent}>{course?.title}</span>
            </div>

            <h1 style={styles.title}>{course?.title} — Groupes</h1>
            <p style={styles.subtitle}>Choisissez un groupe qui correspond à vos disponibilités</p>

            {/* bouton créer un groupe — coach et admin seulement */}
            {(user?.role === 'coach' || user?.role === 'admin') && (
                <div style={styles.createBtn}>
                    <button onClick={() => setShowModal(true)} style={styles.btnCreate}>
                        + Créer un groupe
                    </button>
                </div>
            )}

            {/* filtres */}
            <div style={styles.filtres}>
                <div style={styles.filtreGroup}>
                    <label style={styles.filtreLabel}>Genre</label>
                    <select
                        value={filtreGenre}
                        onChange={e => setFiltreGenre(e.target.value)}
                        style={styles.filtreSelect}
                    >
                        <option value="">Tous</option>
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                        <option value="mixte">Mixte</option>
                    </select>
                </div>

                <div style={styles.filtreGroup}>
                    <label style={styles.filtreLabel}>Votre âge</label>
                    <input
                        type="number"
                        value={filtreAge}
                        onChange={e => setFiltreAge(e.target.value)}
                        style={styles.filtreInput}
                        placeholder="ex: 25"
                    />
                </div>

                {/* réinitialiser les filtres */}
                {(filtreGenre || filtreAge) && (
                    <button
                        onClick={() => { setFiltreGenre(''); setFiltreAge(''); }}
                        style={styles.btnReset}
                    >
                        Réinitialiser
                    </button>
                )}
            </div>

            {/* afficher erreur si problème */}
            {error && <p style={styles.error}>{error}</p>}

            {/* modal confirmation réservation */}
            {showConfirm && groupeSelectionne && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Confirmer la réservation</h2>
                        <p style={styles.confirmText}>
                            Vous allez réserver le groupe :
                        </p>
                        <div style={styles.confirmInfo}>
                            <p><strong>{groupeSelectionne.nom}</strong></p>
                            <p>Horaire : {groupeSelectionne.horaire}</p>
                            <p>Du {new Date(groupeSelectionne.dateDebut).toLocaleDateString('fr-CA')} au {new Date(groupeSelectionne.dateFin).toLocaleDateString('fr-CA')}</p>
                            <p>Durée : {groupeSelectionne.dureeEnSemaines} semaines</p>
                        </div>
                        <div style={styles.modalButtons}>
                            {/* confirmer */}
                            <button onClick={handleConfirmerReservation} style={styles.btnSubmit}>
                                Confirmer
                            </button>
                            {/* annuler */}
                            <button onClick={() => setShowConfirm(false)} style={styles.btnCancel}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* modal création groupe */}
            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Créer un groupe</h2>
                        <form onSubmit={handleCreateGroupe}>
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
                                <p style={styles.infoMsg}>
                                    Le groupe sera en attente de validation par un admin.
                                </p>
                            )}

                            <div style={styles.modalButtons}>
                                <button type="submit" style={styles.btnSubmit}>Créer</button>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.btnCancel}>Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* afficher les groupes filtrés */}
            <div style={styles.grid}>
                {groupesFiltres.map(groupe => {
                    const places = placesRestantes[groupe.id];
                    const complet = places === 0;

                    return (
                        <div key={groupe.id} style={styles.card}>
                            <div style={styles.cardBody}>

                                {/* mode édition groupe — coach et admin */}
                                {editingGroupeId === groupe.id ? (
                                    <div>
                                        <input
                                            value={editNom}
                                            onChange={e => setEditNom(e.target.value)}
                                            style={styles.input}
                                            placeholder="Nom du groupe"
                                        />
                                        <input
                                            value={editHoraire}
                                            onChange={e => setEditHoraire(e.target.value)}
                                            style={styles.input}
                                            placeholder="Horaire"
                                        />
                                        <input
                                            type="number"
                                            value={editCapacite}
                                            onChange={e => setEditCapacite(e.target.value)}
                                            style={styles.input}
                                            placeholder="Capacité"
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            {/* sauvegarder */}
                                            <button onClick={() => handleSaveGroupe(groupe.id)} style={styles.btnSubmit}>
                                                Sauvegarder
                                            </button>
                                            {/* annuler édition */}
                                            <button onClick={() => setEditingGroupeId(null)} style={styles.btnCancel}>
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* nom + badge validé */}
                                        <div style={styles.cardHeader}>
                                            <h3 style={styles.cardTitle}>{groupe.nom}</h3>
                                            <span style={groupe.estValide ? styles.badgeActive : styles.badgeInactive}>
                                                {groupe.estValide ? 'Disponible' : 'En attente'}
                                            </span>
                                        </div>

                                        {/* infos du groupe */}
                                        <div style={styles.cardInfo}>
                                            <span style={styles.infoItem}>📅 {groupe.horaire}</span>
                                            <span style={styles.infoItem}>
                                                Du {new Date(groupe.dateDebut).toLocaleDateString('fr-CA')} au {new Date(groupe.dateFin).toLocaleDateString('fr-CA')}
                                            </span>
                                            <span style={styles.infoItem}>⏱ {groupe.dureeEnSemaines} semaines</span>
                                            <span style={styles.infoItem}>👤 {groupe.ageMin} — {groupe.ageMax} ans</span>
                                            <span style={styles.infoItem}>⚧ {groupe.genre}</span>
                                            <span style={styles.infoItem}>
                                                Places : {places !== undefined ? `${places}/${groupe.capaciteMax}` : '...'}
                                            </span>
                                            {groupe.coachName && (
                                                <span style={styles.infoItem}>Coach : {groupe.coachName}</span>
                                            )}
                                        </div>

                                        {/* boutons admin */}
                                        {user?.role === 'admin' && (
                                            <div>
                                                {/* première rangée — valider + modifier */}
                                                <div style={{ ...styles.buttons, marginBottom: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleToggle(groupe.id)}
                                                        style={groupe.estValide ? styles.btnDesactiver : styles.btnActiver}
                                                    >
                                                        {groupe.estValide ? 'Invalider' : 'Valider'}
                                                    </button>
                                                    <button onClick={() => handleEditGroupe(groupe)} style={styles.btnWaitlist}>
                                                        Modifier
                                                    </button>
                                                </div>
                                                {/* deuxième rangée — supprimer */}
                                                <div style={styles.buttons}>
                                                    <button onClick={() => handleDelete(groupe.id)} style={styles.btnDelete}>
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* boutons coach */}
                                        {user?.role === 'coach' && (
                                            <div style={styles.buttons}>
                                                {/* modifier */}
                                                <button onClick={() => handleEditGroupe(groupe)} style={styles.btnWaitlist}>
                                                    Modifier
                                                </button>
                                                {/* supprimer */}
                                                <button onClick={() => handleDelete(groupe.id)} style={styles.btnDelete}>
                                                    Supprimer
                                                </button>
                                            </div>
                                        )}

                                        {/* boutons client — seulement si groupe validé */}
                                        {(user?.role === 'client' || !isLoggedIn) && groupe.estValide && (
                                    <div style={styles.buttons}>
                                        <button
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                            navigate(`/login?redirect=/groupes?courseId=${courseId}`);
                                            return;
                                            }
                                            // rediriger vers le formulaire de paiement avec courseId et groupeId
                                            navigate(`/payment?courseId=${courseId}&groupeId=${groupe.id}`);
                                        }}
                                        style={complet ? styles.btnDisabled : styles.btnReserver}
                                        disabled={complet}
                                        >
                                        {complet ? 'Complet' : 'Réserver'}
                                        </button>
                                        {/* liste d'attente si complet */}
                                        {complet && isLoggedIn && (
                                        <button onClick={() => handleWaitlist(groupe.id)} style={styles.btnWaitlist}>
                                            Liste d'attente
                                        </button>
                                        )}
                                    </div>
                                    )}

                                        {/* message si non connecté */}
                                        {!isLoggedIn && groupe.estValide && (
                                            <p style={styles.loginMsg}>
                                                Connectez-vous pour réserver
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* message si aucun groupe */}
            {groupesFiltres.length === 0 && !error && (
                <p style={styles.empty}>Aucun groupe disponible pour ce cours.</p>
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
        fontSize: '0.9rem',
    },
    breadcrumbLink: {
        color: '#f47c20',
        textDecoration: 'none',
    },
    breadcrumbSep: {
        color: '#666',
        margin: '0 0.3rem',
    },
    breadcrumbCurrent: {
        color: '#1a2f5e',
        fontWeight: 'bold',
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
        marginBottom: '1.5rem',
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
    filtres: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    filtreGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
    },
    filtreLabel: {
        color: '#1a2f5e',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    filtreSelect: {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.95rem',
        color: '#1a2f5e',
    },
    filtreInput: {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.95rem',
        width: '100px',
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
    error: {
        backgroundColor: '#ffe0e0',
        color: '#cc0000',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        textAlign: 'center',
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
        overflowY: 'auto',
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
    confirmText: {
        color: '#666',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    confirmInfo: {
        backgroundColor: '#f9f9f9',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        border: '1px solid #ddd',
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
        marginBottom: '0.5rem',
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
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
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
    cardInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
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
    empty: {
        textAlign: 'center',
        color: '#666',
        fontSize: '1rem',
        marginTop: '2rem',
    },
};

export default GroupesPage;