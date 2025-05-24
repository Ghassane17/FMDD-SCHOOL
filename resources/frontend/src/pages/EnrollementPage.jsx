import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseDetails, enrollNow, leaveCourse } from '@/services/api';
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
    Chip,
    Paper,
    Avatar,
    Stack,
    Divider,
    Rating,
    LinearProgress
} from '@mui/material';
import {
    CheckCircle,
    PlayArrow,
    Schedule,
    Group,
    Star,
    Language,
    DevicesOther,
    CloudDownload,
    Assignment,
    VideoLibrary,
    Quiz,
    School,
    WorkspacePremium,
    AccessTime,
    Person
} from '@mui/icons-material';

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
            // Navigate to the course learning page after successful enrollment
            navigate(`/learner/courses/${id}/learn`);
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

    const handleLeaveCourse = async () => {
        try {
            await leaveCourse(id);
            setIsEnrolled(false);
            // Optionally re-fetch course details to update students count
            const data = await courseDetails(id);
            setCourse(data.course);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to leave the course.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: '#f8fafc' 
            }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (error || !course) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, minHeight: '100vh', bgcolor: '#f8fafc' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                        {error || 'No course data available.'}
                    </Alert>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate(-1)}
                        size="large"
                    >
                        Go Back
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Hero Section - Enhanced */}
            <Box sx={{ 
                bgcolor: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                py: { xs: 4, md: 8 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }
            }}>
                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
                        <Grid item xs={12} lg={7}>
                            {/* Course Badge */}
                            <Box sx={{ mb: 3 }}>
                                <Chip
                                    label={course.level}
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.15)', 
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        px: 2,
                                        py: 0.5,
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                />
                            </Box>

                            {/* Course Title */}
                            <Typography 
                                variant="h2" 
                                fontWeight="800" 
                                gutterBottom
                                sx={{ 
                                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                    lineHeight: 1.1,
                                    mb: 3
                                }}
                            >
                                {course.title}
                            </Typography>

                            {/* Course Description */}
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    opacity: 0.9, 
                                    mb: 4, 
                                    lineHeight: 1.6,
                                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                                    maxWidth: '90%'
                                }}
                            >
                                {course.description}
                            </Typography>
                            
                            {/* Course Stats - Enhanced */}
                            <Box sx={{ 
                                mb: 4,
                                p: 3,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                borderRadius: 3,
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={6} sm={4}>
                                        <Stack alignItems="center" spacing={1}>
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <Star sx={{ color: '#fbbf24', fontSize: 20 }} />
                                                <Typography fontWeight="700" fontSize="1.25rem">
                                                    {course.rating}
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center' }}>
                                                ({course.students_count?.toLocaleString() || 0} reviews)
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <Stack alignItems="center" spacing={1}>
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <Group sx={{ fontSize: 20 }} />
                                                <Typography fontWeight="700" fontSize="1.25rem">
                                                    {course.students_count?.toLocaleString() || 0}
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                students
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Stack alignItems="center" spacing={1}>
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <Schedule sx={{ fontSize: 20 }} />
                                                <Typography fontWeight="700" fontSize="1.25rem">
                                                    {course.duration_hours}h
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                total length
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Instructor Info - Enhanced */}
                            <Paper sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 3,
                                color: 'white'
                            }}>
                                <Stack direction="row" alignItems="center" spacing={3}>
                                    <Avatar 
                                        src={course.instructor.avatar} 
                                        sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}
                                    >
                                        <Person />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                                            Instructor
                                        </Typography>
                                        <Typography variant="h6" fontWeight="600">
                                            {course.instructor.name}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} lg={5}>
                            {/* Enrollment Card - Enhanced */}
                            <Box sx={{ 
                                position: 'sticky',
                                top: 20,
                                maxWidth: 450,
                                mx: 'auto'
                            }}>
                                <Card sx={{ 
                                    borderRadius: 4, 
                                    overflow: 'hidden',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <CardMedia
                                        component="img"
                                        height="240"
                                        image={course.course_thumbnail}
                                        alt={course.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ p: 4 }}>
                                        {isEnrolled ? (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 3 }} />
                                                <Typography variant="h5" fontWeight="700" gutterBottom>
                                                    You're Enrolled!
                                                </Typography>
                                                <Typography color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                                                    Continue your learning journey
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        size="large"
                                                        startIcon={<PlayArrow />}
                                                        onClick={() => navigate(`/learner/courses/${id}/learn`)}
                                                        sx={{ 
                                                            py: 2, 
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            fontSize: '1.1rem',
                                                            borderRadius: 2
                                                        }}
                                                    >
                                                        Continue Course
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        size="large"
                                                        color="error"
                                                        onClick={handleLeaveCourse}
                                                        sx={{ 
                                                            py: 2, 
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            fontSize: '1.1rem',
                                                            borderRadius: 2
                                                        }}
                                                    >
                                                        Leave Course
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    size="large"
                                                    onClick={handleEnroll}
                                                    disabled={isEnrolling}
                                                    sx={{ 
                                                        py: 2, 
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        fontSize: '1.1rem',
                                                        mb: 3,
                                                        borderRadius: 2,
                                                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                                                    }}
                                                >
                                                    {isEnrolling ? (
                                                        <CircularProgress size={24} color="inherit" />
                                                    ) : (
                                                        "Enroll Now"
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Main Content - Enhanced Layout */}
            <Container maxWidth="xl" sx={{ 
                py: { xs: 3, md: 4 },
                px: { xs: 2, md: 3 }
            }}>
                <Grid container spacing={3}>
                    {/* Main Content */}
                    <Grid item xs={12} lg={6}>
                        <Stack spacing={3}>
                            {/* What You'll Learn - Enhanced */}
                            <Paper sx={{ 
                                p: { xs: 2, md: 3 },
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(0, 0, 0, 0.04)',
                                height: '100%'
                            }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h4" fontWeight="700" gutterBottom>
                                        What you'll learn
                                    </Typography>
                                    <Typography color="text.secondary" fontSize="1.1rem">
                                        Master these key skills and concepts
                                    </Typography>
                                </Box>
                                <Stack spacing={2}>
                                    {[
                                        "Master essential concepts and fundamentals",
                                        "Apply skills through hands-on projects",
                                        "Learn industry best practices and standards"
                                    ].map((outcome, index) => (
                                        <Stack key={index} direction="row" spacing={2} alignItems="center">
                                            <CheckCircle sx={{ 
                                                color: 'success.main', 
                                                fontSize: 24,
                                                flexShrink: 0
                                            }} />
                                            <Typography variant="body1" fontSize="1.1rem" fontWeight={500}>
                                                {outcome}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>

                            {/* Course Content Overview - Enhanced */}
                            <Paper sx={{ 
                                p: { xs: 2, md: 3 },
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(0, 0, 0, 0.04)',
                                height: '100%'
                            }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h4" fontWeight="700" gutterBottom>
                                        Course content
                                    </Typography>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        <Typography color="text.secondary" fontSize="1.1rem">
                                            {course.modules?.length || 0} modules
                                        </Typography>
                                        <Typography color="text.secondary" fontSize="1.1rem">
                                            •
                                        </Typography>
                                        <Typography color="text.secondary" fontSize="1.1rem">
                                           About {Math.floor((course.modules?.reduce((acc, module) => acc + module.duration, 0) || 0) / 60)} hours in total
                                        </Typography>
                                    </Stack>
                                </Box>
                                
                                {/* Course Modules - Enhanced */}
                                <Stack spacing={2}>
                                    {course.modules?.map((module, index) => (
                                        <Box key={module.id} sx={{ 
                                            p: 2,
                                            border: '1px solid #e2e8f0', 
                                            borderRadius: 2,
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': { 
                                                bgcolor: '#f8fafc',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                            }
                                        }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Box sx={{ flex: 1 }}>
                                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                                                        <Typography 
                                                            variant="body2" 
                                                            color="primary" 
                                                            fontWeight="600"
                                                            sx={{ 
                                                                bgcolor: 'primary.main',
                                                                color: 'white',
                                                                px: 1.5,
                                                                py: 0.5,
                                                                borderRadius: 1,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        >
                                                            Module {index + 1}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {Math.floor(module.duration / 60)}h {module.duration % 60}m
                                                        </Typography>
                                                    </Stack>
                                                    <Typography fontWeight="600" fontSize="1.1rem">
                                                        {module.title}
                                                    </Typography>
                                                </Box>
                                                <PlayArrow color="action" sx={{ fontSize: 24 }} />
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>

                            {/* Instructor - Enhanced */}
                            <Paper sx={{ 
                                p: { xs: 2, md: 3 },
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(0, 0, 0, 0.04)',
                                height: '100%'
                            }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h4" fontWeight="700" gutterBottom>
                                        Your instructor
                                    </Typography>
                                    <Typography color="text.secondary" fontSize="1.1rem">
                                        Learn from an industry expert
                                    </Typography>
                                </Box>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
                                    <Avatar 
                                        src={course.instructor.avatar} 
                                        sx={{ 
                                            width: 96,
                                            height: 96,
                                            bgcolor: 'primary.main',
                                            alignSelf: { xs: 'center', sm: 'flex-start' }
                                        }}
                                    >
                                        <Person sx={{ fontSize: 48 }} />
                                    </Avatar>
                                    <Box sx={{ flex: 1, width: '100%' }}>
                                        <Typography variant="h5" fontWeight="700" gutterBottom>
                                            {course.instructor.name}
                                        </Typography>
                                        <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                                            {course.instructor.bio}
                                        </Typography>
                                        
                                        <Stack spacing={3}>
                                            {/* Skills */}
                                            <Box>
                                                <Typography variant="h6" fontWeight="600" gutterBottom>
                                                    Skills & Expertise
                                                </Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    {course.instructor.skills?.[0]?.map((skill, index) => (
                                                        <Chip 
                                                            key={index}
                                                            label={skill}
                                                            variant="outlined"
                                                            sx={{ mb: 1 }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>

                                            {/* Certifications */}
                                            {course.instructor.certifications?.length > 0 && (
                                                <Box>
                                                    <Typography variant="h6" fontWeight="600" gutterBottom>
                                                        Certifications
                                                    </Typography>
                                                    <Stack spacing={2}>
                                                        {course.instructor.certifications?.map((cert, index) => (
                                                            <Box key={index} sx={{ 
                                                                p: 2,
                                                                bgcolor: '#f8fafc',
                                                                borderRadius: 2,
                                                                border: '1px solid #e2e8f0'
                                                            }}>
                                                                <Typography variant="body1" fontWeight="600">
                                                                    {cert.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {cert.institution}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}

                                            {/* Languages */}
                                            {course.instructor.languages?.length > 0 && (
                                                <Box>
                                                    <Typography variant="h6" fontWeight="600" gutterBottom>
                                                        Languages
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                        {course.instructor.languages?.map((lang, index) => (
                                                            <Chip 
                                                                key={index}
                                                                label={lang.name}
                                                                variant="outlined"
                                                                sx={{ mb: 1 }}
                                                            />
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Sidebar - Enhanced */}
                    <Grid item xs={12} lg={6}>
                        <Box sx={{ position: 'sticky', top: 20 }}>
                            <Stack spacing={3}>
                                {/* Course Features - Enhanced */}
                                <Paper sx={{ 
                                    p: { xs: 2, md: 3 },
                                    borderRadius: 2,
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid rgba(0, 0, 0, 0.04)',
                                    height: '100%'
                                }}>
                                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
                                        This course includes:
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[
                                            { icon: <Assignment />, text: `${course.modules?.length || 0} modules` },
                                            { icon: <CloudDownload />, text: "Downloadable resources" },
                                            { icon: <WorkspacePremium />, text: "Certificate of completion" },
                                            { icon: <AccessTime />, text: "Full access" }
                                        ].map((feature, index) => (
                                            <Stack key={index} direction="row" spacing={2} alignItems="center">
                                                <Box sx={{ 
                                                    color: 'primary.main',
                                                    bgcolor: 'primary.50',
                                                    p: 1,
                                                    borderRadius: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {feature.icon}
                                                </Box>
                                                <Typography variant="body1" fontWeight="500">
                                                    {feature.text}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Paper>

                                {/* Requirements - Enhanced */}
                                <Paper sx={{ 
                                    p: { xs: 2, md: 3 },
                                    borderRadius: 2,
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid rgba(0, 0, 0, 0.04)',
                                    height: '100%'
                                }}>
                                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
                                        Requirements
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[
                                            `${course.level} level knowledge`,
                                            'Basic computer skills',
                                            'Willingness to learn'
                                        ].map((requirement, index) => (
                                            <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                                                <Box sx={{ 
                                                    width: 8,
                                                    height: 8,
                                                    bgcolor: 'primary.main', 
                                                    borderRadius: '50%',
                                                    mt: 1,
                                                    flexShrink: 0
                                                }} />
                                                <Typography variant="body1" color="text.secondary">
                                                    {requirement}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default EnrollmentPage;