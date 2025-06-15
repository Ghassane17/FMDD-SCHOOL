"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getLearnerDashboard, getAllCourses } from "../services/api"
import CourseCard from "../components/Learner/CourseCard.jsx"
import {
  Refresh as RefreshIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  NewReleases as NewReleasesIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  Lightbulb as LightbulbIcon,
  MenuBook as MenuBookIcon,
  Star as StarIcon,
  HelpOutline as HelpOutlineIcon,
  ExpandMore,
  CardMembership as CardMembershipIcon,
  Download,
} from "@mui/icons-material"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"

const LearnerDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null)
  const [allCourses, setAllCourses] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("rating-desc")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [showStats, setShowStats] = useState(true)
  const [previewCertificate, setPreviewCertificate] = useState(null)
  const navigate = useNavigate()

  // Calculate overall progress from enrolled courses
  const calculateOverallProgress = (enrolledCourses) => {
    if (!enrolledCourses || enrolledCourses.length === 0) return 0
    const totalProgress = enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0)
    return Math.round(totalProgress / enrolledCourses.length)
  }

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

  // Update overall progress when dashboard changes
  useEffect(() => {
    if (dashboard?.enrolled_courses) {
      const progress = calculateOverallProgress(dashboard.enrolled_courses)
      setOverallProgress(progress)
    }
  }, [dashboard])

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

  const Preview = (certificateId) => {
    const certificate = dashboard?.certificates?.find((cert) => cert.id === certificateId)
    if (certificate) {
      setPreviewCertificate(certificate)
    }
  }

  const closePreview = () => {
    setPreviewCertificate(null)
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

  const sortOptions = [
    { value: "rating-desc", label: "Mieux notés", icon: <StarIcon className="w-4 h-4" /> },
    { value: "rating-asc", label: "Moins bien notés", icon: <StarIcon className="w-4 h-4" /> },
    { value: "popularity-desc", label: "Plus populaires", icon: null },
    { value: "popularity-asc", label: "Moins populaires", icon: null },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Chargement de votre tableau de bord</h2>
          <p className="text-gray-600">Veuillez patienter...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
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
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Erreur d'accès</h2>
            <p className="text-red-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Aller à la connexion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Certificate Preview Modal */}
      {previewCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closePreview} />

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <iframe
              src={`${BACKEND_URL}${previewCertificate.url_path}`}
              className="w-full h-full rounded-2xl"
              title="Aperçu du certificat"
              onError={() => console.error("Failed to load certificate")}
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Hero Header Section */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-purple-900 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">👋</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Bienvenue, {dashboard?.user?.name}!</h1>
                  <p className="text-white/80 text-lg">Poursuivez votre parcours d'apprentissage</p>
                </div>
              </div>
            </div>

            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-110 disabled:opacity-50"
              title="Actualiser le tableau de bord"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <RefreshIcon className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Statistics Toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 mb-6 text-white/90 hover:text-white transition-colors group"
          >
            <span className="font-medium text-lg">Statistiques</span>
            <div className={`transform transition-transform duration-200 ${showStats ? "rotate-180" : ""}`}>
              <ExpandMore className="w-6 h-6" />
            </div>
          </button>

          {/* Enhanced Statistics */}
          {showStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/20">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-4xl font-bold text-blue-400">{overallProgress}%</span>
                  <button
                    title="Votre progression moyenne sur tous les cours inscrits"
                    className="text-white/60 hover:text-white/80 transition-colors"
                  >
                    <HelpOutlineIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/80 font-medium">Progression globale</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-4xl font-bold text-green-400">{dashboard?.courses_enrolled || 0}</span>
                  <button
                    title="Nombre total de cours auxquels vous êtes inscrit"
                    className="text-white/60 hover:text-white/80 transition-colors"
                  >
                    <HelpOutlineIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/80 font-medium">Formations inscrites</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-4xl font-bold text-purple-400">{dashboard?.courses_completed || 0}</span>
                  <button
                    title="Nombre de cours terminés avec 100% de progression"
                    className="text-white/60 hover:text-white/80 transition-colors"
                  >
                    <HelpOutlineIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/80 font-medium">Formations terminées</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-4xl font-bold text-orange-400">{allCourses.length}</span>
                  <button
                    title="Nombre total de cours disponibles dans le catalogue"
                    className="text-white/60 hover:text-white/80 transition-colors"
                  >
                    <HelpOutlineIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/80 font-medium">Formations disponibles</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Enhanced Tabs */}
          <div className="border-b border-gray-200 bg-gray-50/50">
            <div className="flex px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab(0)}
                className={`flex items-center gap-3 px-6 py-4 border-b-3 font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === 0
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50/30"
                }`}
              >
                <TrendingUpIcon className="w-5 h-5" />
                <span>Mes formations</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {sortedEnrolledCourses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab(1)}
                className={`flex items-center gap-3 px-6 py-4 border-b-3 font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === 1
                    ? "border-purple-600 text-purple-600 bg-purple-50/50"
                    : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30"
                }`}
              >
                <NewReleasesIcon className="w-5 h-5" />
                <span>Formations disponibles</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  {sortedAvailableCourses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab(2)}
                className={`flex items-center gap-3 px-6 py-4 border-b-3 font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === 2
                    ? "border-green-600 text-green-600 bg-green-50/50"
                    : "border-transparent text-gray-600 hover:text-green-600 hover:bg-green-50/30"
                }`}
              >
                <CardMembershipIcon className="w-5 h-5" />
                <span>Mes certificats</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  {dashboard?.certificates?.length || 0}
                </span>
              </button>
            </div>
          </div>

          {/* Enhanced Search and Filter Bar */}
          <div className="p-6 bg-gray-50/30 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full max-w-md">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des formations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="flex items-center gap-3 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 bg-white shadow-sm font-medium"
                >
                  <SortIcon className="w-5 h-5" />
                  <span>Trier par</span>
                  <ExpandMore
                    className={`w-5 h-5 transition-transform duration-200 ${showSortOptions ? "rotate-180" : ""}`}
                  />
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 0 ? (
              <>
                {sortedEnrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedEnrolledCourses.map((course) => (
                      <CourseCard
                        key={course.id}
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MenuBookIcon className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">
                      {searchQuery ? "Aucune formation trouvée" : "Aucune formation inscrite"}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                      {searchQuery
                        ? "Nous n'avons trouvé aucune formation correspondant à votre recherche."
                        : "Vous n'êtes encore inscrit à aucune formation. Parcourez notre catalogue pour commencer!"}
                    </p>
                    <button
                      onClick={() => setActiveTab(1)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      <NewReleasesIcon className="w-5 h-5" />
                      Découvrir nos formations
                    </button>
                  </div>
                )}
              </>
            ) : activeTab === 1 ? (
              <>
                {sortedAvailableCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedAvailableCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        image={course.course_thumbnail}
                        level={course.level}
                        students={course.students}
                        rating={course.rating}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <SchoolIcon className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">
                      {searchQuery ? "Aucune formation trouvée" : "Aucune formation disponible"}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                      {searchQuery
                        ? "Nous n'avons trouvé aucune formation correspondant à votre recherche."
                        : "Il n'y a actuellement aucune formation disponible. Revenez plus tard!"}
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 font-semibold"
                    >
                      <RefreshIcon className="w-5 h-5" />
                      Actualiser
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {dashboard?.certificates?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboard.certificates.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{certificate.course_name}</h3>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                              #{certificate.certificate_code}
                            </span>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                            <CardMembershipIcon className="w-6 h-6 text-green-600" />
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium">Délivré le:</span>{" "}
                          {new Date(certificate.created_at).toLocaleDateString("fr-FR")}
                        </div>

                        <button
                          onClick={() => Preview(certificate.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                        >
                          <Download className="w-4 h-4" />
                          Voir le certificat
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CardMembershipIcon className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Aucun certificat</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                      Vous n'avez pas encore obtenu de certificats. Terminez vos formations pour obtenir vos certificats
                      !
                    </p>
                    <button
                      onClick={() => setActiveTab(0)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      <TrendingUpIcon className="w-5 h-5" />
                      Voir mes formations
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Enhanced Motivation Section */}
        <div className="mt-8 p-8 text-center bg-gradient-to-r from-gray-900 via-black to-purple-900 rounded-2xl shadow-2xl text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <EmojiEventsIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4 italic">
            "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde."
          </h3>
          <p className="text-white/80 flex items-center justify-center gap-2 text-lg">
            <LightbulbIcon className="w-5 h-5 text-yellow-400" />
            Continuez à apprendre et à grandir chaque jour !
          </p>
        </div>
      </div>
    </div>
  )
}

export default LearnerDashboardPage
