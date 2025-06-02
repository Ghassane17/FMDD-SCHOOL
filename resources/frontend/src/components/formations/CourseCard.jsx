import React from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip,
    Box,
    Stack,
    Rating,
    Avatar
} from '@mui/material';

const CourseCard = ({ course }) => {
    const levelColors = {
        débutant: 'success',
        intermédiaire: 'warning',
        avancé: 'error'
    };

    return (
        <Card sx={{
            maxWidth: 345,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }
        }}>
            <Link to={`/learner/courses/${course.id}`}>
                <CardMedia
                    component="img"
                    height="160"
                    image={course.image || course.course_thumbnail || '/storage/Test.png'}
                    alt={course.title}
                    loading="lazy"
                    sx={{ objectFit: 'cover' }}
                />
            </Link>
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                        label={course.level}
                        color={levelColors[course.level.toLowerCase()]}
                        size="small"
                    />
                    <Chip
                        label={`${course.students} étudiants`}
                        variant="outlined"
                        size="small"
                    />
                </Stack>

                <Typography gutterBottom variant="h6" component="h3" sx={{ mb: 1 }}>
                    <Link to={`/learner/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {course.title}
                    </Link>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating
                        value={course.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                        {course.rating} ({course.students} avis)
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
                    <Avatar
                        src={course.instructor?.avatar}
                        alt={course.instructor?.name}
                        sx={{ width: 32, height: 32 }}
                    />
                    <Typography variant="body2">
                        Par {course.instructor?.name || 'Unknown'}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
