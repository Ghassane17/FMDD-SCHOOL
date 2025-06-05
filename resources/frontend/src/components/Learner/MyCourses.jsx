"use client"

import { useState, useEffect } from "react"
import { getEnrolledCourses } from "@/services/api.js"
import CourseCard from "./CourseCard.jsx"
import {
    Alert,
    Container,
    Grid,
    Typography,
    Button,
    Box,
    Skeleton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Chip,
} from "@mui/material"
import { Link } from "react-router-dom"
import SchoolIcon from "@mui/icons-material/School"
import SortIcon from "@mui/icons-material/Sort"
import StarIcon from "@mui/icons-material/Star"

const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [sortOption, setSortOption] = useState("rating-desc")

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await getEnrolledCourses()
                setEnrolledCourses(response.data.courses || [])
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load courses. Please try again.")
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [])

    if (loading)
        return (
            <Container maxWidth="lg" className="py-8">
                <Skeleton variant="text" width="30%" height={40} className="mb-2" />
                <Skeleton variant="text" width="50%" height={24} className="mb-6" />
                <Grid container spacing={3}>
                    {[...Array(2)].map((_, index) => (
                        <Grid item xs={12} lg={6} key={index}>
                            <Skeleton variant="rounded" height={280} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        )

    if (error)
        return (
            <Container maxWidth="lg" className="py-8">
                <Alert severity="error" className="mb-4">
                    {error}
                </Alert>
            </Container>
        )

    const getSortedCourses = () => {
        return [...enrolledCourses].sort((a, b) => {
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

    const sortedCourses = getSortedCourses()

    return (
        <Container maxWidth="lg" className="py-8">
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                className="mb-6"
            >
                <Box>
                    <Typography variant="h4" className="mb-2 font-bold text-gray-900">
                        Mes Cours
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                        Suivez votre progression et reprenez là où vous vous êtes arrêté
                    </Typography>
                </Box>

                {enrolledCourses.length > 0 && (
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Chip

                            label={`${enrolledCourses.length} cours`}
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
                )}
            </Stack>

            {enrolledCourses.length === 0 ? (
                <Box className="flex flex-col items-center justify-center gap-4 text-center py-12 px-4 border border-dashed border-gray-200 rounded-lg bg-white">
                    <Box className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                        <SchoolIcon className="text-blue-600 text-3xl" />
                    </Box>
                    <Typography variant="h6" className="font-semibold text-gray-900">
                        Aucun cours suivi pour le moment
                    </Typography>
                    <Typography variant="body1" className="text-gray-600 max-w-md mb-4">
                        Commencez votre apprentissage avec nos cours recommandés spécialement sélectionnés pour vous
                    </Typography>
                    <Button
                        component={Link}
                        to="/learner/suggested-courses"
                        variant="contained"
                        startIcon={<SchoolIcon />}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 font-medium text-base normal-case"
                    >
                        Découvrir les cours
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {sortedCourses.map((course) => (
                        <Grid item xs={12} lg={6} key={course.id}>
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
    )
}

export default MyCourses
