import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseDetails, enrollNow } from '@/services/api';
import {
    Container,
    Typography,
    Button,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Alert,
    Box,
    Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const EnrollmentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await courseDetails(id);
                if (!data.course || typeof data.is_enrolled === 'undefined') {
                    throw new Error('Invalid response format');
                }
                setCourse(data.course);
                setIsEnrolled(data.is_enrolled);
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Course not found.');
                } else if (err.response?.status === 400) {
                    setError('Invalid course ID.');
                } else {
                    setError('Failed to load course details.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleEnroll = async () => {
        setIsEnrolling(true);
        try {
            await enrollNow(id);
            setIsEnrolled(true);
            // Optionally re-fetch course details to update students count
            const data = await courseDetails(id);
            setCourse(data.course);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login', { state: { from: `/courses/${id}` } });
            } else {
                setError(err.response?.data?.message || 'Failed to enroll in the course.');
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !course) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'No course data available.'}</Alert>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Retour
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" gutterBottom>
                        {course.title}
                    </Typography>
                    <Chip
                        label={course.level}
                        color="primary"
                        size="small"
                        sx={{ mb: 2 }}
                        aria-label={`Course level: ${course.level}`}
                    />
                    <Typography variant="body1" paragraph>
                        {course.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Instructor: {course.instructor.username}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Typography color="text.secondary">
                            ⭐ {course.rating}
                        </Typography>
                        <Typography color="text.secondary">
                            👥 {course.students} apprenants
                        </Typography>
                        <Typography color="text.secondary">
                            ⏱ {course.duration_hours} hours
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ position: 'sticky', top: 20 }}>
                        <CardMedia
                            component="img"
                            height="140"
                            image={course.course_thumbnail}
                            alt={course.title}
                        />
                        <CardContent>
                            {isEnrolled ? (
                                <Box sx={{ textAlign: 'center', color: 'success.main' }}>
                                    <CheckCircleIcon fontSize="large" />
                                    <Typography variant="h6" sx={{ mt: 1 }}>
                                        Vous êtes inscrit
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={() => navigate(`/learner/courses/${id}/learn`)}
                                    >
                                        Continuer le cours
                                    </Button>
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="h6" gutterBottom>
                                        Commencez maintenant
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        onClick={handleEnroll}
                                        disabled={isEnrolling}
                                        sx={{ py: 1.5 }}
                                    >
                                        {isEnrolling ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            "S'inscrire gratuitement"
                                        )}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default EnrollmentPage;
