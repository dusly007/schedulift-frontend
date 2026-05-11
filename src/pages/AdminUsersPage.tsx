import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';

interface User {
    id: number;
    prenom: string;
    nom: string;
    dateNaissance: string;
    sexe: string;
    email: string;
    role: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');

    // modal confirmation suppression
    const [showConfirmId, setShowConfirmId] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users', { withCredentials: true });
            setUsers(res.data);
        } catch {
            setError('Accès refusé ou erreur serveur.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateRole = async (id: number, role: string) => {
        try {
            await api.patch(`/users/${id}/role`, { role }, { withCredentials: true });
            setUsers(users.map(u => u.id === id ? { ...u, role } : u));
            setSuccessMsg('Rôle modifié avec succès.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setError('Erreur lors de la modification du rôle.');
        }
    };

    const handleConfirmDelete = async (id: number) => {
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            setShowConfirmId(null);
            setSuccessMsg('Utilisateur supprimé avec succès.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setError('Erreur lors de la suppression.');
            setShowConfirmId(null);
        }
    };

    // badge couleur selon le rôle
    const getRoleBadgeStyle = (role: string): React.CSSProperties => {
        if (role === 'admin') return styles.badgeAdmin;
        if (role === 'coach') return styles.badgeCoach;
        return styles.badgeClient;
    };

    if (loading) return <Spinner />;

    return (
        <div style={styles.container}>
            {/* modal confirmation suppression */}
            {showConfirmId !== null && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Supprimer l'utilisateur</h2>
                        <p style={styles.modalText}>
                            Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.
                        </p>
                        <div style={styles.modalButtons}>
                            <button
                                onClick={() => handleConfirmDelete(showConfirmId)}
                                style={styles.btnDanger}
                            >
                                Confirmer la suppression
                            </button>
                            <button
                                onClick={() => setShowConfirmId(null)}
                                style={styles.btnSecondaire}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 style={styles.title}>Gestion des utilisateurs</h1>

            {/* message succès */}
            {successMsg && <p style={styles.success}>{successMsg}</p>}

            {/* erreur */}
            {error && <p style={styles.error}>{error}</p>}

            {/* nombre d'utilisateurs */}
            <p style={styles.count}>{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>

            {/* tableau des utilisateurs */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Prénom</th>
                            <th style={styles.th}>Nom</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Date de naissance</th>
                            <th style={styles.th}>Sexe</th>
                            <th style={styles.th}>Rôle actuel</th>
                            <th style={styles.th}>Changer le rôle</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>{user.prenom}</td>
                                <td style={styles.td}>{user.nom}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>
                                    {user.dateNaissance
                                        ? new Date(user.dateNaissance).toLocaleDateString('fr-CA')
                                        : '—'}
                                </td>
                                <td style={styles.td}>{user.sexe || '—'}</td>
                                <td style={styles.td}>
                                    <span style={getRoleBadgeStyle(user.role)}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <select
                                        value={user.role}
                                        onChange={e => updateRole(user.id, e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="client">client</option>
                                        <option value="coach">coach</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                                <td style={styles.td}>
                                    <button
                                        onClick={() => setShowConfirmId(user.id)}
                                        style={styles.btnDelete}
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* aucun utilisateur */}
            {users.length === 0 && !error && (
                <p style={styles.empty}>Aucun utilisateur pour le moment.</p>
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
    title: {
        color: '#1a2f5e',
        fontSize: '2rem',
        textAlign: 'center',
        marginBottom: '2rem',
    },
    count: {
        color: '#666',
        fontSize: '0.85rem',
        marginBottom: '1rem',
        textAlign: 'right',
    },
    success: {
        backgroundColor: '#e6f4ea',
        color: '#2d7a3a',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        textAlign: 'center',
        fontWeight: 'bold',
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
    // badges rôle
    badgeAdmin: {
        backgroundColor: '#fce8d5',
        color: '#f47c20',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    badgeCoach: {
        backgroundColor: '#e6f0ff',
        color: '#1a2f5e',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    badgeClient: {
        backgroundColor: '#e6f4ea',
        color: '#2d7a3a',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    select: {
        padding: '0.4rem 0.75rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.85rem',
        color: '#1a2f5e',
        cursor: 'pointer',
    },
    btnDelete: {
        backgroundColor: 'transparent',
        color: '#cc0000',
        border: '1px solid #cc0000',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        cursor: 'pointer',
    },
};