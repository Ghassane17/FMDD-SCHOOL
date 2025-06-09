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
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  EmojiEvents as EmojiEventsIcon,
  Lightbulb as LightbulbIcon,
  MenuBook as MenuBookIcon,
  Star as StarIcon,
  HelpOutline as HelpOutlineIcon,
  ExpandMore,
  ChevronRight,
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
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [showStats, setShowStats] = useState(true)
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
    { value: "rating-desc", label: "Highest Rated", icon: <StarIcon className="w-4 h-4" /> },
    { value: "rating-asc", label: "Lowest Rated", icon: <StarIcon className="w-4 h-4" /> },
    { value: "popularity-desc", label: "Most Popular", icon: null },
    { value: "popularity-asc", label: "Least Popular", icon: null },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full py-16 min-h-screen bg-white">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-6 py-8">
        {/* Header Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Welcome back, {dashboard?.user?.name}!</h1>
              <p className="text-gray-600 mb-6">Continue your learning journey</p>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm">
                  <MenuBookIcon className="w-4 h-4 inline mr-1" />
                  {dashboard?.courses_enrolled || 0} Enrolled
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm">
                  <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                  {dashboard?.courses_completed || 0} Completed
                </span>
                <span className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-sm">
                  <AccessTimeIcon className="w-4 h-4 inline mr-1" />
                  Last active: {dashboard?.last_connection || "Recently"}
                </span>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
              title="Refresh Dashboard"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <RefreshIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Statistics Toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-black transition-colors"
          >
            <span className="font-medium">Statistics</span>
            {showStats ? <ExpandMore className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          {/* Statistics */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-blue-600">{overallProgress}%</span>
                  <button
                    title="Your average progress across all enrolled courses. This shows how much you've completed overall."
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HelpOutlineIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 font-medium">Overall Progress</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-green-600">{dashboard?.courses_enrolled || 0}</span>
                  <button
                    title="Total number of courses you're currently enrolled in. These are courses you can access and continue learning."
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HelpOutlineIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 font-medium">Enrolled Courses</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-purple-600">{dashboard?.courses_completed || 0}</span>
                  <button
                    title="Number of courses you've successfully completed with 100% progress. Great job on finishing these!"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HelpOutlineIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-orange-600">{allCourses.length}</span>
                  <button
                    title="Total number of courses available in our catalog that you can explore and enroll in."
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HelpOutlineIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 font-medium">Available Courses</p>
              </div>
            </div>
          )}
        </div>

        {/* Courses Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab(0)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 0 ? "border-black text-black" : "border-transparent text-gray-600 hover:text-black"
                }`}
              >
                <TrendingUpIcon className="w-5 h-5" />
                <span>My Courses</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {sortedEnrolledCourses.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 1 ? "border-black text-black" : "border-transparent text-gray-600 hover:text-black"
                }`}
              >
                <NewReleasesIcon className="w-5 h-5" />
                <span>Available Courses</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {sortedAvailableCourses.length}
                </span>
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="p-6 pb-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SortIcon className="w-4 h-4" />
                  <span>Sort by</span>
                  <ExpandMore className={`w-4 h-4 transition-transform ${showSortOptions ? "rotate-180" : ""}`} />
                </button>

                {showSortOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortOption(option.value)
                          setShowSortOptions(false)
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                          sortOption === option.value ? "bg-gray-50 text-black" : "text-gray-700"
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
          <div className="p-6 pt-0">
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
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MenuBookIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-black">
                      {searchQuery ? "No courses found" : "No enrolled courses"}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchQuery
                        ? "We couldn't find any courses matching your search."
                        : "You haven't enrolled in any courses yet. Browse our catalog to get started!"}
                    </p>
                    <button
                      onClick={() => setActiveTab(1)}
                      className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <NewReleasesIcon className="w-5 h-5" />
                      Browse Courses
                    </button>
                  </div>
                )}
              </>
            ) : (
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
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SchoolIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-black">
                      {searchQuery ? "No courses found" : "No available courses"}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchQuery
                        ? "We couldn't find any courses matching your search."
                        : "There are currently no courses available. Please check back later!"}
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RefreshIcon className="w-5 h-5" />
                      Clear Search
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Motivation Section */}
        <div className="mt-8 p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
          <EmojiEventsIcon className="w-12 h-12 text-black mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-black italic">
            "Education is the most powerful weapon which you can use to change the world."
          </h3>
          <p className="text-gray-600 flex items-center justify-center gap-1">
            <LightbulbIcon className="w-4 h-4" />
            Keep learning and growing every day!
          </p>
        </div>
      </div>
    </div>
  )
}

export default LearnerDashboardPage
