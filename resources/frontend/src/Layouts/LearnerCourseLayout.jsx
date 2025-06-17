"use client"

import { useState, useEffect, createContext, useContext, useRef } from "react"
import { Outlet, useParams, useNavigate } from "react-router-dom"
import CourseHeader from "../components/LearnerCourse/CourseHeader"
import CourseSidebar from "../components/LearnerCourse/CourseSidebar"
import { isAuthenticated, moduleDetails } from "../services/api.js"

// Course Context for sharing state between course components
const CourseContext = createContext()

export const useCourseContext = () => {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error("useCourseContext must be used within CourseLearnerLayout")
  }
  return context
}

/**
 * Course Learner Layout Component
 * Provides layout structure using existing CourseHeader and CourseSidebar components
 * Handles course-level data fetching and state management
 */
const CourseLearnerLayout = () => {
  const { courseId, moduleId } = useParams()
  const navigate = useNavigate()
  const sidebarRef = useRef(null)

  // Course data state
  const [courseData, setCourseData] = useState(null)
  const [modules, setModules] = useState([])
  const [currentModule, setCurrentModule] = useState(null)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [error, setError] = useState(null)
  const [hasExam, setHasExam] = useState(false)
  const [progress, setProgress] = useState(0)

  // Calculate course progress
  const calculateProgress = () => {
    if (!modules.length) return 0
    const completedModules = modules.filter((module) => module.is_completed).length
    return Math.round((completedModules / modules.length) * 100)
  }

  // Update progress when modules change
  useEffect(() => {
    const newProgress = calculateProgress()
    setProgress(newProgress)
  }, [modules])

  // Fetch course data
  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setError(null)

        // Check authentication
        if (!isAuthenticated()) {
          console.log("User not authenticated, redirecting to login")
          navigate("/login", { state: { from: `/learner/courses/${courseId}/${moduleId}` } })
          return
        }

        console.log("Fetching module data for:", { courseId, moduleId })
        const moduleData = await moduleDetails(courseId, moduleId)
        console.log("Received module data:", moduleData)

        if (!moduleData || !moduleData.course) {
          console.error("Invalid module data received:", moduleData)
          throw new Error("Invalid course data received from server")
        }

        if (!moduleData.all_modules || !moduleData.all_modules.length) {
          console.error("No modules found in course data:", moduleData)
          throw new Error("No modules found in this course")
        }

        // Set course data
        setCourseData(moduleData.course)
        setModules(moduleData.all_modules)
        setCurrentModule(moduleData.module)
        setCurrentModuleIndex(moduleData.all_modules.findIndex((m) => m.id === Number.parseInt(moduleId, 10)))

        // Check if exam is available
        const hasExam = moduleData.course.exam !== null
        setHasExam(hasExam)

        // Set initial progress
        const initialProgress = moduleData.course.progress || 0
        setProgress(initialProgress)
        
      } catch (err) {
        console.error("Error fetching module data:", err)
        setError(err.message || "Failed to load module data")
      }
    }

    fetchModuleData()
  }, [courseId, moduleId, navigate])

  // Handle click outside sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle clicks when sidebar is open and on mobile screens
      if (isSidebarOpen && window.innerWidth < 1024) {
        // Check if click is outside the sidebar
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          setIsSidebarOpen(false)
        }
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside)

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSidebarOpen])

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Module selection handler
  const selectModule = async (index) => {
    try {
      const response = await moduleDetails(Number.parseInt(courseId, 10), modules[index].id)
      setCurrentModule(response.module)
      setCurrentModuleIndex(index)
      navigate(`/learner/courses/${courseId}/${modules[index].id}`)
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      }
    } catch (err) {
      console.error("❌ Select Module Error:", err)
      setError(err.message || "Failed to load selected module. Please try again.")
    }
  }

  // Context value
  const courseContextValue = {
    courseId,
    moduleId,
    courseData,
    modules,
    currentModule,
    currentModuleIndex,
    
    error,
    hasExam,
    progress,
    calculateProgress,
    toggleSidebar,
    selectModule,
    setModules,
    setCurrentModule,
    setProgress,
  }


  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md p-8 bg-white border border-gray-200 rounded-lg">
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Essayer à nouveau
            </button>
            <button
              onClick={() => navigate("/learner")}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Revenir à votre profil
            </button>
          </div>
        </div>
      </div>
    )
  } 

  return (
    <CourseContext.Provider value={courseContextValue}>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Course Header - Full width at top */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-black">{courseData?.title || 'Loading...'}</h1>
            <div className="text-base text-gray-600">Progression: {calculateProgress()}%</div>
          </div>
          <CourseHeader courseTitle={courseData?.title || 'Loading...'} toggleSidebar={toggleSidebar} progress={calculateProgress()} />
        </div>

        {/* Main Layout Container - Full height and width */}
        <div className="flex flex-1 overflow-hidden">
          {/* Course Sidebar - Fixed position */}
          <div ref={sidebarRef} className="h-full">
            <CourseSidebar
              modules={modules}
              currentModuleId={currentModule?.id}
              onModuleSelect={selectModule}
              isOpen={isSidebarOpen}
              courseId={Number.parseInt(courseId, 10)}
              hasExam={hasExam}
              progress={calculateProgress()}
            />
          </div>

          {/* Main Content Area - Takes remaining space */}
          <div className="flex-1 overflow-auto bg-white">
            {!courseData || !currentModule ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </CourseContext.Provider>
  )
}

export default CourseLearnerLayout
