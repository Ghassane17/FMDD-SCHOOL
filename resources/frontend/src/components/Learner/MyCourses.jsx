import React, { useState, useEffect } from 'react';
import { getEnrolledCourses } from '@/services/api.js';
import CourseCard from './CourseCard.jsx';
import { Alert, Container, Grid, Typography, Button, Box, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import { lightBlue } from '@mui/material/colors';

const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await getEnrolledCourses();
                setEnrolledCourses(response.data.courses || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load courses. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Skeleton variant="text" width="40%" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 4 }} />
            <Grid container spacing={4}>
                {[...Array(3)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Skeleton variant="rounded" height={300} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );

    if (error) return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Alert severity="error" sx={{ mb: 4 }}>
                {error}
            </Alert>
        </Container>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6 }}>
                <Typography
                    variant="h3"
                    sx={{
                        mb: 2,
                        fontWeight: 700,
                        color: 'primary.main',
                    }}
                >
                    Mes Cours
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    Suivez votre progression et reprenez là où vous vous êtes arrêté
                </Typography>
            </Box>

            {enrolledCourses.length === 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                        textAlign: 'center',
                        py: 8,
                        px: 2,
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <SchoolIcon
                        sx={{
                            fontSize: 80,
                            color: lightBlue[500],
                            mb: 2
                        }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Aucun cours suivi pour le moment
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: '500px',
                            mb: 3
                        }}
                    >
                        Commencez votre apprentissage avec nos cours recommandés spécialement sélectionnés pour vous
                    </Typography>
                    <Button
                        component={Link}
                        to="/learner/suggested-courses"
                        variant="contained"
                        size="large"
                        startIcon={<SchoolIcon />}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                        }}
                    >
                        Découvrir les cours
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={4}>
                    {enrolledCourses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <CourseCard
                                id={course.id}
                                title={course.title}
                                progress={course.progress}
                                lastAccessed={course.last_accessed}
                                image={course.image}
                                level={course.level}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default MyCourses;
