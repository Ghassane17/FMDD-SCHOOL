"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
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
    useTheme,
    useMediaQuery,
} from "@mui/material"
import PeopleIcon from "@mui/icons-material/People"
import AccessTimeIcon from "@mui/icons-material/AccessTime"

const API_URL = import.meta.env.VITE_BACKEND_URL 

const CourseCard = ({ id, title, description, progress, lastAccessed, image, level, students, rating }) => {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [imageSrc, setImageSrc] = useState(null)
    const imageRef = useRef(null)
    const navigate = useNavigate()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const handleCardClick = () => {
        // Always navigate to the enrollment page first
        navigate(`/learner/courses/${id}`)
    }

    // Initialize image source
    useEffect(() => {
        if (!image) {
            setImageSrc(`${API_URL}`)
            setIsImageLoading(false)
            return
        }

        // If image is a full URL, use it directly
        if (image.startsWith("http")) {
            setImageSrc(image)
            return
        }

        // If image is a relative path, prepend API_URL
        setImageSrc(`${API_URL}${image}`)
    }, [image])

    // Handle image loading
    const handleImageLoad = useCallback(() => {
        setIsImageLoading(false)
    }, [])

    const handleImageError = useCallback(() => {
        console.log("Image load error, using fallback")
        setImageSrc(`${API_URL}`)
        setIsImageLoading(false)
    }, [])

    return (
        <div 
            onClick={handleCardClick} 
            className="cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
        >
            <Card
                className="w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                sx={{
                    height: isMobile ? 'auto' : 280,
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                }}
            >
                {/* Image Section */}
                <Link 
                    to={`/learner/courses/${id}`} 
                    style={{ 
                        display: "block", 
                        width: isMobile ? "100%" : "200px", 
                        height: isMobile ? "200px" : "100%",
                        flexShrink: 0 
                    }}
                >
                    <Box
                        sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            bgcolor: "grey.100",
                        }}
                    >
                        {isImageLoading && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "grey.100",
                                }}
                            >
                                <LinearProgress sx={{ width: "60%" }} />
                            </Box>
                        )}
                        <CardMedia
                            ref={imageRef}
                            component="img"
                            image={imageSrc}
                            alt={title}
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: isImageLoading ? "none" : "block",
                            }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                    </Box>
                </Link>

                {/* Content Section */}
                <CardContent
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        p: isMobile ? 2 : 2.5,
                        "&:last-child": { pb: isMobile ? 2 : 2.5 },
                    }}
                >
                    {/* Top Section - Chips */}
                    <Stack 
                        direction="row" 
                        spacing={1} 
                        sx={{ 
                            mb: 1.5,
                            flexWrap: isMobile ? "wrap" : "nowrap",
                            gap: isMobile ? 1 : undefined
                        }}
                    >
                        {level && (
                            <Chip
                                label={level}
                                size="small"
                                sx={{
                                    bgcolor: level === "débutant" ? "success.50" : level === "intermédiaire" ? "warning.50" : "error.50",
                                    color: level === "débutant" ? "success.700" : level === "intermédiaire" ? "warning.700" : "error.700",
                                    borderColor:
                                        level === "débutant" ? "success.200" : level === "intermédiaire" ? "warning.200" : "error.200",
                                    border: "1px solid",
                                    fontWeight: 500,
                                    fontSize: "0.75rem",
                                }}
                            />
                        )}
                        <Chip
                            icon={<PeopleIcon sx={{ fontSize: "0.875rem !important" }} />}
                            label={`${students || 0} étudiants`}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: "0.75rem",
                                color: "text.secondary",
                                borderColor: "divider",
                            }}
                        />
                    </Stack>

                    {/* Title */}
                    <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                            mb: 1,
                            fontSize: isMobile ? "1rem" : "1.1rem",
                            fontWeight: 600,
                            lineHeight: 1.3,
                            height: isMobile ? "auto" : "2.6em",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: isMobile ? 3 : 2,
                            WebkitBoxOrient: "vertical",
                            color: "text.primary",
                        }}
                    >
                        <Link
                            to={`/learner/courses/${id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                            className="hover:text-blue-600"
                        >
                            {title || "Untitled Course"}
                        </Link>
                    </Typography>

                    {/* Description */}
                    {description && (
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 2,
                                height: isMobile ? "auto" : "3em",
                                maxHeight: isMobile ? "4.5em" : "3em",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: isMobile ? 3 : 2,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                                color: "text.secondary",
                                fontSize: "0.875rem",
                                lineHeight: 1.5,
                            }}
                        >
                            {description}
                        </Typography>
                    )}

                    {/* Progress Section */}
                    {progress !== undefined && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, fontSize: "0.875rem" }}>
                                Progression: {progress !== null ? `${progress}%` : "0%"}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={progress || 0}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                    "& .MuiLinearProgress-bar": {
                                        borderRadius: 3,
                                        backgroundColor: progress >= 100 ? "success.main" : "primary.main",
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Bottom Section - Rating and Last Accessed */}
                    <Stack
                        direction={isMobile ? "column" : "row"}
                        spacing={isMobile ? 1.5 : 3}
                        alignItems={isMobile ? "flex-start" : "center"}
                        sx={{
                            mt: "auto",
                            pt: 1.5,
                            borderTop: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Tooltip title="Note du cours">
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Rating
                                    value={rating || 0}
                                    precision={0.5}
                                    size="small"
                                    readOnly
                                    sx={{
                                        "& .MuiRating-iconFilled": {
                                            color: "warning.main",
                                        },
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontSize: "0.75rem" }}>
                                    ({rating || 0})
                                </Typography>
                            </Box>
                        </Tooltip>
                        {lastAccessed && (
                            <Tooltip title="Dernière consultation">
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary", fontSize: "0.875rem" }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                        {lastAccessed ? new Date(lastAccessed).toLocaleDateString() : "Jamais"}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </div>
    )
}

export default CourseCard