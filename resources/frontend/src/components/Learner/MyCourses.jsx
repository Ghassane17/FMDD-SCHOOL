"use client"

import { useState, useEffect } from "react"
import { getEnrolledCourses } from "@/services/api.js"
import CourseCard from "./CourseCard.jsx"
import { Link } from "react-router-dom"
import {
  School as SchoolIcon,
  Sort as SortIcon,
  Star as StarIcon,
  TrendingUp,
  MenuBook,
  Group,
} from "@mui/icons-material"

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortOption, setSortOption] = useState("rating-desc")
  const [showSortOptions, setShowSortOptions] = useState(false)

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

  const sortOptions = [
    { value: "rating-desc", label: "Meilleures notes", icon: <StarIcon className="w-4 h-4" /> },
    { value: "rating-asc", label: "Notes croissantes", icon: <StarIcon className="w-4 h-4" /> },
    { value: "popularity-desc", label: "Plus populaires", icon: <Group className="w-4 h-4" /> },
    { value: "popularity-asc", label: "Moins populaires", icon: <Group className="w-4 h-4" /> },
  ]

  // Calculate overall statistics
  const totalProgress =
    enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / enrolledCourses.length)
      : 0
  const completedCourses = enrolledCourses.filter((course) => (course.progress || 0) >= 100).length
  const inProgressCourses = enrolledCourses.filter(
    (course) => (course.progress || 0) > 0 && (course.progress || 0) < 100,
  ).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-6 py-8">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded-lg w-48 mb-3 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Course Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-blue-900 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MenuBook className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Mes Formations</h1>
                  <p className="text-white/80 text-lg">
                    Suivez votre progression et reprenez là où vous vous êtes arrêté
                  </p>
                </div>
              </div>
            </div>

            {enrolledCourses.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <span className="text-2xl font-bold text-blue-400">{enrolledCourses.length}</span>
                  <span className="text-white/80">formations</span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowSortOptions(!showSortOptions)}
                    className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                  >
                    <SortIcon className="w-5 h-5" />
                    <span>Trier par</span>
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
            )}
          </div>

          {/* Statistics Section */}
          {enrolledCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/20">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-200">
                <div className="text-3xl font-bold text-green-400 mb-2">{totalProgress}%</div>
                <p className="text-white/80 font-medium">Progression moyenne</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-200">
                <div className="text-3xl font-bold text-blue-400 mb-2">{completedCourses}</div>
                <p className="text-white/80 font-medium">Formations terminées</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-200">
                <div className="text-3xl font-bold text-purple-400 mb-2">{inProgressCourses}</div>
                <p className="text-white/80 font-medium">En cours</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SchoolIcon className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Aucune formation suivie</h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Commencez votre apprentissage avec nos formations recommandées spécialement sélectionnées pour vous
              </p>
              <Link
                to="/learner/suggested-courses"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg"
              >
                <SchoolIcon className="w-5 h-5" />
                Découvrir les formations
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedCourses.map((course) => (
              <div key={course.id} className="transform hover:scale-105 transition-all duration-200">
                <CourseCard
                  id={course.id}
                  title={course.title}
                  progress={course.progress}
                  lastAccessed={course.last_accessed}
                  image={course.image}
                  level={course.level}
                />
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions Section */}
        {enrolledCourses.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Actions rapides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/learner/suggested-courses"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-200 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <SchoolIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Nouvelles formations</div>
                  <div className="text-sm text-gray-600">Découvrir plus</div>
                </div>
              </Link>

              <Link
                to="/learner"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:from-green-100 hover:to-blue-100 transition-all duration-200 border border-green-200 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Tableau de bord</div>
                  <div className="text-sm text-gray-600">Voir les statistiques</div>
                </div>
              </Link>

              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Actualiser</div>
                  <div className="text-sm text-gray-600">Recharger la page</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCourses
