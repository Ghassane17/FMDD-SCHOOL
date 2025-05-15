import React from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    LinearProgress,
    Box,
    Chip,
} from '@mui/material';

const CourseCard = ({ id, title, progress, lastAccessed, image, level }) => {
    console.log('CourseCard props:', { id, title, progress, lastAccessed, image, level });

    return (
        <Card
            sx={{
                maxWidth: 345,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Link to={`/learner/courses/${id}`}>
                <CardMedia
                    component="img"
                    height="140"
                    image={image || 'https://via.placeholder.com/150'}
                    alt={title}
                    sx={{ objectFit: 'cover' }}
                />
            </Link>
            <CardContent sx={{ flexGrow: 1 }}>
                {level && (
                    <Box sx={{ mb: 1 }}>
                        <Chip
                            label={level}
                            color={
                                level === 'débutant' ? 'success' : level === 'intermédiaire' ? 'warning' : 'error'
                            }
                            size="small"
                        />
                    </Box>
                )}
                <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                    <Link to={`/learner/courses/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {title || 'Untitled Course'}
                    </Link>
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Progress: {progress !== null ? `${progress}%` : '0%'}
                    </Typography>
                    <LinearProgress variant="determinate" value={progress || 0} sx={{ mt: 1 }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Last Accessed: {lastAccessed ? new Date(lastAccessed).toLocaleDateString() : 'Never'}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
