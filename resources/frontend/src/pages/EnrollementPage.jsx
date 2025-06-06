"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { courseDetails, enrollNow, leaveCourse } from "@/services/api"
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
    Avatar,
    Stack,
} from "@mui/material"
import {
    CheckCircle,
    PlayArrow,
    Schedule,
    Group,
    Star,
    CloudDownload,
    Assignment,
    WorkspacePremium,
    AccessTime,
    Person,
} from "@mui/icons-material"

const EnrollmentPage = () => {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isEnrolling, setIsEnrolling] = useState(false)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [thumbnailLoading, setThumbnailLoading] = useState(true)
    const [avatarLoading, setAvatarLoading] = useState(true)
    const [thumbnailError, setThumbnailError] = useState(false)
    const [avatarError, setAvatarError] = useState(false)

    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
    const FALLBACK_IMAGE = "/images/placeholder-thumbnail.jpg"
    const FALLBACK_AVATAR = "/storage/default-avatar.png"

    useEffect(() => {
        const fetchData = async () => {
            setError("")
            try {
                const data = await courseDetails(courseId)
                console.log("🚀 Course Details Response:", data)
                if (!data.course || typeof data.is_enrolled === "undefined") {
                    throw new Error("Invalid response format")
                }
                setCourse(data.course)
                setIsEnrolled(data.is_enrolled)
            } catch (err) {
                console.error("❌ Course Details Error:", err)
                if (err.response?.status === 404) {
                    setError("Course not found.")
                } else if (err.response?.status === 400) {
                    setError("Invalid course ID.")
                } else {
                    setError("Failed to load course details.")
                }
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [courseId])

    const handleEnroll = async () => {
        setIsEnrolling(true)
        setError("")
        try {
            const response = await enrollNow(courseId)
            console.log("🚀 Enroll Response:", response)
            if (!response.message || response.message !== "Enrolled successfully") {
                throw new Error("Unexpected enrollment response")
            }
            setIsEnrolled(true)
            navigate(`/learner/courses/${courseId}/1`)
        } catch (err) {
            console.error("❌ Enroll Error:", err)
            if (err.response?.status === 401) {
                navigate("/login", { state: { from: `/courses/${courseId}` } })
            } else {
                setError(err.response?.data?.message || "Failed to enroll in the course.")
                setTimeout(() => setError(""), 5000)
            }
        } finally {
            setIsEnrolling(false)
        }
    }

    const handleLeaveCourse = async () => {
        setError("")
        try {
            const response = await leaveCourse(courseId)
            console.log("🚀 Leave Response:", response)
            if (!response.message || response.message !== "Successfully left the course") {
                throw new Error("Unexpected leave response")
            }
            setIsEnrolled(false)
            const data = await courseDetails(courseId)
            if (!data.course) {
                throw new Error("Failed to refresh course details")
            }
            setCourse(data.course)
        } catch (err) {
            console.error("❌ Leave Error:", err)
            setError(err.response?.data?.message || "Failed to leave the course.")
            setTimeout(() => setError(""), 5000)
        }
    }

    const handleThumbnailLoad = () => {
        setThumbnailLoading(false)
    }

    const handleThumbnailError = () => {
        setThumbnailLoading(false)
        setThumbnailError(true)
    }

    const handleAvatarLoad = () => {
        setAvatarLoading(false)
    }

    const handleAvatarError = () => {
        setAvatarLoading(false)
        setAvatarError(true)
    }

    if (loading) {
        return (
            <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Box className="text-center">
                    <CircularProgress size={40} className="mb-4 text-gray-600" />
                    <Typography variant="body1" className="text-gray-600">
                        Loading course details...
                    </Typography>
                </Box>
            </Box>
        )
    }

    if (error || !course) {
        return (
            <Container maxWidth="md" className="py-16 min-h-screen bg-gray-50">
                <Box className="text-center">
                    <Alert severity="error" className="mb-6">
                        {error || "No course data available."}
                    </Alert>
                    <Button
                        variant="contained"
                        onClick={() => navigate("/learner/courses")}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        View Courses
                    </Button>
                </Box>
            </Container>
        )
    }

    return (
        <Box className="min-h-screen bg-gray-50">
            <Container maxWidth="lg" className="py-8">
                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        {/* Course Header */}
                        <Box className="mb-8">
                            <Chip label={course.level} size="small" className="mb-4 bg-blue-50 text-blue-700 border-blue-200" />
                            <Typography variant="h3" className="font-bold text-gray-900 mb-4 leading-tight">
                                {course.title}
                            </Typography>
                            <Typography variant="h6" className="text-gray-600 mb-6 font-normal leading-relaxed">
                                {course.description}
                            </Typography>

                            {/* Course Stats */}
                            <Stack direction="row" spacing={4} className="mb-6">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Star className="text-yellow-500 text-lg" />
                                    <Typography className="font-medium">{course.rating}</Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Group className="text-gray-500 text-lg" />
                                    <Typography className="text-gray-600">
                                        {course.students_count?.toLocaleString() || 0} students
                                    </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Schedule className="text-gray-500 text-lg" />
                                    <Typography className="text-gray-600">{course.duration_hours} hours</Typography>
                                </Stack>
                            </Stack>

                            {/* Instructor */}
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={3}
                                className="p-4 bg-white rounded-lg border border-gray-200"
                            >
                                <Avatar
                                    src={avatarError ? `${API_URL}${FALLBACK_AVATAR}` : `${API_URL}${course.instructor.avatar}`}
                                    className="w-12 h-12"
                                    onLoad={handleAvatarLoad}
                                    onError={handleAvatarError}
                                >
                                    {avatarLoading ? <CircularProgress size={20} /> : <Person />}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" className="text-gray-500 text-sm">
                                        Instructor
                                    </Typography>
                                    <Typography className="font-medium text-gray-900">{course.instructor.name}</Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* What You'll Learn */}
                        <Card className="mb-6 shadow-sm border border-gray-200">
                            <CardContent className="p-6">
                                <Typography variant="h5" className="font-bold mb-4 text-gray-900">
                                    What you'll learn
                                </Typography>
                                <Stack spacing={3}>
                                    {[
                                        "Master essential concepts and fundamentals",
                                        "Apply skills through hands-on projects",
                                        "Learn industry best practices and standards",
                                    ].map((outcome, index) => (
                                        <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                                            <CheckCircle className="text-green-600 text-lg mt-0.5 flex-shrink-0" />
                                            <Typography className="text-gray-700">{outcome}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Course Content */}
                        <Card className="mb-6 shadow-sm border border-gray-200">
                            <CardContent className="p-6">
                                <Typography variant="h5" className="font-bold mb-2 text-gray-900">
                                    Course content
                                </Typography>
                                <Typography className="text-gray-600 mb-4">
                                    {course.modules?.length || 0} modules •{" "}
                                    {Math.floor((course.modules?.reduce((acc, module) => acc + module.duration, 0) || 0) / 60)} hours
                                    total
                                </Typography>
                                <Stack spacing={2}>
                                    {course.modules?.map((module, index) => (
                                        <Box
                                            key={module.id}
                                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Box className="flex-1">
                                                    <Stack direction="row" alignItems="center" spacing={2} className="mb-1">
                                                        <Typography className="text-sm font-medium text-blue-600">Module {index + 1}</Typography>
                                                        <Typography className="text-sm text-gray-500">
                                                            {Math.floor(module.duration / 60)}h {module.duration % 60}m
                                                        </Typography>
                                                    </Stack>
                                                    <Typography className="font-medium text-gray-900">{module.title}</Typography>
                                                </Box>
                                                <PlayArrow className="text-gray-400" />
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Instructor Details */}
                        <Card className="shadow-sm border border-gray-200">
                            <CardContent className="p-6">
                                <Typography variant="h5" className="font-bold mb-4 text-gray-900">
                                    About the instructor
                                </Typography>
                                <Stack direction="row" spacing={4} alignItems="flex-start">
                                    <Avatar
                                        src={avatarError ? `${API_URL}${FALLBACK_AVATAR}` : `${API_URL}${course.instructor.avatar}`}
                                        className="w-20 h-20"
                                        onLoad={handleAvatarLoad}
                                        onError={handleAvatarError}
                                    >
                                        {avatarLoading ? <CircularProgress size={32} /> : <Person className="text-2xl" />}
                                    </Avatar>
                                    <Box className="flex-1">
                                        <Typography variant="h6" className="font-bold mb-2 text-gray-900">
                                            {course.instructor.name}
                                        </Typography>
                                        <Typography className="text-gray-600 mb-4 leading-relaxed">{course.instructor.bio}</Typography>

                                        {Array.isArray(course.instructor.skills) && course.instructor.skills.length > 0 && (
                                            <Box className="mb-4">
                                                <Typography className="font-medium mb-2 text-gray-900">Skills</Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    {course.instructor.skills.map((skill, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={skill}
                                                            size="small"
                                                            variant="outlined"
                                                            className="text-gray-600 border-gray-300"
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>
                                        )}

                                        {Array.isArray(course.instructor.languages) && course.instructor.languages.length > 0 && (
                                            <Box>
                                                <Typography className="font-medium mb-2 text-gray-900">Languages</Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    {course.instructor.languages.map((lang, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={lang.name}
                                                            size="small"
                                                            variant="outlined"
                                                            className="text-gray-600 border-gray-300"
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>
                                        )}
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        {/* Sticky Enrollment Card */}
                        <Box
                            sx={{
                                position: "sticky",
                                top: "2rem",
                                zIndex: 10,
                            }}
                        >
                            {error && (
                                <Alert severity="error" className="mb-4">
                                    {error}
                                </Alert>
                            )}

                            <Card className="mb-6 shadow-sm border border-gray-200">
                                <Box className="relative h-48">
                                    {thumbnailLoading && (
                                        <Box className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                            <CircularProgress size={32} />
                                        </Box>
                                    )}
                                    <CardMedia
                                        component="img"
                                        height="192"
                                        image={thumbnailError ? `${API_URL}${FALLBACK_IMAGE}` : `${API_URL}${course.course_thumbnail}`}
                                        alt={course.title}
                                        className={`object-cover ${thumbnailLoading ? "hidden" : "block"}`}
                                        onLoad={handleThumbnailLoad}
                                        onError={handleThumbnailError}
                                    />
                                </Box>

                                <CardContent className="p-6">
                                    {isEnrolled ? (
                                        <Box className="text-center">
                                            <CheckCircle className="text-green-600 text-4xl mb-3" />
                                            <Typography variant="h6" className="font-bold mb-2 text-gray-900">
                                                You're enrolled!
                                            </Typography>
                                            <Typography className="text-gray-600 mb-4">Continue your learning journey</Typography>
                                            <Stack spacing={2}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    startIcon={<PlayArrow />}
                                                    onClick={() => navigate(`/learner/courses/${courseId}/1`)}
                                                    className="bg-blue-600 hover:bg-blue-700 py-2.5 font-medium"
                                                >
                                                    Continue Course
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    color="error"
                                                    onClick={handleLeaveCourse}
                                                    className="py-2.5 font-medium"
                                                >
                                                    Leave Course
                                                </Button>
                                            </Stack>
                                        </Box>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            onClick={handleEnroll}
                                            disabled={isEnrolling}
                                            className="bg-blue-600 hover:bg-blue-700 py-3 text-lg font-medium"
                                        >
                                            {isEnrolling ? <CircularProgress size={20} color="inherit" /> : "Enroll Now"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Course Includes */}
                            <Card className="mb-4 shadow-sm border border-gray-200">
                                <CardContent className="p-6">
                                    <Typography variant="h6" className="font-bold mb-4 text-gray-900">
                                        This course includes
                                    </Typography>
                                    <Stack spacing={3}>
                                        {[
                                            { icon: <Assignment />, text: `${course.modules?.length || 0} modules` },
                                            { icon: <CloudDownload />, text: "Downloadable resources" },
                                            { icon: <WorkspacePremium />, text: "Certificate of completion" },
                                            { icon: <AccessTime />, text: "Full lifetime access" },
                                        ].map((feature, index) => (
                                            <Stack key={index} direction="row" spacing={2} alignItems="center">
                                                <Box className="text-gray-600">{feature.icon}</Box>
                                                <Typography className="text-gray-700">{feature.text}</Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* Requirements */}
                            <Card className="shadow-sm border border-gray-200">
                                <CardContent className="p-6">
                                    <Typography variant="h6" className="font-bold mb-4 text-gray-900">
                                        Requirements
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[`${course.level} level knowledge`, "Basic computer skills", "Willingness to learn"].map(
                                            (requirement, index) => (
                                                <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                                                    <Box className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></Box>
                                                    <Typography className="text-gray-600 text-sm">{requirement}</Typography>
                                                </Stack>
                                            ),
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default EnrollmentPage
