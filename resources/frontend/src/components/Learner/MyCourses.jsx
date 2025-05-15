import React, { useState, useEffect } from 'react';
import { getEnrolledCourses } from '@/services/api.js';
import CourseCard from './CourseCard.jsx';
import { Alert, Container, Grid, Typography } from '@mui/material';

const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await getEnrolledCourses();
                console.log('Fetched enrolled courses:', response.data);
                setEnrolledCourses(response.data.courses || []);
            } catch (err) {
                console.error('Failed to fetch enrolled courses:', err);
                setError(err.response?.data?.message || 'Failed to load courses. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <Typography>Loading courses...</Typography>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Mes Cours
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Suivez votre progression dans vos cours actuels.
            </Typography>
            {enrolledCourses.length === 0 ? (
                <Typography>No courses enrolled.</Typography>
            ) : (
                <Grid container spacing={3}>
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
