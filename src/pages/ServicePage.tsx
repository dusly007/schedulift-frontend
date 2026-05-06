import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Service {
    id: number;
    nom: string;
    description: string;
    imageUrl: string;
}

function ServicesPage() {
    const navigate = useNavigate();
    const [services, setServices] = useState<Service[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // GET /services au chargement de la page
        api.get('/services')
            .then(res => setServices(res.data))
            .catch(() => setError('Erreur lors du chargement des services'));
    }, []);

    // clic sur un service — rediriger vers les cours de ce service
    const handleServiceClick = (serviceId: number) => {
        navigate(`/courses?serviceId=${serviceId}`);
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Nos services</h1>
            <p style={styles.subtitle}>Choisissez un service pour voir les cours disponibles</p>

            {/* afficher erreur si problème */}
            {error && <p style={styles.error}>{error}</p>}

            {/* afficher les services */}
            <div style={styles.grid}>
                {services.map(service => (
                    <div
                        key={service.id}
                        style={styles.card}
                        onClick={() => handleServiceClick(service.id)}
                    >
                        {/* image du service */}
                        {service.imageUrl && (
                            <img
                                src={service.imageUrl}
                                alt={service.nom}
                                style={styles.image}
                            />
                        )}

                        <div style={styles.cardBody}>
                            <h3 style={styles.cardTitle}>{service.nom}</h3>
                            <p style={styles.cardText}>{service.description}</p>

                            {/* bouton voir les cours */}
                            <button style={styles.btnVoir}>
                                Voir les cours →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* message si aucun service */}
            {services.length === 0 && !error && (
                <p style={styles.empty}>Aucun service disponible pour le moment.</p>
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
        marginBottom: '3rem',
        fontSize: '1rem',
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
        width: '280px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    image: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
    },
    cardBody: {
        padding: '1.5rem',
    },
    cardTitle: {
        color: '#1a2f5e',
        fontSize: '1.2rem',
        marginBottom: '0.5rem',
    },
    cardText: {
        color: '#666',
        fontSize: '0.9rem',
        marginBottom: '1rem',
        lineHeight: 1.5,
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

export default ServicesPage;