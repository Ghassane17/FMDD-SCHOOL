import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearnerDashboard } from '../services/api';
import LearnerStats from '../components/Learner/LearnerStats.jsx';
import StatsCard from '../components/Learner/StatsCard.jsx';
import CourseCard from '../components/Learner/CourseCard.jsx';
import { Alert, Container, Grid, Typography } from '@mui/material';

const LearnerDashboardPage = () => {
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'learner') {
            setError('Access denied. Please log in as a learner.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const fetchDashboard = async () => {
            try {
                const response = await getLearnerDashboard(true); // Force refresh to avoid cache
                console.log('Fetched learner dashboard:', response.data);
                setDashboard(response.data);
            } catch (err) {
                console.error('Failed to fetch dashboard:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to load dashboard. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [navigate]);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!dashboard) return <Alert severity="warning">No dashboard data available.</Alert>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <LearnerStats
                school={dashboard.school}
                userName={dashboard.user?.name}
                lastLogin={dashboard.last_connection}
                avatar={dashboard.user?.avatar}
            />
            <StatsCard
                totalCourses={dashboard.courses_enrolled}
                completedCourses={dashboard.courses_completed}
                lastActivity={dashboard.last_connection}
            />
            <Typography variant="h5" sx={{ my: 3 }}>
                Mes Cours
            </Typography>
            {dashboard.enrolled_courses?.length > 0 ? (
                <Grid container spacing={3}>
                    {dashboard.enrolled_courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <CourseCard
                                id={course.id}
                                title={course.title}
                                progress={course.progress}
                                lastAccessed={course.last_accessed}
                                image={course.course_thumbnail}
                                level={course.level}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>No enrolled courses found.</Typography>
            )}
        </Container>
    );
};

export default LearnerDashboardPage;
