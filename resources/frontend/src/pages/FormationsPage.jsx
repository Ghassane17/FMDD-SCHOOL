"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLoaderData, useNavigate } from "react-router-dom"
import { Search, SortAsc, SortDesc, Grid, List, Star, Users, BookOpen, TrendingUp, Award, ChevronDown, X } from "lucide-react"
import CourseCard from "../components/Learner/CourseCard.jsx"
import { getCategories } from "../services/api.js"

const FormationsPage = () => {
  const courses = useLoaderData()
  const navigate = useNavigate()

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [sortDirection, setSortDirection] = useState("desc") // "asc" or "desc"
  const [viewMode, setViewMode] = useState("grid")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showLevelDropdown, setShowLevelDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const response = await getCategories()
        setCategories(response.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Extract unique levels from courses
  const levels = useMemo(() => {
    if (!courses || courses.length === 0) return []
    const uniqueLevels = [...new Set(courses.map((course) => course.level).filter(Boolean))]
    return uniqueLevels
  }, [courses])

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    if (!courses || courses.length === 0) return []

    const filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructor?.username || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
      const matchesLevel = selectedLevel === "all" || course.level === selectedLevel

      return matchesSearch && matchesCategory && matchesLevel
    })

    // Sort courses
    filtered.sort((a, b) => {
      let result = 0

      switch (sortBy) {
        case "rating":
          result = (b.rating || 0) - (a.rating || 0)
          break
        case "students":
          result = (b.students || 0) - (a.students || 0)
          break
        case "title":
          result = a.title.localeCompare(b.title)
          break
        case "level":
          const levelOrder = { Débutant: 1, Intermédiaire: 2, Avancé: 3 }
          result = (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0)
          break
        default:
          result = 0
      }

      // Apply sort direction
      return sortDirection === "asc" ? result : -result
    })

    return filtered
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy, sortDirection])

  const handleCardClick = (courseId) => {
    const isLoggedIn = localStorage.getItem("token")
    if (!isLoggedIn) {
      navigate("/login")
      return
    }
    navigate(`/learner/courses/${courseId}`)
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!courses || courses.length === 0) return { total: 0, avgRating: 0, totalStudents: 0 }

    const total = courses.length
    const avgRating = courses.reduce((sum, course) => sum + (course.rating || 0), 0) / total
    const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0)

    return { total, avgRating: avgRating.toFixed(1), totalStudents }
  }, [courses])

  const getSortLabel = () => {
    const baseLabel = (() => {
      switch (sortBy) {
        case "rating":
          return "Note"
        case "students":
          return "Popularité"
        case "title":
          return "Titre"
        case "level":
          return "Niveau"
        default:
          return "Trier par"
      }
    })()

    if (sortBy && sortBy !== "default") {
      const directionLabel = sortDirection === "asc" ? "↑" : "↓"
      return `${baseLabel} ${directionLabel}`
    }

    return baseLabel
  }

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // If clicking the same sort option, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // If clicking a different sort option, set new sort and default direction
      setSortBy(newSortBy)
      // Set default direction based on sort type
      const defaultDirection = newSortBy === "title" ? "asc" : "desc"
      setSortDirection(defaultDirection)
    }
    setShowSortDropdown(false)
  }

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Nos Formations e-Learning</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Apprenez des meilleurs experts avec nos cours interactifs et projets pratiques
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 mr-2" />
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
                <p className="text-sm text-blue-100">Formations disponibles</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 mr-2" />
                  <span className="text-2xl font-bold">{stats.avgRating}</span>
                </div>
                <p className="text-sm text-blue-100">Note moyenne</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 mr-2" />
                  <span className="text-2xl font-bold">{stats.totalStudents}</span>
                </div>
                <p className="text-sm text-blue-100">Étudiants inscrits</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full mx-auto px-14 sm:px-6 lg:px-44 py-8">
        {/* Search and Filters */}
        <div className="bg-white w-full rounded-xl shadow-sm border py-6 px-10 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="relative w-full lg:w-48">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown)
                  setShowLevelDropdown(false)
                  setShowSortDropdown(false)
                }}
                className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedCategory === "all" ? "Toutes les catégories" : selectedCategory}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory("all")
                      setShowCategoryDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    {selectedCategory === "all" && <span className="text-blue-600 mr-2">✓</span>}
                    Toutes les catégories
                  </button>
                  {categoriesLoading ? (
                    <div className="px-4 py-2 text-gray-500 text-center">
                      Chargement des catégories...
                    </div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category)
                          setShowCategoryDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                      >
                        {selectedCategory === category && <span className="text-blue-600 mr-2">✓</span>}
                        {category}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Level Filter */}
            <div className="relative w-full lg:w-48">
              <button
                onClick={() => {
                  setShowLevelDropdown(!showLevelDropdown)
                  setShowCategoryDropdown(false)
                  setShowSortDropdown(false)
                }}
                className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex items-center justify-between"
              >
                <span className="truncate">{selectedLevel === "all" ? "Tous les niveaux" : selectedLevel}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showLevelDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setSelectedLevel("all")
                      setShowLevelDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    {selectedLevel === "all" && <span className="text-blue-600 mr-2">✓</span>}
                    Tous les niveaux
                  </button>
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setSelectedLevel(level)
                        setShowLevelDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                    >
                      {selectedLevel === level && <span className="text-blue-600 mr-2">✓</span>}
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative w-full lg:w-auto flex gap-1">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown)
                  setShowCategoryDropdown(false)
                  setShowLevelDropdown(false)
                }}
                className="w-full lg:w-auto px-4 py-2 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex items-center justify-between lg:justify-start gap-2"
              >
                {sortDirection === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                <span>{getSortLabel()}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={toggleSortDirection}
                className="px-3 py-2 bg-white border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex items-center justify-center"
                title={`Trier par ordre ${sortDirection === "asc" ? "décroissant" : "croissant"}`}
              >
                {sortDirection === "asc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 right-0 lg:right-auto lg:w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => handleSortChange("rating")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Note
                    {sortBy === "rating" && <span className="text-blue-600 ml-auto">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSortChange("students")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Popularité
                    {sortBy === "students" && <span className="text-blue-600 ml-auto">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSortChange("title")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Titre
                    {sortBy === "title" && <span className="text-blue-600 ml-auto">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSortChange("level")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Niveau
                    {sortBy === "level" && <span className="text-blue-600 ml-auto">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 flex items-center justify-center ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 flex items-center justify-center border-l border-gray-300 ${
                  viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Recherche: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Catégorie: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLevel !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Niveau: {selectedLevel}
                <button
                  onClick={() => setSelectedLevel("all")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Click outside to close dropdowns */}
        {(showCategoryDropdown || showLevelDropdown || showSortDropdown) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowCategoryDropdown(false)
              setShowLevelDropdown(false)
              setShowSortDropdown(false)
            }}
          />
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredAndSortedCourses.length} formation{filteredAndSortedCourses.length !== 1 ? "s" : ""} trouvée
            {filteredAndSortedCourses.length !== 1 ? "s" : ""}
          </p>
          {filteredAndSortedCourses.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              Trié par {getSortLabel().toLowerCase()}
            </div>
          )}
        </div>

        {/* Courses Grid/List */}
        <AnimatePresence mode="wait">
          {filteredAndSortedCourses && filteredAndSortedCourses.length > 0 ? (
            <motion.div
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredAndSortedCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={viewMode === "list" ? "w-full" : ""}
                >
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    image={course.course_thumbnail}
                    level={course.level}
                    students={course.students}
                    rating={course.rating}
                    instructor={course.instructor?.username}
                    onClick={() => handleCardClick(course.id)}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                {courses && courses.length > 0 ? "Aucun résultat trouvé" : "Aucune formation disponible"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {courses && courses.length > 0
                  ? "Essayez de modifier vos critères de recherche ou de filtrage."
                  : "Il n'y a actuellement aucune formation disponible. Veuillez réessayer plus tard."}
              </p>
              {courses && courses.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedLevel("all")
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FormationsPage
