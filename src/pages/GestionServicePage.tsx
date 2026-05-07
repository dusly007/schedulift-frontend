import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

interface Service {
    id: number;
    nom: string;
    description: string;
    imageUrl: string;
}

function GestionServicesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [services, setServices] = useState<Service[]>([]);
    const [error, setError] = useState('');

    // recherche par nom
    const [recherche, setRecherche] = useState('');

    // modal création
    const [showModal, setShowModal] = useState(false);
    const [newNom, setNewNom] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    // mode édition
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editNom, setEditNom] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');

    useEffect(() => {
        // rediriger si pas coach ou admin
        if (user && user.role !== 'coach' && user.role !== 'admin') {
            navigate('/');
            return;
        }

        // charger tous les services
        api.get('/services')
            .then(res => setServices(res.data))
            .catch(() => setError('Erreur lors du chargement des services'));
    }, [user]);

    // recharger les services
    const rechargerServices = async () => {
        const res = await api.get('/services');
        setServices(res.data);
    };

    // appliquer la recherche localement
    const servicesFiltres = services.filter(service =>
        service.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        service.description?.toLowerCase().includes(recherche.toLowerCase())
    );

    // créer un service — admin seulement
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/services', {
                nom: newNom,
                description: newDescription,
                imageUrl: newImageUrl || undefined,
            });
            // fermer modal et reset champs
            setShowModal(false);
            setNewNom('');
            setNewDescription('');
            setNewImageUrl('');
            await rechargerServices();
            alert('Service créé avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    // ouvrir mode édition
    const handleEdit = (service: Service) => {
        setEditingId(service.id);
        setEditNom(service.nom);
        setEditDescription(service.description);
        setEditImageUrl(service.imageUrl || '');
    };

    // sauvegarder modifications
    const handleSave = async (id: number) => {
        try {
            await api.patch(`/services/${id}`, {
                nom: editNom,
                description: editDescription,
                imageUrl: editImageUrl || undefined,
            });
            setEditingId(null);
            await rechargerServices();
            alert('Service modifié avec succès !');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la modification');
        }
    };

    // supprimer un service — admin seulement
    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer ce service ?')) return;
        try {
            await api.delete(`/services/${id}`);
            setServices(services.filter(s => s.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    return (
        <div style={styles.container}>
            {/* navigation entre les trois pages de gestion */}
            <div style={styles.tabs}>
                <Link to="/gestion/services" style={styles.tabActive}>Services</Link>
                <Link to="/gestion/cours" style={styles.tab}>Cours</Link>
                <Link to="/gestion/groupes" style={styles.tab}>Groupes</Link>
            </div>

            <h1 style={styles.title}>Gestion des services</h1>

            {/* barre de recherche + bouton créer */}
            <div style={styles.topBar}>
                {/* recherche par nom ou description */}
                <input
                    value={recherche}
                    onChange={e => setRecherche(e.target.value)}
                    style={styles.searchInput}
                    placeholder="Rechercher par nom ou description..."
                />

                {/* nombre de résultats */}
                <span style={styles.resultCount}>
                    {servicesFiltres.length} service{servicesFiltres.length > 1 ? 's' : ''}
                </span>

                {/* bouton créer — admin seulement */}
                {user?.role === 'admin' && (
                    <button onClick={() => setShowModal(true)} style={styles.btnCreate}>
                        + Créer un service
                    </button>
                )}
            </div>

            {/* modal création */}
            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Créer un service</h2>
                        <form onSubmit={handleCreate}>
                            <div style={styles.field}>
                                <label style={styles.label}>Nom</label>
                                <input value={newNom} onChange={e => setNewNom(e.target.value)} style={styles.input} placeholder="ex: Musculation" required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Description</label>
                                <input value={newDescription} onChange={e => setNewDescription(e.target.value)} style={styles.input} placeholder="Description du service" required />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>URL de l'image</label>
                                <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} style={styles.input} placeholder="https://..." />
                            </div>
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

            {/* tableau des services filtrés */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Image</th>
                            <th style={styles.th}>Nom</th>
                            <th style={styles.th}>Description</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicesFiltres.map(service => (
                            <tr key={service.id} style={styles.tr}>
                                {/* mode édition */}
                                {editingId === service.id ? (
                                    <>
                                        <td style={styles.td}>
                                            <input value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} style={styles.inputInline} placeholder="URL image" />
                                        </td>
                                        <td style={styles.td}>
                                            <input value={editNom} onChange={e => setEditNom(e.target.value)} style={styles.inputInline} />
                                        </td>
                                        <td style={styles.td}>
                                            <input value={editDescription} onChange={e => setEditDescription(e.target.value)} style={styles.inputInline} />
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {/* sauvegarder */}
                                                <button onClick={() => handleSave(service.id)} style={styles.btnSave}>✓</button>
                                                {/* annuler édition */}
                                                <button onClick={() => setEditingId(null)} style={styles.btnAnnuler}>✕</button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={styles.td}>
                                            {/* image du service */}
                                            {service.imageUrl && (
                                                <img src={service.imageUrl} alt={service.nom} style={styles.thumbnail} />
                                            )}
                                        </td>
                                        <td style={styles.td}>{service.nom}</td>
                                        <td style={styles.td}>{service.description}</td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {/* modifier — admin seulement */}
                                                {user?.role === 'admin' && (
                                                    <button onClick={() => handleEdit(service)} style={styles.btnEdit}>
                                                        Modifier
                                                    </button>
                                                )}
                                                {/* voir les cours du service */}
                                                <button
                                                    onClick={() => navigate(`/gestion/cours?serviceId=${service.id}`)}
                                                    style={styles.btnCours}
                                                >
                                                    Cours →
                                                </button>
                                                {/* supprimer — admin seulement */}
                                                {user?.role === 'admin' && (
                                                    <button onClick={() => handleDelete(service.id)} style={styles.btnDelete}>
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* message si aucun service */}
            {servicesFiltres.length === 0 && !error && (
                <p style={styles.empty}>
                    {recherche ? `Aucun service trouvé pour "${recherche}"` : 'Aucun service pour le moment.'}
                </p>
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
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
    },
    searchInput: {
        flex: 1,
        minWidth: '200px',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
    },
    resultCount: {
        color: '#666',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
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
        whiteSpace: 'nowrap',
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
    thumbnail: {
        width: '60px',
        height: '45px',
        objectFit: 'cover',
        borderRadius: '4px',
    },
    inputInline: {
        padding: '0.4rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
        width: '100%',
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
    btnCours: {
        backgroundColor: '#1a2f5e',
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

export default GestionServicesPage;