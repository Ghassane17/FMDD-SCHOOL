import React, { useEffect, useState } from 'react';
import { getAllCourses } from '../../services/api.js';
import CourseCard from './CourseCard.jsx';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Chip
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';

const SuggestedCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('rating-desc');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await getAllCourses();
                setCourses(response.data.courses || []);
            } catch (err) {
                setError(err.message || 'Failed to load courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const getSuggestedCourses = () => {
        // Since we don't have isSuggested or rating in the data, show all courses
        const suggested = courses;

        // Sort the courses
        return [...suggested].sort((a, b) => {
            switch (sortOption) {
                case 'rating-desc':
                    return (b.rating || 0) - (a.rating || 0);
                case 'rating-asc':
                    return (a.rating || 0) - (b.rating || 0);
                case 'popularity-desc':
                    return (b.students || 0) - (a.students || 0);
                case 'popularity-asc':
                    return (a.students || 0) - (b.students || 0);
                default:
                    return 0;
            }
        });
    };

    const suggestedCourses = getSuggestedCourses();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ my: 3 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                mb={4}
            >
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Cours Suggérés
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Voici des formations choisies spécialement pour vous
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                        icon={<TrendingUpIcon />}
                        label={`${suggestedCourses.length} cours suggérés`}
                        color="primary"
                        variant="outlined"
                    />

                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel id="sort-label">Trier par</InputLabel>
                        <Select
                            labelId="sort-label"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            label="Trier par"
                            startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                        >
                            <MenuItem value="rating-desc">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <StarIcon fontSize="small" />
                                    <span>Meilleures notes</span>
                                </Stack>
                            </MenuItem>
                            <MenuItem value="rating-asc">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <StarIcon fontSize="small" />
                                    <span>Notes croissantes</span>
                                </Stack>
                            </MenuItem>
                            <MenuItem value="popularity-desc">Plus populaires</MenuItem>
                            <MenuItem value="popularity-asc">Moins populaires</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>

            {suggestedCourses.length > 0 ? (
                <Grid container spacing={3}>
                    {suggestedCourses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                            <CourseCard
                                id={course.id}
                                title={course.title}
                                description={course.description}
                                image={course.course_thumbnail}
                                level={course.level}
                                students={course.students || 0}
                                rating={course.rating || 0}
                                instructor={course.instructor?.name || 'Unknown Instructor'}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box textAlign="center" py={6}>
                    <Typography variant="h6" color="text.secondary">
                        Aucun cours suggéré disponible pour le moment
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default SuggestedCourses;
