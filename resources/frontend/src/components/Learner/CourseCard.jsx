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
    Stack,
    Rating,
    Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const CourseCard = ({
    id,
    title,
    description,
    progress,
    lastAccessed,
    image,
    level,
    students,
    rating
}) => {
    return (
        <Card
            sx={{
                width: '100%', // Takes full width of parent container
                maxWidth: 345, // Maximum width (adjust as needed)
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
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    {level && (
                        <Chip
                            label={level}
                            color={
                                level === 'débutant' ? 'success' :
                                level === 'intermédiaire' ? 'warning' :
                                'error'
                            }
                            size="small"
                        />
                    )}
                    <Chip
                        icon={<PeopleIcon />}
                        label={`${students || 0} étudiants`}
                        size="small"
                        variant="outlined"
                    />
                </Stack>

                <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                    <Link to={`/learner/courses/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {title || 'Untitled Course'}
                    </Link>
                </Typography>

                {description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {description}
                    </Typography>
                )}

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Progression: {progress !== null ? `${progress}%` : '0%'}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={progress || 0}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                            }
                        }}
                    />
                </Box>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <Tooltip title="Note du cours">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating
                                value={rating || 0}
                                precision={0.5}
                                size="small"
                                readOnly
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                ({rating || 0})
                            </Typography>
                        </Box>
                    </Tooltip>
                    <Tooltip title="Dernière consultation">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {lastAccessed ? new Date(lastAccessed).toLocaleDateString() : 'Jamais'}
                            </Typography>
                        </Box>
                    </Tooltip>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
