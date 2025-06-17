"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Star as StarIcon,
  PlayCircle as PlayCircleIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material"

const API_URL = import.meta.env.VITE_BACKEND_URL

const CourseCard = ({
  id,
  title,
  description,
  progress,
  lastAccessed,
  image,
  level,
  students,
  rating,
  instructor,
  enrolled = false,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [imageSrc, setImageSrc] = useState(null)
  const imageRef = useRef(null)
  const navigate = useNavigate()

  // Initialize image source
  useEffect(() => {
    if (!image) {
      setImageSrc(`${API_URL}/placeholder-course.jpg`)
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
    setImageSrc(`${API_URL}/placeholder-course.jpg`)
    setIsImageLoading(false)
  }, [])

  const handleCardClick = () => {
    navigate(`/learner/courses/${id}`)
  }

  // Determine level styling
  const getLevelStyle = () => {
    const levelLower = level?.toLowerCase() || ""

    if (levelLower.includes("débutant") || levelLower.includes("beginner")) {
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
      }
    } else if (levelLower.includes("intermédiaire") || levelLower.includes("intermediate")) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
      }
    } else if (levelLower.includes("avancé") || levelLower.includes("advanced")) {
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
      }
    } else {
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
      }
    }
  }

  const levelStyle = getLevelStyle()

  return (
    <div className="group h-full" onClick={handleCardClick}>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full transform group-hover:scale-[1.02] group-hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative w-full h-48 overflow-hidden">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            ref={imageRef}
            src={imageSrc || "/placeholder.svg"}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              isImageLoading ? "hidden" : "block"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Overlay with play button for enrolled courses */}
          {enrolled && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <PlayCircleIcon className="text-blue-600 text-3xl" />
              </div>
            </div>
          )}

          {/* Level badge */}
          {level && (
            <div
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border} border`}
            >
              {level}
            </div>
          )}

          {/* Students count badge */}
          {students !== undefined && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-700 border border-gray-200 backdrop-blur-sm flex items-center gap-1">
              <PeopleIcon className="w-3 h-3" />
              <span>{students}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {title || "Untitled Course"}
          </h3>

          {/* Description */}
          {description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>}

          {/* Progress Section for enrolled courses */}
          {progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-gray-600">Progression</span>
                <span className="text-sm font-medium text-blue-600">{progress || 0}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${progress >= 100 ? "bg-green-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`}
                  style={{ width: `${progress || 0}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Instructor (if available) */}
          {instructor && (
            <div className="text-sm text-gray-500 mb-4">
              <span className="font-medium">Instructeur:</span> {instructor}
            </div>
          )}

          {/* Bottom Section - Rating and Last Accessed */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            {/* Rating */}
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating || 0)
                        ? "text-yellow-400"
                        : i < (rating || 0)
                          ? "text-yellow-400" // For half stars, we'll just use full for simplicity
                          : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-1.5 text-xs text-gray-500">({rating || 0})</span>
            </div>

            {/* Last Accessed or Status */}
            {lastAccessed ? (
              <div className="flex items-center text-xs text-gray-500">
                <AccessTimeIcon className="w-3.5 h-3.5 mr-1" />
                <span>{new Date(lastAccessed).toLocaleDateString()}</span>
              </div>
            ) : enrolled ? (
              <div className="flex items-center text-xs text-green-600 font-medium">
                <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                <span>Inscrit</span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-blue-600 font-medium">
                <ArrowForwardIcon className="w-3.5 h-3.5 mr-1" />
                <span>Voir le cours</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
