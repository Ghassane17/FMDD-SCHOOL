"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getAllCourses } from "../../services/api.js"
import CourseCard from "./CourseCard.jsx"
import {
  Sort as SortIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Lightbulb as LightbulbIcon,
  Recommend as RecommendIcon,
  School as SchoolIcon,
  FilterList as FilterListIcon,
  Group,
} from "@mui/icons-material"

const SuggestedCourses = () => {
  const [courses, setCourses] = useState([])
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortOption, setSortOption] = useState("rating-desc")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [filterLevel, setFilterLevel] = useState("all")
  const [showFilterOptions, setShowFilterOptions] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await getAllCourses()
        setCourses(response.data.courses || [])
        setRecommendedCourses(response.data.recommendedCourses || [])
      } catch (err) {
        setError(err.message || "Failed to load courses")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const getSuggestedCourses = () => {
    // Filter by level if selected
    let filtered = courses
    if (filterLevel !== "all") {
      filtered = courses.filter((course) => course.level?.toLowerCase() === filterLevel.toLowerCase())
    }

    // Sort the courses
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

  const suggestedCourses = getSuggestedCourses()

  const sortOptions = [
    { value: "rating-desc", label: "Meilleures notes", icon: <StarIcon className="w-4 h-4" /> },
    { value: "rating-asc", label: "Notes croissantes", icon: <StarIcon className="w-4 h-4" /> },
    { value: "popularity-desc", label: "Plus populaires", icon: <Group className="w-4 h-4" /> },
    { value: "popularity-asc", label: "Moins populaires", icon: <Group className="w-4 h-4" /> },
  ]

  const filterOptions = [
    { value: "all", label: "Tous les niveaux" },
    { value: "beginner", label: "Débutant" },
    { value: "intermediate", label: "Intermédiaire" },
    { value: "advanced", label: "Avancé" },
  ]

  // Calculate statistics
  const levelStats = courses.reduce((acc, course) => {
    const level = course.level?.toLowerCase() || "unknown"
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {})

  const averageRating =
    courses.length > 0
      ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
      : 0

  const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0)

  const handleReasonsClick = (e) => {
    e.stopPropagation()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <div className="container mx-auto px-6 py-8">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded-lg w-64 mb-3 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="h-8 bg-gray-200 rounded-lg w-16 mb-3 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Course Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="h-48 bg-gray-200 rounded-xl mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-2/3 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Erreur de chargement</h2>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-purple-900 via-black to-blue-900 rounded-2xl p-8 mb-12 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <RecommendIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Trouve ta nouvelle formation</h1>
                  <p className="text-white/80 text-lg">Découvrez des formations choisies spécialement pour vous</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUpIcon className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold text-purple-400">{suggestedCourses.length}</span>
                <span className="text-white/80">formations</span>
              </div>

              <div className="flex gap-3">
                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterOptions(!showFilterOptions)}
                    className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                  >
                    <FilterListIcon className="w-5 h-5" />
                    <span>Niveau</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${showFilterOptions ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showFilterOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilterLevel(option.value)
                            setShowFilterOptions(false)
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            filterLevel === option.value ? "bg-purple-50 text-purple-600 font-medium" : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortOptions(!showSortOptions)}
                    className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                  >
                    <SortIcon className="w-5 h-5" />
                    <span>Trier</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${showSortOptions ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showSortOptions && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortOption(option.value)
                            setShowSortOptions(false)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            sortOption === option.value ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                          }`}
                        >
                          {option.icon}
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">{averageRating}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Note moyenne</h3>
            <p className="text-gray-600 text-sm">Sur toutes les formations</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                <Group className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-purple-600">{totalStudents.toLocaleString()}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Étudiants inscrits</h3>
            <p className="text-gray-600 text-sm">Au total</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <SchoolIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">{courses.length}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Formations disponibles</h3>
            <p className="text-gray-600 text-sm">Dans le catalogue</p>
          </div>
        </div>

        {/* Level Distribution */}
        {Object.keys(levelStats).length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <LightbulbIcon className="w-5 h-5 text-yellow-600" />
              Répartition par niveau
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(levelStats).map(([level, count]) => (
                <div key={level} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{level === "unknown" ? "Non spécifié" : level}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Courses Section */}
        {recommendedCourses.length > 0 && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-green-900 via-emerald-800 to-teal-900 rounded-2xl p-8 text-white shadow-2xl mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <RecommendIcon className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Formations Recommandées</h2>
                  <p className="text-white/80 text-lg">Sélectionnées spécialement pour vous selon vos intérêts et votre progression</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                  <TrendingUpIcon className="w-4 h-4 text-green-400" />
                  <span>{recommendedCourses.length} recommandations</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>Personnalisées</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/learner/courses/${course.id}`}
                  className="relative group transform hover:scale-105 transition-all duration-200 h-full min-h-[350px] block"
                  style={{ minHeight: 350 }}
                >
                  {/* Recommendation Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Recommandé
                    </div>
                  </div>
                  {/* Course Card (hidden on hover) */}
                  <div className="transition-opacity duration-300 group-hover:opacity-0">
                    <CourseCard
                      id={course.id}
                      title={course.title}
                      description={course.description}
                      image={course.course_thumbnail}
                      level={course.level}
                      students={course.students || 0}
                      rating={course.rating || 0}
                      instructor={course.instructor?.name || "Instructeur"}
                    />
                  </div>
                  {/* Reasons Overlay (shown on hover) */}
                  {course.recommendation_reasons && course.recommendation_reasons.length > 0 && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-20"
                      onClick={handleReasonsClick}
                    >
                      <div className="w-11/12 max-w-xs mx-auto p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
                        <div className="text-base font-bold text-green-800 mb-3">Pourquoi recommandé :</div>
                        <ul className="text-sm text-green-700 space-y-2">
                          {course.recommendation_reasons.slice(0, 4).map((reason, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Courses Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-900 via-black to-blue-900 rounded-2xl p-8 text-white shadow-2xl mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <SchoolIcon className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Toutes les Formations</h2>
                <p className="text-white/80 text-lg">Explorez notre catalogue complet de formations disponibles</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {suggestedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {suggestedCourses.map((course) => (
                <div key={course.id} className="transform hover:scale-105 transition-all duration-200">
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    image={course.course_thumbnail}
                    level={course.level}
                    students={course.students || 0}
                    rating={course.rating || 0}
                    instructor={course.instructor?.name || "Instructeur"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SchoolIcon className="w-12 h-12 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {filterLevel !== "all" ? "Aucune formation trouvée" : "Aucune formation disponible"}
                </h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {filterLevel !== "all"
                    ? `Aucune formation disponible pour le niveau "${filterLevel}". Essayez un autre filtre.`
                    : "Aucune formation disponible pour le moment. Revenez plus tard !"}
                </p>
                {filterLevel !== "all" && (
                  <button
                    onClick={() => setFilterLevel("all")}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg"
                  >
                    <FilterListIcon className="w-5 h-5" />
                    Voir toutes les formations
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recommendation Tips */}
        {suggestedCourses.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LightbulbIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Conseil personnalisé</h3>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Pour une expérience d'apprentissage optimale, nous recommandons de commencer par les formations de
                niveau débutant si vous découvrez un nouveau domaine, puis de progresser vers les niveaux plus avancés.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuggestedCourses
