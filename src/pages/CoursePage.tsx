import { useState, useEffect } from 'react';
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
    const [courses, setCourses] = useState<Course[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // appel GET /courses au chargement de la page
        api.get('/courses')
            .then(res => setCourses(res.data))
            .catch(() => setError('Erreur lors du chargement des cours'));
    }, []);

    return (
            <div style={styles.container}>
            <h1 style={styles.title}>Nos cours</h1>
            <p style={styles.subtitle}>Réservez votre prochaine séance</p>

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