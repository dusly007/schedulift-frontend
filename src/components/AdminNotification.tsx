import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from './Spinner';

interface AdminNotification {
    id: number;
    notificationType: string;
    title: string;
    message: string;
    read: boolean;
    groupeId?: number | null;
    groupeName?: string | null;
    courseTitle?: string | null;
    courseId?: number | null;
    serviceId?: number | null;
    waitlistCount: number;
    createdAt: string;
}

function AdminNotifications() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.get('/admin/notifications');
            setNotifications(res.data);
        } catch (err: any) {
            console.error(err);
            setError('Impossible de charger les notifications admin.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await api.patch(`/admin/notifications/${notificationId}/read`);

            setNotifications(prev =>
                prev.filter(notification => notification.id !== notificationId)
            );
        } catch (err: any) {
            console.error(err);
            setError('Impossible de marquer la notification comme lue.');
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Notifications admin</h2>

                {notifications.length > 0 && (
                    <span style={styles.badge}>
                        {notifications.length}
                    </span>
                )}
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {notifications.length === 0 ? (
                <div style={styles.emptyCard}>
                    <p style={styles.emptyText}>Aucune notification pour le moment.</p>
                </div>
            ) : (
                <div style={styles.list}>
                    {notifications.map(notification => (
                        <div key={notification.id} style={styles.card}>
                            <div style={styles.content}>
                                <h3 style={styles.notificationTitle}>
                                    {notification.title}
                                </h3>

                                <p style={styles.message}>
                                    {notification.message}
                                </p>

                                <div style={styles.meta}>
                                    <span>
                                        Liste d'attente : {notification.waitlistCount} personne
                                        {notification.waitlistCount > 1 ? 's' : ''}
                                    </span>

                                        {notification.groupeName && (
                                        <span>{notification.groupeName}</span>
                                    )}

                                    {notification.courseTitle && (
                                        <span>Cours : {notification.courseTitle}</span>
                                    )}

                                
                                </div>
                            </div>

                            <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                style={styles.button}
                            >
                                Marquer comme lu
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        marginTop: '2rem',
        width: '100%',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
    },
    title: {
        color: '#1a2f5e',
        fontSize: '1.5rem',
        margin: 0,
    },
    badge: {
        backgroundColor: '#f47c20',
        color: 'white',
        borderRadius: '999px',
        padding: '0.25rem 0.75rem',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1.25rem',
        borderLeft: '5px solid #f47c20',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
    },
    content: {
        flex: 1,
    },
    notificationTitle: {
        color: '#1a2f5e',
        fontSize: '1.1rem',
        margin: '0 0 0.5rem 0',
    },
    message: {
        color: '#666',
        fontSize: '0.95rem',
        marginBottom: '0.75rem',
    },
    meta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        color: '#1a2f5e',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#1a2f5e',
        color: 'white',
        border: 'none',
        padding: '0.7rem 1rem',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    emptyCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1.25rem',
    },
    emptyText: {
        color: '#666',
        fontSize: '0.95rem',
        margin: 0,
    },
    error: {
        backgroundColor: '#ffe0e0',
        color: '#cc0000',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
    },
};

export default AdminNotifications;