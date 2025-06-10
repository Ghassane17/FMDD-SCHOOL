"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { courseDetails, enrollNow, leaveCourse, ShowCourseComments } from "@/services/api"
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
  ExpandMore,
  ChevronRight,
} from "@mui/icons-material"
import NotesPanel from "../components/LearnerCourse/NotesPanel"

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
  const [comments, setComments] = useState([])

  // Toggle states for collapsible sections
  const [showLearningOutcomes, setShowLearningOutcomes] = useState(false)
  const [showModules, setShowModules] = useState(false)

  const API_URL = import.meta.env.VITE_BACKEND_URL


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const [courseData, commentsData] = await Promise.all([courseDetails(courseId), ShowCourseComments(courseId)])

        console.log("🚀 Course Details Response:", courseData)
        console.log("🚀 Comments Response:", commentsData)

        if (!courseData.course || typeof courseData.is_enrolled === "undefined") {
          throw new Error("Invalid response format")
        }
        setCourse(courseData.course)
        setIsEnrolled(courseData.is_enrolled)
        setComments(commentsData || [])
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error || "No course data available."}</p>
          </div>
          <button
            onClick={() => navigate("/learner/courses")}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            View Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Thumbnail Section - Full Width */}
      <div className="relative h-80 bg-gray-900 overflow-hidden">
     
        <img
          src={`${API_URL}${course.course_thumbnail}`}
          alt={course.title}
         
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Course Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-black text-sm font-medium mb-4">
              {course.level}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{course.title}</h1>
            <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">{course.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-12">
            {/* Course Stats */}
            <div className="flex flex-wrap gap-8 text-sm">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-500 w-5 h-5" />
                <span className="font-medium text-gray-900">{course.rating}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Group className="text-gray-500 w-5 h-5" />
                <span className="text-gray-600">{course.students_count?.toLocaleString() || 0} students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Schedule className="text-gray-500 w-5 h-5" />
                <span className="text-gray-600">{course.duration_hours} hours</span>
              </div>
            </div>

            {/* What You'll Learn - Collapsible */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <button
                onClick={() => setShowLearningOutcomes(!showLearningOutcomes)}
                className="flex items-center justify-between w-full text-left group"
              >
                <h2 className="text-2xl font-bold text-gray-900">What you'll learn</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {showLearningOutcomes ? "Hide" : "Show"} learning outcomes
                  </span>
                  {showLearningOutcomes ? (
                    <ExpandMore className="w-6 h-6 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  )}
                </div>
              </button>

              {showLearningOutcomes && (
                <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {[
                    "Master essential concepts and fundamentals",
                    "Apply skills through hands-on projects",
                    "Learn industry best practices and standards",
                    "Build real-world applications and projects",
                    "Understand advanced techniques and methodologies",
                    "Develop problem-solving and critical thinking skills",
                  ].map((outcome, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="text-green-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{outcome}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Course Content - Collapsible */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <button
                onClick={() => setShowModules(!showModules)}
                className="flex items-center justify-between w-full text-left group mb-2"
              >
                <h2 className="text-2xl font-bold text-gray-900">Course content</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{showModules ? "Hide" : "Show"} modules</span>
                  {showModules ? (
                    <ExpandMore className="w-6 h-6 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  )}
                </div>
              </button>

              <p className="text-gray-600 mb-6">
                {course.modules?.length || 0} modules •{" "}
                {Math.floor((course.modules?.reduce((acc, module) => acc + module.duration, 0) || 0) / 60)} hours total
              </p>

              {showModules && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  {course.modules?.map((module, index) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="text-sm font-medium text-gray-900">Module {index + 1}</span>
                            <span className="text-sm text-gray-500">
                              {Math.floor(module.duration / 60)}h {module.duration % 60}m
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900">{module.title}</h3>
                        </div>
                        <PlayArrow className="text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructor Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About the instructor</h2>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex-shrink-0">
                  <img
                    src={ `${API_URL}${course.instructor.avatar}`}
                    alt={course.instructor.name}
                    className="w-20 h-20 rounded-full object-cover"
                    onLoad={handleAvatarLoad}
                    onError={handleAvatarError}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{course.instructor.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{course.instructor.bio}</p>

                  {Array.isArray(course.instructor.skills) && course.instructor.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.instructor.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(course.instructor.languages) && course.instructor.languages.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.instructor.languages.map((lang, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
                          >
                            {lang.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8 mt-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Reviews</h2>
  
  {comments.length === 0 ? (
    <div className="text-center py-8">
      <p className="text-gray-500">No reviews yet for this course.</p>
    </div>
  ) : (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
          <div className="flex items-start space-x-4">
            <img 
              src={`${API_URL}${comment.user.avatar}`}
              alt={comment.user.username}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = `${API_URL}${comment.user.avatar}`
              }}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{comment.user.username}</h4>
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400 w-4 h-4" />
                  <span className="text-sm text-gray-600">{comment.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 mt-1">{comment.comment}</p>
              <p className="text-sm text-gray-400 mt-2">
                {new Date(comment.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

            {/* Notes Panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <NotesPanel
                courseId={courseId}
                notes={course.userNotes || ""}
                onSaveNotes={(notes, rating) => {
                  console.log("Notes saved:", notes, "Rating:", rating)
                  // You can update the course state here if needed
                }}
              />
            </div>
          </div>

          {/* Right Sidebar - 1/3 width with sticky scrolling */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6 max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Enrollment Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                {isEnrolled ? (
                  <div className="text-center">
                    <CheckCircle className="text-green-600 w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">You're enrolled!</h3>
                    <p className="text-gray-600 mb-6">Continue your learning journey</p>
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate(`/learner/courses/${courseId}/1`)}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                      >
                        <PlayArrow className="w-5 h-5" />
                        <span>Continue Course</span>
                      </button>
                      <button
                        onClick={handleLeaveCourse}
                        className="w-full py-3 px-4 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      >
                        Leave Course
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEnrolling ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Enrolling...</span>
                      </div>
                    ) : (
                      "Enroll Now"
                    )}
                  </button>
                )}
              </div>

              {/* Course Includes */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">This course includes</h3>
                <div className="space-y-4">
                  {[
                    { icon: <Assignment className="w-5 h-5" />, text: `${course.modules?.length || 0} modules` },
                    { icon: <CloudDownload className="w-5 h-5" />, text: "Downloadable resources" },
                    { icon: <WorkspacePremium className="w-5 h-5" />, text: "Certificate of completion" },
                    { icon: <AccessTime className="w-5 h-5" />, text: "Full lifetime access" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-gray-600">{feature.icon}</div>
                      <span className="text-gray-700">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Requirements</h3>
                <div className="space-y-3">
                  {[`${course.level} level knowledge`, "Basic computer skills", "Willingness to learn"].map(
                    (requirement, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">{requirement}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnrollmentPage
