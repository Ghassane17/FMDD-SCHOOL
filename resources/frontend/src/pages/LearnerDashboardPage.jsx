"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getLearnerDashboard, getAllCourses } from "../services/api"
import CourseCard from "../components/Learner/CourseCard.jsx"
import {
    Alert,
    Container,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Paper,
    Button,
    Stack,
    IconButton,
    Tooltip,
    Chip,
    Tabs,
    Tab,
    InputAdornment,
    TextField,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material"
import {
    Refresh as RefreshIcon,
    Sort as SortIcon,
    Search as SearchIcon,
    TrendingUp as TrendingUpIcon,
    NewReleases as NewReleasesIcon,
    School as SchoolIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as AccessTimeIcon,
    EmojiEvents as EmojiEventsIcon,
    Lightbulb as LightbulbIcon,
    MenuBook as MenuBookIcon,
    Star as StarIcon,
} from "@mui/icons-material"

const LearnerDashboardPage = () => {
    const [dashboard, setDashboard] = useState(null)
    const [allCourses, setAllCourses] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOption, setSortOption] = useState("rating-desc")
    const navigate = useNavigate()

    const fetchData = async () => {
        try {
            setRefreshing(true)
            const [dashboardResponse, coursesResponse] = await Promise.all([getLearnerDashboard(true), getAllCourses()])
            setDashboard(dashboardResponse.data)
            setAllCourses(coursesResponse.data.courses)
        } catch (err) {
            console.error("Failed to fetch data:", err)
            setError(err.response?.data?.message || "Failed to load dashboard. Please try again.")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"))
        if (!user || user.role !== "learner") {
            setError("Access denied. Please login as a learner.")
            setLoading(false)
            setTimeout(() => navigate("/login"), 2000)
            return
        }
        fetchData()
    }, [navigate])

    const getSortedEnrolledCourses = () => {
        const filtered =
            dashboard?.enrolled_courses?.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            []

        return [...filtered].sort((a, b) => {
            switch (sortOption) {
                case "rating-desc":
                    return (b.rating || 0) - (a.rating || 0)
                case "rating-asc":
                    return (a.rating || 0) - (b.rating || 0)
                case "popularity-desc":
                    return (b.students || 0) - (a.students || 0)
                case "popularity-asc":
                    return (a.students || 0) - (b.students || 0)
                default:
                    return 0
            }
        })
    }

    const getSortedAvailableCourses = () => {
        const filtered = allCourses.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase()))

        return [...filtered].sort((a, b) => {
            switch (sortOption) {
                case "rating-desc":
                    return (b.rating || 0) - (a.rating || 0)
                case "rating-asc":
                    return (a.rating || 0) - (b.rating || 0)
                case "popularity-desc":
                    return (b.students || 0) - (a.students || 0)
                case "popularity-asc":
                    return (a.students || 0) - (b.students || 0)
                default:
                    return 0
            }
        })
    }

    const sortedEnrolledCourses = getSortedEnrolledCourses()
    const sortedAvailableCourses = getSortedAvailableCourses()

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }

    if (loading) {
        return (
            <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Box className="text-center">
                    <CircularProgress size={40} className="mb-4 text-gray-600" />
                    <Typography variant="body1" className="text-gray-600">
                        Loading your dashboard...
                    </Typography>
                </Box>
            </Box>
        )
    }

    if (error) {
        return (
            <Container maxWidth="md" className="py-16 min-h-screen bg-gray-50">
                <Box className="text-center">
                    <Alert severity="error" className="mb-6">
                        {error}
                    </Alert>
                    <Button variant="contained" onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700">
                        Go to Login
                    </Button>
                </Box>
            </Container>
        )
    }

    return (
        <Box className="min-h-screen bg-gray-50">
            <Container maxWidth="xl" className="py-8">
                {/* Header Section */}
                <Paper className="mb-8 p-6 shadow-sm border border-gray-200">
                    <Box className="flex justify-between items-start">
                        <Box>
                            <Typography variant="h4" className="font-bold text-gray-900 mb-2">
                                Welcome back, {dashboard?.user?.name}!
                            </Typography>
                            <Typography variant="body1" className="text-gray-600 mb-4">
                                Continue your learning journey
                            </Typography>

                            <Stack direction="row" spacing={2} className="flex-wrap gap-2">
                                <Chip
                                    label={`${dashboard?.courses_enrolled || 0} Enrolled`}
                                    icon={<MenuBookIcon />}
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`${dashboard?.courses_completed || 0} Completed`}
                                    icon={<CheckCircleIcon />}
                                    className="bg-green-50 text-green-700 border-green-200"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Last active: ${dashboard?.last_connection || "Recently"}`}
                                    icon={<AccessTimeIcon />}
                                    className="bg-gray-50 text-gray-700 border-gray-200"
                                    variant="outlined"
                                />
                            </Stack>
                        </Box>
                        <Tooltip title="Refresh Dashboard">
                            <IconButton
                                onClick={fetchData}
                                disabled={refreshing}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600"
                            >
                                {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>

                {/* Stats Cards */}
                <Grid container spacing={3} className="mb-8">
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper className="p-4 text-center shadow-sm border border-gray-200">
                            <Typography variant="h4" className="font-bold text-blue-600 mb-1">
                                {dashboard?.overall_progress || 0}%
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Overall Progress
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper className="p-4 text-center shadow-sm border border-gray-200">
                            <Typography variant="h4" className="font-bold text-green-600 mb-1">
                                {dashboard?.courses_enrolled || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Enrolled Courses
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper className="p-4 text-center shadow-sm border border-gray-200">
                            <Typography variant="h4" className="font-bold text-purple-600 mb-1">
                                {dashboard?.courses_completed || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Completed
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper className="p-4 text-center shadow-sm border border-gray-200">
                            <Typography variant="h4" className="font-bold text-orange-600 mb-1">
                                {allCourses.length}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Available Courses
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Courses Section */}
                <Paper className="shadow-sm border border-gray-200">
                    {/* Tabs */}
                    <Box className="border-b border-gray-200">
                        <Tabs value={activeTab} onChange={handleTabChange} className="px-6">
                            <Tab
                                label={
                                    <Box className="flex items-center gap-2">
                                        <TrendingUpIcon />
                                        <span>My Courses</span>
                                        <Chip
                                            label={sortedEnrolledCourses.length}
                                            size="small"
                                            className="bg-blue-100 text-blue-700 text-xs"
                                        />
                                    </Box>
                                }
                                className="font-medium"
                            />
                            <Tab
                                label={
                                    <Box className="flex items-center gap-2">
                                        <NewReleasesIcon />
                                        <span>Available Courses</span>
                                        <Chip
                                            label={sortedAvailableCourses.length}
                                            size="small"
                                            className="bg-blue-100 text-blue-700 text-xs"
                                        />
                                    </Box>
                                }
                                className="font-medium"
                            />
                        </Tabs>
                    </Box>

                    {/* Search and Filter Bar */}
                    <Box className="p-6 pb-4">
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                            <TextField
                                placeholder="Search courses..."
                                variant="outlined"
                                size="medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full max-w-md"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon className="text-gray-400" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                    },
                                }}
                            />
                            <Stack direction="row" spacing={2} alignItems="center">


                                <FormControl sx={{ minWidth: 200 }} size="small">
                                    <InputLabel id="sort-label">Trier par</InputLabel>
                                    <Select
                                        labelId="sort-label"
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        label="Trier par"
                                        startAdornment={<SortIcon sx={{ mr: 1, color: "action.active" }} />}
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
                    </Box>

                    {/* Tab Content */}
                    <Box className="p-6 pt-0">
                        {activeTab === 0 ? (
                            <>
                                {sortedEnrolledCourses.length > 0 ? (
                                    <Grid container spacing={3}>
                                        {sortedEnrolledCourses.map((course) => (
                                            <Grid item xs={12} lg={6} key={course.id}>
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
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Box className="text-center py-12">
                                        <Avatar className="w-20 h-20 bg-gray-100 mx-auto mb-4">
                                            <MenuBookIcon className="text-gray-400 text-3xl" />
                                        </Avatar>
                                        <Typography variant="h6" className="font-semibold mb-2 text-gray-900">
                                            {searchQuery ? "No courses found" : "No enrolled courses"}
                                        </Typography>
                                        <Typography className="text-gray-600 mb-6 max-w-md mx-auto">
                                            {searchQuery
                                                ? "We couldn't find any courses matching your search."
                                                : "You haven't enrolled in any courses yet. Browse our catalog to get started!"}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={() => setActiveTab(1)}
                                            startIcon={<NewReleasesIcon />}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Browse Courses
                                        </Button>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <>
                                {sortedAvailableCourses.length > 0 ? (
                                    <Grid container spacing={3}>
                                        {sortedAvailableCourses.map((course) => (
                                            <Grid item xs={12} lg={6} key={course.id}>
                                                <CourseCard
                                                    id={course.id}
                                                    title={course.title}
                                                    description={course.description}
                                                    image={course.course_thumbnail}
                                                    level={course.level}
                                                    students={course.students}
                                                    rating={course.rating}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Box className="text-center py-12">
                                        <Avatar className="w-20 h-20 bg-gray-100 mx-auto mb-4">
                                            <SchoolIcon className="text-gray-400 text-3xl" />
                                        </Avatar>
                                        <Typography variant="h6" className="font-semibold mb-2 text-gray-900">
                                            {searchQuery ? "No courses found" : "No available courses"}
                                        </Typography>
                                        <Typography className="text-gray-600 mb-6 max-w-md mx-auto">
                                            {searchQuery
                                                ? "We couldn't find any courses matching your search."
                                                : "There are currently no courses available. Please check back later!"}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setSearchQuery("")}
                                            startIcon={<RefreshIcon />}
                                            className="border-gray-300 text-gray-600"
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
                <Paper className="mt-8 p-6 text-center shadow-sm border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <EmojiEventsIcon className="text-blue-600 text-4xl mb-3" />
                    <Typography variant="h6" className="font-semibold mb-2 text-gray-900 italic">
                        "Education is the most powerful weapon which you can use to change the world."
                    </Typography>
                    <Typography className="text-gray-600 flex items-center justify-center gap-1">
                        <LightbulbIcon fontSize="small" />
                        Keep learning and growing every day!
                    </Typography>
                </Paper>
            </Container>
        </Box>
    )
}

export default LearnerDashboardPage
