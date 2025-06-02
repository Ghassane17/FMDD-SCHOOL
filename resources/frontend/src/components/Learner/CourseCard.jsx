import React, { useState, useCallback, useRef } from 'react';
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

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const FALLBACK_IMAGE = '/storage/Test.png';

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
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState(null);
    const imageRef = useRef(null);

    // Initialize image source
    React.useEffect(() => {
        if (!image) {
            setImageSrc(`${API_URL}${FALLBACK_IMAGE}`);
            setIsImageLoading(false);
            return;
        }

        // If image is a full URL, use it directly
        if (image.startsWith('http')) {
            setImageSrc(image);
            return;
        }

        // If image is a relative path, prepend API_URL
        setImageSrc(`${API_URL}${image}`);
    }, [image]);

    // Handle image loading
    const handleImageLoad = useCallback(() => {
        setIsImageLoading(false);
    }, []);

    const handleImageError = useCallback(() => {
        console.log('Image load error, using fallback');
        setImageSrc(`${API_URL}${FALLBACK_IMAGE}`);
        setIsImageLoading(false);
    }, []);

    return (
        <Card
            sx={{
                width: '100%',
                maxWidth: 345,
                height: 420, // Fixed height for the card
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Link to={`/learner/courses/${id}`} style={{ display: 'block', height: '160px' }}>
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '160px', // Fixed height for image container
                        overflow: 'hidden',
                        bgcolor: 'grey.200',
                    }}
                >
                    {isImageLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'grey.200',
                            }}
                        >
                            <LinearProgress sx={{ width: '80%' }} />
                        </Box>
                    )}
                    <CardMedia
                        ref={imageRef}
                        component="img"
                        image={imageSrc}
                        alt={title}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: isImageLoading ? 'none' : 'block',
                        }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                </Box>
            </Link>
            <CardContent sx={{ 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                '&:last-child': { pb: 2 }
            }}>
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

                <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                        mb: 1,
                        fontSize: '1rem',
                        lineHeight: 1.4,
                        height: '2.8em',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
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
                            height: '2.8em',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
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

                <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
                    sx={{ 
                        mt: 'auto',
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}
                >
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
