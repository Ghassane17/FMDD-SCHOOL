import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearnerDashboard } from '../services/api';
import LearnerStats from '../components/Learner/LearnerStats.jsx';
import StatsCard from '../components/Learner/StatsCard.jsx';
import CourseSection from '../components/Learner/CourseSection.jsx';

const LearnerDashboardPage = () => {
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'learner') {
            setError('Unauthorized access');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000); //go back to log in
            return;
        }

        const fetchDashboard = async () => {
            try {
                const response = await getLearnerDashboard();
                setDashboard(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [navigate]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <LearnerStats
                    school={dashboard.school}
                    userName={dashboard.user.name}
                    lastLogin={dashboard.last_connection}
                    avatar={dashboard.user.avatar}
                />
                <StatsCard
                    totalCourses={dashboard.courses_enrolled}
                    completedCourses={dashboard.courses_completed}
                    lastActivity={dashboard.last_connection}
                />
                <CourseSection
                    link="all-enrolled-courses"
                    title="MES COURS"
                    courses={dashboard.enrolled_courses}
                />
            </div>
        </div>
    );
};

export default LearnerDashboardPage;
