"use client"

import { useState, useEffect } from "react"
import { Star, Users, Clock, CheckCircle2, Settings2, Plus, BookOpen, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getInstructorDashboard } from "../../services/api_instructor"

const CourseList = ({ instructorData, backend_url }) => {
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseTitle, setCourseTitle] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [courseImage, setCourseImage] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getInstructorDashboard()
        setCourses(data.courses || [])
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const courseData = {
      title: courseTitle,
      description: courseDescription,
      image: courseImage ? URL.createObjectURL(courseImage) : null,
    }
    navigate("/instructor/create-course", { state: { courseData } })
    setShowCourseForm(false)
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setCourseImage(e.target.files[0])
    }
  }

  const getStatusBadge = (isPublished) => {
    if (isPublished) {
      return (
        <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
          <CheckCircle2 className="w-3 h-3 mr-1.5" />
          Publié
        </div>
      )
    }
    return (
      <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-semibold shadow-lg">
        <Clock className="w-3 h-3 mr-1.5" />
        En attente
      </div>
    )
  }

  const handleCourseAction = (courseId) => {
    navigate(`/instructor/manage-course/${courseId}`)
  }

  const formatDuration = (minutes) => {
    if (!minutes) return "0h"
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 0) {
      return `${remainingMinutes}min`
    }
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remainingMinutes}min`
  }

  const getStatsCards = () => {
    const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0)
    const publishedCourses = courses.filter((course) => course.is_published).length
    const instructorStats = JSON.parse(localStorage.getItem("instructorStats") || "{}")
    const averageRating = instructorStats.averageRating || 0
    console.log("averageRating", averageRating)

    return [
      {
        title: "Cours Publiés",
        value: publishedCourses,
        total: courses.length,
        icon: BookOpen,
        color: "from-blue-500 to-indigo-600",
        bgColor: "from-blue-50 to-indigo-50",
      },
      {
        title: "Total Étudiants",
        value: totalStudents,
        icon: Users,
        color: "from-emerald-500 to-green-600",
        bgColor: "from-emerald-50 to-green-50",
      },
      {
        title: "Note Moyenne",
        value: averageRating.toFixed(1),
        icon: Star,
        color: "from-amber-500 to-orange-600",
        bgColor: "from-amber-50 to-orange-50",
      },
      {
        title: "Cours Actifs",
        value: courses.length,
        icon: TrendingUp,
        color: "from-purple-500 to-pink-600",
        bgColor: "from-purple-50 to-pink-50",
      },
    ]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-2xl overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.value}
                    {stat.total && <span className="text-lg text-gray-500">/{stat.total}</span>}
                  </p>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Course List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Mes Cours</h2>
                <p className="text-indigo-100">Gérez et suivez vos formations</p>
              </div>
            </div>
            <button
              onClick={() => setShowCourseForm(true)}
              className="flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un cours
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="h-12 w-12 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun cours créé</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Commencez votre parcours d'enseignement en créant votre premier cours
              </p>
              <button
                onClick={() => setShowCourseForm(true)}
                className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer mon premier cours
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      onClick={() => handleCourseAction(course.id)}
                      src={backend_url + course.image || "/placeholder.svg?height=200&width=400"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4">{getStatusBadge(course.is_published)}</div>
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center space-x-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                            <span className="text-sm font-semibold text-gray-800">{course.rating || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3
                      onClick={() => handleCourseAction(course.id)}
                      className="font-bold text-lg mb-3 text-gray-800 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors duration-200 leading-tight"
                    >
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{course.description}</p>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                        <Users className="h-4 w-4 text-indigo-500" />
                        <div>
                          <p className="text-xs text-gray-500">Étudiants</p>
                          <p className="font-semibold text-gray-800">{course.students || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <div>
                          <p className="text-xs text-gray-500">Durée</p>
                          <p className="font-semibold text-gray-800">{formatDuration(course.duration_min)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleCourseAction(course.id)}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 px-4 py-3 rounded-xl transition-all duration-200 border border-indigo-200 hover:border-indigo-300 group cursor-pointer"
                    >
                      <Settings2 className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                      <span className="font-medium">Gérer le cours</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Creation Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Créer un nouveau cours</h2>
              <p className="text-indigo-100 mt-1">Commencez par les informations de base</p>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-gray-700 mb-3 font-semibold">Titre du cours</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Ex: Introduction au développement web"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-3 font-semibold">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Décrivez votre cours, les objectifs d'apprentissage et ce que les étudiants vont apprendre..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  Continuer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseList
