import { useState, useEffect } from "react"
import { useParams, useNavigate, Outlet, useLocation } from "react-router-dom"
import CourseHeader from "../components/LearnerCourse/CourseHeader"
import CourseSidebar from "../components/LearnerCourse/CourseSidebar"
import { isAuthenticated, moduleDetails, getExam } from "../services/api.js"

/**
 * Course Layout Component
 * Provides fixed layout with header, sidebar, and progress for course content
 */
const LearnerCourseLayout = () => {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [courseData, setCourseData] = useState(null)
    const [modules, setModules] = useState([])
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hasExam, setHasExam] = useState(false)

    // Calculate course progress
    const calculateProgress = () => {
        if (!modules.length) return 0
        const completedModules = modules.filter((module) => module.is_completed).length
        return Math.round((completedModules / modules.length) * 100)
    }

    // Get current module ID from URL
    const getCurrentModuleId = () => {
        const pathParts = location.pathname.split("/")
        const moduleIndex = pathParts.findIndex((part) => part === "module")
        return moduleIndex !== -1 && pathParts[moduleIndex + 1] ? Number.parseInt(pathParts[moduleIndex + 1], 10) : null
    }

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Check authentication
                if (!isAuthenticated()) {
                    console.log("User not authenticated, redirecting to login")
                    navigate("/login", { state: { from: location.pathname } })
                    return
                }

                console.log("Fetching course data for:", courseId)

                // Get first module to fetch course structure
                const moduleData = await moduleDetails(courseId, null)
                console.log("Received course data:", moduleData)

                if (!moduleData || !moduleData.course) {
                    throw new Error("Invalid course data received from server")
                }

                if (!moduleData.modules || !moduleData.modules.length) {
                    throw new Error("No modules found in this course")
                }

                // Set course data
                setCourseData(moduleData.course)
                setModules(moduleData.modules)

                // Check if exam is available
                try {
                    const examResponse = await getExam(Number.parseInt(courseId, 10))
                    setHasExam(!!examResponse.data?.exam)
                } catch (examErr) {
                    console.warn("No exam found:", examErr.message)
                    setHasExam(false)
                }

                // If no specific module in URL, redirect to first module
                const currentModuleId = getCurrentModuleId()
                if (!currentModuleId && moduleData.modules.length > 0) {
                    navigate(`/learner/courses/${courseId}/module/${moduleData.modules[0].id}`, { replace: true })
                }

                setLoading(false)
            } catch (err) {
                console.error("Error fetching course data:", err)
                setError(err.message || "Failed to load course data")
                setLoading(false)
            }
        }

        if (courseId) {
            fetchCourseData()
        }
    }, [courseId, navigate, location.pathname])

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const selectModule = (moduleId) => {
        navigate(`/learner/courses/${courseId}/module/${moduleId}`)
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false)
        }
    }

    const updateModuleCompletion = (moduleId, isCompleted) => {
        setModules((prev) =>
            prev.map((module) => (module.id === moduleId ? { ...module, is_completed: isCompleted } : module)),
        )
    }

    const retryFetch = () => {
        window.location.reload()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading course content...</p>
                </div>
            </div>
        )
    }

    if (error || !courseData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <p className="text-red-500 mb-4">{error || "Course not found."}</p>
                    <div className="space-y-3">
                        <button
                            onClick={retryFetch}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate("/learner/courses")}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                            Back to Courses
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
                        <div className="text-sm text-gray-600">Progress: {calculateProgress()}%</div>
                    </div>

                    <CourseHeader courseTitle={courseData.title} toggleSidebar={toggleSidebar} progress={calculateProgress()} />

                    <div className="flex flex-1 overflow-hidden">
                        <CourseSidebar
                            modules={modules}
                            currentModuleId={getCurrentModuleId()}
                            onModuleSelect={selectModule}
                            isOpen={isSidebarOpen}
                            courseId={Number.parseInt(courseId, 10)}
                            hasExam={hasExam}
                            progress={calculateProgress()}
                        />

                        {/* This is where the dynamic content will be rendered */}
                        <div className="flex-1 overflow-hidden">
                            <Outlet
                                context={{
                                    courseData,
                                    modules,
                                    updateModuleCompletion,
                                    calculateProgress,
                                    hasExam,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LearnerCourseLayout
