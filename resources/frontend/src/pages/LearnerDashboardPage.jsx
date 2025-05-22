import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearnerDashboard, getAllCourses } from '../services/api';
import LearnerStats from '../components/Learner/LearnerStats.jsx';
import StatsCard from '../components/Learner/StatsCard.jsx';
import CourseCard from '../components/Learner/CourseCard.jsx';
import {
    Alert,
    Container,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Paper,
    Divider,
    Button,
    Stack,
    IconButton,
    Tooltip,
    useTheme,
    Fade,
    Chip,
    Tabs,
    Tab,
    InputAdornment,
    TextField,
    Skeleton,
    Avatar
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    FilterList as FilterListIcon,
    Sort as SortIcon,
    Search as SearchIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    NewReleases as NewReleasesIcon,
    School as SchoolIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as AccessTimeIcon,
    EmojiEvents as EmojiEventsIcon,
    Lightbulb as LightbulbIcon,
    MenuBook as MenuBookIcon
} from '@mui/icons-material';

const LearnerDashboardPage = () => {
    const [dashboard, setDashboard] = useState(null);
    const [allCourses, setAllCourses] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [dashboardResponse, coursesResponse] = await Promise.all([
                getLearnerDashboard(true),
                getAllCourses()
            ]);
            setDashboard(dashboardResponse.data);
            setAllCourses(coursesResponse.data.courses);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'learner') {
            setError('Access denied. Please login as a learner.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        fetchData();
    }, [navigate]);

    const filteredEnrolledCourses = dashboard?.enrolled_courses?.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const filteredAvailableCourses = allCourses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Header Section */}
            <Box sx={{ mb: 6 }}>
                <Paper
                    elevation={4}
                    sx={{
                        p: 5,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 200,
                            height: 200,
                            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="h3" component="h1" sx={{
                                fontWeight: 700,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <SchoolIcon sx={{ fontSize: 40 }} />
                                Welcome Back, {dashboard?.user?.name}!
                            </Typography>
                            <Typography variant="h6" sx={{
                                opacity: 0.9,
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <LightbulbIcon fontSize="small" />
                                Continue your learning journey
                            </Typography>

                            <Stack direction="row" spacing={2}>
                                <Chip
                                    label={`${dashboard?.courses_enrolled || 0} Enrolled`}
                                    color="secondary"
                                    size="medium"
                                    icon={<MenuBookIcon />}
                                    sx={{
                                        color: 'white',
                                        px: 1,
                                        py: 1.5
                                    }}
                                />
                                <Chip
                                    label={`${dashboard?.courses_completed || 0} Completed`}
                                    color="success"
                                    size="medium"
                                    icon={<CheckCircleIcon />}
                                    sx={{
                                        color: 'white',
                                        px: 1,
                                        py: 1.5
                                    }}
                                />
                                <Chip
                                    label={`Last active: ${dashboard?.last_connection || 'Recently'}`}
                                    color="info"
                                    size="medium"
                                    icon={<AccessTimeIcon />}
                                    sx={{
                                        color: 'white',
                                        px: 1,
                                        py: 1.5
                                    }}
                                />
                            </Stack>
                        </Box>
                        <Tooltip title="Refresh Dashboard">
                            <IconButton
                                onClick={fetchData}
                                disabled={refreshing}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease',
                                    width: 56,
                                    height: 56
                                }}
                            >
                                {refreshing ?
                                    <CircularProgress size={28} color="inherit" /> :
                                    <RefreshIcon sx={{ fontSize: 28 }} />
                                }
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>
            </Box>

            {/* Stats and Profile Section */}
           {/* <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={4} sx={{
                        p: 4,
                        height: '100%',
                        borderRadius: 3,
                        borderLeft: `6px solid ${theme.palette.secondary.main}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: theme.shadows[8]
                        }
                    }}>
                        <LearnerStats
                            school="FMDD SCHOOL"
                            userName={dashboard?.user?.name}
                            lastLogin={dashboard?.last_connection}
                            avatar={dashboard?.user?.avatar}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper elevation={4} sx={{
                        p: 4,
                        height: '100%',
                        borderRadius: 3,
                        borderLeft: `6px solid ${theme.palette.info.main}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: theme.shadows[8]
                        }
                    }}>
                        <StatsCard
                            totalCourses={dashboard?.courses_enrolled}
                            completedCourses={dashboard?.courses_completed}
                            lastActivity={dashboard?.last_connection}
                            progress={dashboard?.overall_progress}
                        />
                    </Paper>
                </Grid>
            </Grid>*/}

            {/* Combined Courses Section with Tabs */}
            <Paper elevation={4} sx={{ mb: 6, borderRadius: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTabs-indicator': {
                                height: 4,
                                backgroundColor: theme.palette.primary.main
                            }
                        }}
                    >
                        <Tab
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <TrendingUpIcon />
                                    <span>My Courses</span>
                                    <Chip
                                        label={filteredEnrolledCourses.length}
                                        size="small"
                                        color="primary"
                                        sx={{ color: 'white' }}
                                    />
                                </Box>
                            }
                            sx={{
                                fontWeight: 600,
                                py: 2.5,
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main
                                }
                            }}
                        />
                        <Tab
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <NewReleasesIcon />
                                    <span>Available Courses</span>
                                    <Chip
                                        label={filteredAvailableCourses.length}
                                        size="small"
                                        color="primary"
                                        sx={{ color: 'white' }}
                                    />
                                </Box>
                            }
                            sx={{
                                fontWeight: 600,
                                py: 2.5,
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main
                                }
                            }}
                        />
                    </Tabs>
                </Box>

                {/* Search and Filter Bar */}
                <Box sx={{ p: 4, pb: 0 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                        <TextField
                            placeholder="Search courses..."
                            variant="outlined"
                            size="medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                width: '45%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '& fieldset': {
                                        borderColor: theme.palette.divider
                                    },
                                    '&:hover fieldset': {
                                        borderColor: theme.palette.primary.light
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1,
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2
                                    }
                                }}
                            >
                                Filter
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<SortIcon />}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1,
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2
                                    }
                                }}
                            >
                                Sort
                            </Button>
                        </Stack>
                    </Box>
                    <Divider sx={{ mb: 4 }} />
                </Box>

                {/* Tab Content */}
                <Box sx={{ p: 4 }}>
                    {activeTab === 0 ? (
                        <>
                            {filteredEnrolledCourses.length > 0 ? (
                                <Grid container spacing={4}>
                                    {filteredEnrolledCourses.map((course) => (
                                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                                            <Fade in={true}>
                                                <Box>
                                                    <CourseCard
                                                        id={course.id}
                                                        title={course.title}
                                                        description={course.description}
                                                        progress={course.progress}
                                                        lastAccessed={course.last_accessed}
                                                        image={course.course_thumbnail}
                                                        level={course.level}
                                                        students={course.students}
                                                        rating={course.rating}
                                                        enrolled
                                                    />
                                                </Box>
                                            </Fade>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box textAlign="center" py={8}>
                                    <Avatar sx={{
                                        bgcolor: theme.palette.action.selected,
                                        width: 120,
                                        height: 120,
                                        mb: 4,
                                        mx: 'auto'
                                    }}>
                                        <MenuBookIcon sx={{ fontSize: 60 }} />
                                    </Avatar>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                        {searchQuery ? 'No courses found' : 'No enrolled courses'}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary" sx={{
                                        mb: 4,
                                        maxWidth: 500,
                                        mx: 'auto'
                                    }}>
                                        {searchQuery ?
                                            "We couldn't find any courses matching your search." :
                                            "You haven't enrolled in any courses yet. Browse our catalog to get started!"
                                        }
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => setActiveTab(1)}
                                        startIcon={<NewReleasesIcon />}
                                        sx={{
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                            color: 'white',
                                            px: 5,
                                            py: 1.5,
                                            borderRadius: 3,
                                            boxShadow: theme.shadows[4],
                                            '&:hover': {
                                                boxShadow: theme.shadows[8]
                                            }
                                        }}
                                    >
                                        Browse Courses
                                    </Button>
                                </Box>
                            )}
                        </>
                    ) : (
                        <>
                            {filteredAvailableCourses.length > 0 ? (
                                <Grid container spacing={4}>
                                    {filteredAvailableCourses.map((course) => (
                                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                                            <Fade in={true}>
                                                <Box>
                                                    <CourseCard
                                                        id={course.id}
                                                        title={course.title}
                                                        description={course.description}
                                                        image={course.course_thumbnail}
                                                        level={course.level}
                                                        students={course.students}
                                                        rating={course.rating}
                                                    />
                                                </Box>
                                            </Fade>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box textAlign="center" py={8}>
                                    <Avatar sx={{
                                        bgcolor: theme.palette.action.selected,
                                        width: 120,
                                        height: 120,
                                        mb: 4,
                                        mx: 'auto'
                                    }}>
                                        <SchoolIcon sx={{ fontSize: 60 }} />
                                    </Avatar>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                        {searchQuery ? 'No courses found' : 'No available courses'}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary" sx={{
                                        mb: 4,
                                        maxWidth: 500,
                                        mx: 'auto'
                                    }}>
                                        {searchQuery ?
                                            "We couldn't find any courses matching your search." :
                                            "There are currently no courses available. Please check back later!"
                                        }
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setSearchQuery('')}
                                        startIcon={<RefreshIcon />}
                                        sx={{
                                            px: 5,
                                            py: 1.5,
                                            borderRadius: 3,
                                            borderWidth: 2,
                                            '&:hover': {
                                                borderWidth: 2
                                            }
                                        }}
                                    >
                                        Clear Search
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Paper>

            {/* Motivation Section */}
            <Fade in={true} timeout={1000}>
                <Paper elevation={4} sx={{
                    p: 4,
                    mb: 6,
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark' ?
                        'linear-gradient(135deg, rgba(25, 118, 210, 0.2) 0%, rgba(156, 39, 176, 0.2) 100%)' :
                        'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                    textAlign: 'center',
                    borderLeft: `6px solid ${theme.palette.success.main}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 100,
                        height: 100,
                        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(theme.palette.success.main)}'%3E%3Cpath d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z'/%3E%3C/svg%3E")`,
                        opacity: 0.1,
                        transform: 'rotate(20deg)'
                    }
                }}>
                    <Box display="flex" justifyContent="center" mb={3}>
                        <EmojiEventsIcon sx={{
                            fontSize: 60,
                            color: theme.palette.success.main
                        }} />
                    </Box>
                    <Typography variant="h5" sx={{
                        mb: 2,
                        fontWeight: 600,
                        fontStyle: 'italic'
                    }}>
                        "Education is the most powerful weapon which you can use to change the world."
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                    }}>
                        <LightbulbIcon fontSize="small" />
                        Keep learning and growing every day!
                    </Typography>
                </Paper>
            </Fade>
        </Container>
    );
};

export default LearnerDashboardPage;
