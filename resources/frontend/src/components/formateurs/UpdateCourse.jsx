"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  Video,
  ImageIcon,
  BookOpen,
  Users,
  Clock,
  Star,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Upload,
  Link,
  Award,
  Settings,
  Check,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  FileIcon,
  Loader2,
} from "lucide-react"
import { getAllContentCourse, updateCourseOverview, updateCourseResources, updateCourseExam, updateCourseModules } from "../../services/api_instructor"
import { toast } from "react-hot-toast"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
const backend_url = import.meta.env.VITE_BACKEND_URL

// Helper to get the correct course thumbnail URL
const getCourseThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return "/placeholder-image.png" // Use your placeholder path

  // If it's a File object (newly selected file), create a URL for preview
  if (thumbnail instanceof File) {
    return URL.createObjectURL(thumbnail)
  }

  // If it's a string URL
  if (typeof thumbnail === 'string') {
    if (thumbnail.startsWith("http")) return thumbnail
    return backend_url + thumbnail
  }

  return "/placeholder-image.png"
}

const UpdateCourse = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [editingSection, setEditingSection] = useState(null)
  const [expandedModules, setExpandedModules] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteItemType, setDeleteItemType] = useState(null)
  const [deleteItemId, setDeleteItemId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [previewModal, setPreviewModal] = useState({ open: false, type: "", src: "", name: "" })

  // Track changes in different sections
  const [changedSections, setChangedSections] = useState({
    overview: false,
    modules: false,
    exam: false,
    resources: false,
  })

  // Track thumbnail changes
  const [thumbnailChanged, setThumbnailChanged] = useState(false)

  // New module state
  const [newModule, setNewModule] = useState({
    title: "",
    type: "text",
    text_content: "",
    file: null,
    duration_min: 0,
    pageCount: 1,
    imageCount: 1,
    videoDuration: 1,
    quiz_questions: [],
    isDurationOverridden: false,
  })

  // Resource management state
  const [newResource, setNewResource] = useState({
    name: "",
    type: "pdf",
    file: null,
    url: "",
  })
  const [resourceErrors, setResourceErrors] = useState({})
  const [moduleErrors, setModuleErrors] = useState({})

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    type: "",
    id: null,
    name: "",
  })

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getAllContentCourse(courseId)
        // Store original thumbnail for reset functionality
        const courseWithOriginal = {
          ...data.course,
          original_thumbnail: data.course.course_thumbnail
        }
        setCourse(courseWithOriginal)
        console.log("course", courseWithOriginal)
        console.log("backend_url", backend_url)
      } catch (err) {
        setError("Error loading course data")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  // Recalculate course duration when course data is loaded
  useEffect(() => {
    if (course && course.modules) {
      updateCourseDuration()
    }
  }, [course?.modules?.length, course?.exam?.duration_min])

  // Update duration when new module content changes
  useEffect(() => {
    if (!newModule.isDurationOverridden) {
      const estimatedDuration = calculateModuleDuration(newModule)
      setNewModule((prev) => ({
        ...prev,
        duration_min: estimatedDuration,
      }))
    }
  }, [newModule.text_content, newModule.pageCount, newModule.videoDuration, newModule.type, newModule.quiz_questions, newModule.isDurationOverridden])

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  // Mark a section as changed
  const markSectionChanged = (section) => {
    setChangedSections((prev) => ({
      ...prev,
      [section]: true,
    }))
  }

  const handleCancel = () => {
    navigate(`/instructor/manage-course/${courseId}`)
  }

  // Save all changes
  const handleSaveAll = async () => {
    setSaving(true)
    try {
      // Check which sections need to be updated
      const { overview, modules, exam, resources } = changedSections

      // Log which sections will be updated
      console.log("Saving changes for sections:", {
        overview,
        modules,
        exam,
        resources,
      })

      if (overview) {
        const overviewData = {
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          category: course.category,
          language: course.language,
          duration_min: course.duration_min,
          is_published: course.is_published,
          course_thumbnail: course.course_thumbnail,
        }
        console.log("overview", overviewData)
        const response = await updateCourseOverview(courseId, overviewData)
        console.log("response", response)
      }
      // ─── Update course modules ──────────────────────────────────────
      if (modules) {
        console.log("modules", course.modules)
        const response = await updateCourseModules(courseId, course.modules, course.duration_min)
        console.log("response", response)
      }
      // ─── Update course exam ──────────────────────────────────────────
      if (exam) {
        console.log("exam", course.exam)
        const response = await updateCourseExam(courseId, course.exam , course.duration_min)
        console.log("response", response)
      }


      // ─── Update course resources ──────────────────────────────────────
      if (resources) {
        console.log("resources", course.resources)
        const response = await updateCourseResources(courseId, course.resources)
        console.log("response", response)
      }

      // Reset changed sections after successful save
      setChangedSections({
        overview: false,
        modules: false,
        exam: false,
        resources: false,
      })

      toast.success("All changes saved successfully!")
    } catch (err) {
      toast.error("Error saving course changes")
      console.error("Error:", err)
    } finally {
      setSaving(false)
      // refresh the page
      window.location.reload()
    }
  }

  // Save changes for a specific section
  const handleSectionSave = async (section) => {
    try {
      // TODO: Implement section-specific save functionality
      console.log(`Saving ${section} changes...`, course)

      // Mark the section as changed (don't reset until "Save All Changes" is clicked)
      setChangedSections((prev) => ({
        ...prev,
        [section]: true,
      }))

      // Reset thumbnail changed flag if overview is saved
      if (section === 'overview' && thumbnailChanged) {
        setThumbnailChanged(false)
        // Update the original thumbnail to the new one
        setCourse((prev) => ({
          ...prev,
          original_thumbnail: prev.course_thumbnail
        }))
      }

      setEditingSection(null)
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} changes saved!`)
    } catch (err) {
      toast.error(`Error saving ${section} changes`)
      console.error("Error:", err)
    }
  }

  // Validate module before adding
  const validateModule = () => {
    const errors = {}

    if (!newModule.title.trim()) {
      errors.title = "Module title is required"
    }

    if (newModule.type === "text" && !newModule.text_content.trim()) {
      errors.content = "Text content is required"
    }

    if (["pdf", "video", "image"].includes(newModule.type) && !newModule.file) {
      errors.file = "File is required for this module type"
    }

    if (newModule.type === "quiz" && (!newModule.quiz_questions || newModule.quiz_questions.length === 0)) {
      errors.quiz = "At least one question is required for quiz modules"
    }

    return errors
  }

  // Add a new module
  const addModule = () => {
    const errors = validateModule()

    if (Object.keys(errors).length > 0) {
      setModuleErrors(errors)
      return
    }

    const moduleToAdd = {
      id: Date.now(),
      title: newModule.title,
      type: newModule.type,
      text_content: newModule.type === "text" ? newModule.text_content : "",
      file_path: null, // This will be set by the backend
      file: newModule.file, // For frontend use only
      order: course.modules.length,
      duration_min: newModule.duration_min || calculateModuleDuration(newModule),
      quiz_questions: newModule.type === "quiz" ? [...newModule.quiz_questions] : [],
      pageCount: newModule.pageCount,
      imageCount: newModule.imageCount,
      videoDuration: newModule.videoDuration,
    }

    const updatedModules = [...course.modules, moduleToAdd]
    setCourse((prev) => ({
      ...prev,
      modules: updatedModules,
    }))

    // Update course duration
    updateCourseDuration(updatedModules)

    // Reset the new module form
    setNewModule({
      title: "",
      type: "text",
      text_content: "",
      file: null,
      duration_min: 0,
      pageCount: 1,
      imageCount: 1,
      videoDuration: 1,
      quiz_questions: [],
      isDurationOverridden: false,
    })

    setModuleErrors({})
    markSectionChanged("modules")
    toast.success("Module added successfully!")
  }

  // Calculate module duration based on content
  const calculateModuleDuration = (module) => {
    switch (module.type) {
      case "quiz":
        return module.quiz_questions?.length * 5 || 0 // 5 minutes per question
      case "pdf":
        return module.pageCount * 10 // 10 minutes per page
      case "image":
        return module.imageCount * 5 // 5 minutes per image
      case "text":
        const characterCount = module.text_content?.replace(/<[^>]*>/g, "").length || 0
        return Math.ceil(characterCount / 200) // 200 characters per minute, rounded up
      case "video":
        return module.videoDuration || 0
      default:
        return 0
    }
  }

  // Calculate total course duration
  const calculateTotalCourseDuration = () => {
    return course?.modules?.reduce((total, module) => {
      return total + (module.duration_min || module.duration || 0)
    }, 0) || 0
  }

  // Update course duration when modules change
  const updateCourseDuration = (modules = null, examDuration = null) => {
    // Use provided modules or current course modules
    const modulesToCalculate = modules || course?.modules || []

    // Calculate total modules duration
    const modulesDuration = modulesToCalculate.reduce((total, module) => {
      return total + (module.duration_min || module.duration || 0)
    }, 0)

    // Get exam duration (use provided or current exam duration)
    const examDurationToAdd = examDuration !== null ? examDuration : (course?.exam?.duration_min || 0)

    // Calculate total course duration (modules + exam)
    const totalDuration = modulesDuration + examDurationToAdd

    setCourse((prev) => ({
      ...prev,
      duration_min: totalDuration,
    }))
  }

  // Delete a module
  const deleteModule = (moduleId) => {
    setDeleteModal({
      show: true,
      type: "module",
      id: moduleId,
      name: course.modules.find((m) => m.id === moduleId)?.title || "this module",
    })
  }

  // Confirm deletion
  const confirmDelete = () => {
    const { type, id } = deleteModal

    if (type === "module") {
      const updatedModules = course.modules.filter((m) => m.id !== id)
      setCourse((prev) => ({
        ...prev,
        modules: updatedModules,
      }))
      // Update course duration
      updateCourseDuration(updatedModules)
      markSectionChanged("modules")
    } else if (type === "resource") {
      setCourse((prev) => ({
        ...prev,
        resources: prev.resources.filter((r) => r.id !== id),
      }))
      markSectionChanged("resources")
    } else if (type === "exam_question") {
      setCourse((prev) => ({
        ...prev,
        exam: {
          ...prev.exam,
          questions: prev.exam.questions.filter((q) => q.id !== id),
        },
      }))
      // Don't mark as changed until save button is clicked
    }

    setDeleteModal({ show: false, type: "", id: null, name: "" })
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`)
  }

  const addQuestion = (moduleId) => {
    const newQuestion = {
      id: Date.now(),
      question: "New Question",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correct_option: 0,
    }
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, quiz_questions: [...m.quiz_questions, newQuestion] } : m,
      ),
    }))
  }

  // Resource management functions
  const handleAddResource = () => {
    const errors = {}

    if (!newResource.name.trim()) {
      errors.resource_name = "Le nom de la ressource est requis"
    }

    if (["pdf", "video", "image"].includes(newResource.type) && !newResource.file) {
      errors.resource_file = "Un fichier est requis pour ce type de ressource"
    }

    if (["link", "other"].includes(newResource.type) && !newResource.url.trim()) {
      errors.resource_url = "Une URL est requise pour ce type de ressource"
    }

    if (Object.keys(errors).length > 0) {
      setResourceErrors(errors)
      return
    }

    const resourceToAdd = {
      id: Date.now(),
      name: newResource.name,
      type: newResource.type,
      file: newResource.file,
      url: newResource.url,
    }

    setCourse((prev) => ({
      ...prev,
      resources: [...prev.resources, resourceToAdd],
    }))

    // Reset form
    setNewResource({
      name: "",
      type: "pdf",
      file: null,
      url: "",
    })
    setResourceErrors({})
    markSectionChanged("resources")
    toast.success("Resource added successfully!")
  }

  const handleRemoveResource = (resourceId) => {
    setDeleteModal({
      show: true,
      type: "resource",
      id: resourceId,
      name: course.resources.find((r) => r.id === resourceId)?.name || "this resource",
    })
  }

  const handleResourceFileChange = (e) => {
    if (e.target.files[0]) {
      setNewResource((prev) => ({
        ...prev,
        file: e.target.files[0],
      }))
      // Clear file error when file is selected
      if (resourceErrors.resource_file) {
        setResourceErrors((prev) => ({
          ...prev,
          resource_file: null,
        }))
      }
    }
  }

  const handleModuleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewModule((prev) => ({
        ...prev,
        file: e.target.files[0],
        id: Date.now(), // Add unique ID based on current timestamp
      }))
      // Clear file error when file is selected
      if (moduleErrors.file) {
        setModuleErrors((prev) => ({
          ...prev,
          file: null,
        }))
      }
    }
  }

  const handleDeleteItem = (type, id) => {
    setDeleteItemType(type)
    setDeleteItemId(id)
    setShowDeleteConfirm(true)
  }

  const moveModule = (index, direction) => {
    setCourse((prev) => {
      const modules = [...prev.modules]
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= modules.length) return prev
      const temp = modules[index]
      modules[index] = modules[newIndex]
      modules[newIndex] = temp
      // Update order property if needed
      modules.forEach((m, i) => (m.order = i))
      return { ...prev, modules }
    })
    markSectionChanged("modules")
  }

  // Quiz editing helpers
  const handleQuizQuestionChange = (moduleId, qIndex, field, value) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) => (i === qIndex ? { ...q, [field]: value } : q)),
            }
          : m,
      ),
    }))
    markSectionChanged("modules")
  }

  // Exam editing helpers
  const handleExamQuestionChange = (qIndex, field, value) => {
    setCourse((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: prev.exam.questions.map((q, i) => (i === qIndex ? { ...q, [field]: value } : q)),
      },
    }))
    // Don't mark as changed until save button is clicked
  }

  const handleExamOptionChange = (qIndex, optIndex, value) => {
    setCourse((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: prev.exam.questions.map((q, i) =>
          i === qIndex
            ? {
                ...q,
                options: q.options.map((opt, oi) => (oi === optIndex ? value : opt)),
              }
            : q,
        ),
      },
    }))
    // Don't mark as changed until save button is clicked
  }

  const handleExamCorrectOption = (qIndex, optIndex) => {
    setCourse((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: prev.exam.questions.map((q, i) => (i === qIndex ? { ...q, correct_index: optIndex } : q)),
      },
    }))
    // Don't mark as changed until save button is clicked
  }

  const handleExamAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question_text: "New Question",
      options: ["Option 1", "Option 2"],
      correct_index: 0,
    }
    setCourse((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: [...prev.exam.questions, newQuestion],
      },
    }))
    // Don't mark as changed until save button is clicked
  }

  const handleExamDeleteQuestion = (qIndex) => {
    const questionId = course.exam.questions[qIndex].id
    setDeleteModal({
      show: true,
      type: "exam_question",
      id: questionId,
      name: `question ${qIndex + 1}`,
    })
  }

  const handleExamAddOption = (qIndex) => {
    setCourse((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: prev.exam.questions.map((q, i) =>
          i === qIndex ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q,
        ),
      },
    }))
    // Don't mark as changed until save button is clicked
  }

  const handleExamRemoveOption = (qIndex, optIndex) => {
    setCourse((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: prev.exam.questions.map((q, i) => {
          if (i !== qIndex) return q
          if (q.options.length <= 2) return q // Don't allow less than 2 options
          const newOptions = q.options.filter((_, oi) => oi !== optIndex)
          let newCorrect = q.correct_index
          if (q.correct_index === optIndex) newCorrect = 0
          else if (q.correct_index > optIndex) newCorrect = q.correct_index - 1
          return { ...q, options: newOptions, correct_index: newCorrect }
        }),
      },
    }))
    // Don't mark as changed until save button is clicked
  }

  const handleExamSettingsChange = (field, value) => {
    setCourse((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        [field]: value,
      },
    }))

    // Update course duration if exam duration changed
    if (field === "duration_min") {
      updateCourseDuration(null, value)
    }

    // Don't mark as changed until save button is clicked
  }

  const createExam = () => {
    const newExam = {
      id: Date.now(),
      duration_min: 60,
      passing_score: 70,
      questions: [],
    }
    setCourse((prev) => ({
      ...prev,
      exam: newExam,
    }))

    // Update course duration to include the new exam duration
    updateCourseDuration(null, 60)

    setEditingSection("exam")
    // Don't mark as changed until save button is clicked
  }
  const handleQuizOptionChange = (moduleId, qIndex, optIndex, value) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) =>
                i === qIndex
                  ? {
                      ...q,
                      options: q.options.map((opt, oi) => (oi === optIndex ? value : opt)),
                    }
                  : q,
              ),
            }
          : m,
      ),
    }))
    markSectionChanged("modules")
  }
  const handleQuizCorrectOption = (moduleId, qIndex, optIndex) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) => (i === qIndex ? { ...q, correct_option: optIndex } : q)),
            }
          : m,
      ),
    }))
    markSectionChanged("modules")
  }
  const handleQuizAddQuestion = (moduleId) => {
    const newQuestion = {
      id: Date.now(),
      question: "New Question",
      options: ["Option 1", "Option 2"],
      correct_option: 0,
    }
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, quiz_questions: [...m.quiz_questions, newQuestion] } : m,
      ),
    }))
    markSectionChanged("modules")
  }
  const handleQuizDeleteQuestion = (moduleId, qIndex) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.filter((_, i) => i !== qIndex),
            }
          : m,
      ),
    }))
    markSectionChanged("modules")
  }
  const handleQuizAddOption = (moduleId, qIndex) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) =>
                i === qIndex ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q,
              ),
            }
          : m,
      ),
    }))
    markSectionChanged("modules")
  }
  const handleQuizRemoveOption = (moduleId, qIndex, optIndex) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) => {
                if (i !== qIndex) return q
                if (q.options.length <= 2) return q // Don't allow less than 2 options
                const newOptions = q.options.filter((_, oi) => oi !== optIndex)
                let newCorrect = q.correct_option
                if (q.correct_option === optIndex) newCorrect = 0
                else if (q.correct_option > optIndex) newCorrect = q.correct_option - 1
                return { ...q, options: newOptions, correct_option: newCorrect }
              }),
            }
          : m,
      ),
    }))
    markSectionChanged("modules")
  }

  // Handle overview changes
  const handleOverviewChange = (field, value) => {
    setCourse((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Track thumbnail changes specifically
    if (field === 'course_thumbnail') {
      setThumbnailChanged(true)
    }

    // Don't mark as changed until save button is clicked
  }



  // Handle module field changes
  const handleModuleChange = (field, value) => {
    setNewModule((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field if it exists
    if (moduleErrors[field]) {
      setModuleErrors((prev) => ({
        ...prev,
        [field]: null,
      }))
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Course not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Gestion du cours</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving || !Object.values(changedSections).some(Boolean)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  saving || !Object.values(changedSections).some(Boolean)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Enregistrer tous les changements</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
          <div className="relative h-64 ">
            <img
              src={getCourseThumbnailUrl(course.course_thumbnail) || "/placeholder.svg"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-opacity-0 flex items-end">
              <div className="p-8 text-white bg-gradient-to-t from-gray-900 via-black/50 to-transparent rounded-lg m-4">
                <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{course.students_count} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Math.floor(course.duration_min / 60)}h {course.duration_min % 60}m
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{course.rating}/5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {course.is_published ? (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span>Draft</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: BookOpen },
                { id: "modules", label: "Modules", icon: FileText },
                { id: "exam", label: "Final Exam", icon: Award },
                { id: "resources", label: "Resources", icon: Link },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } ${changedSections[tab.id] ? "relative" : ""}`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {changedSections[tab.id] && (
                    <span className="absolute top-2 right-0 h-2 w-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Course Overview</h2>
                <button
                  onClick={() => setEditingSection("overview")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
              </div>

              {editingSection === "overview" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => handleOverviewChange("title", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={course.description}
                      onChange={(e) => handleOverviewChange("description", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                      <select
                        value={course.level}
                        onChange={(e) => handleOverviewChange("level", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={course.category}
                        onChange={(e) => handleOverviewChange("category", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={course.language}
                        onChange={(e) => handleOverviewChange("language", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="english">English</option>
                        <option value="french">French</option>
                        <option value="arabic">Arabic</option>
                        <option value="spanish">Spanish</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                    <div className="mt-1 flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={getCourseThumbnailUrl(course.course_thumbnail) || "/placeholder.svg"}
                          alt="Course thumbnail"
                          className="h-32 w-48 object-cover rounded-lg border border-gray-300"
                        />
                        {thumbnailChanged && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            New
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              const file = e.target.files[0]
                              // Validate file size (2MB limit)
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error("File size must be less than 2MB")
                                return
                              }
                              // Validate file type
                              if (!file.type.startsWith('image/')) {
                                toast.error("Please select an image file")
                                return
                              }
                              handleOverviewChange("course_thumbnail", file)
                              toast.success("Thumbnail updated! Click Save to apply changes.")
                            }
                          }}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-sm text-gray-500">Recommended size: 1280x720px. Max file size: 2MB</p>
                        {thumbnailChanged && (
                          <div className="mt-2 flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                // Reset to original thumbnail
                                setCourse((prev) => ({
                                  ...prev,
                                  course_thumbnail: prev.original_thumbnail || prev.course_thumbnail
                                }))
                                setThumbnailChanged(false)
                                toast.info("Thumbnail reset to original")
                              }}
                              className="text-sm text-gray-600 hover:text-gray-800 underline"
                            >
                              Reset to original
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSectionSave("overview")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Enregistrer</span>
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Annuler</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700">{course.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{course.students_count}</div>
                      <div className="text-sm text-gray-600">Students Enrolled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{course.modules.length}</div>
                      <div className="text-sm text-gray-600">Modules</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{Math.floor(course.duration_min / 60)}h</div>
                      <div className="text-sm text-gray-600">Total Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{course.rating}</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Level</h4>
                      <p className="text-lg text-gray-900">{course.level}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Category</h4>
                      <p className="text-lg text-gray-900">{course.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Language</h4>
                      <p className="text-lg text-gray-900">{course.language}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === "modules" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Course Modules</h2>
                <button
                  onClick={() => setEditingSection("add-module")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter un module</span>
                </button>
              </div>

              {/* Add Module Form */}
              {editingSection === "add-module" && (
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un nouveau module</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Module Title</label>
                        <input
                          type="text"
                          value={newModule.title}
                          onChange={(e) => handleModuleChange("title", e.target.value)}
                          className={`w-full border ${moduleErrors.title ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="Enter module title"
                        />
                        {moduleErrors.title && <p className="mt-1 text-sm text-red-600">{moduleErrors.title}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Module Type</label>
                        <select
                          value={newModule.type}
                          onChange={(e) => handleModuleChange("type", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="text">Text</option>
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                          <option value="image">Image</option>
                          <option value="quiz">Quiz</option>
                        </select>
                      </div>
                    </div>

                    {/* Content based on type */}
                    {newModule.type === "text" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                        <div className={`${moduleErrors.content ? "border-red-500" : ""}`}>
                          <ReactQuill
                            value={newModule.text_content}
                            onChange={(content) => handleModuleChange("text_content", content)}
                            className="bg-white"
                            placeholder="Enter module content..."
                            theme="snow"
                            modules={{
                              toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['blockquote', 'code-block'],
                                ['link'],
                                ['clean']
                              ],
                            }}
                            formats={[
                              'header', 'bold', 'italic', 'underline', 'strike',
                              'list', 'bullet', 'blockquote', 'code-block', 'link'
                            ]}
                          />
                        </div>
                        {moduleErrors.content && <p className="mt-1 text-sm text-red-600">{moduleErrors.content}</p>}
                      </div>
                    )}

                    {newModule.type === "video" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                        <div
                          className={`border-2 border-dashed ${moduleErrors.file ? "border-red-500" : "border-gray-300"} rounded-lg p-4 text-center hover:border-blue-500 transition-colors`}
                        >
                          <input
                            type="file"
                            id="moduleVideo"
                            className="hidden"
                            accept="video/*"
                            onChange={handleModuleFileChange}
                          />
                          {newModule.file ? (
                            <div className="flex items-center justify-center">
                              <Video className="h-6 w-6 text-gray-500 mr-2" />
                              <span className="text-gray-700">{newModule.file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleModuleChange("file", null)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label htmlFor="moduleVideo" className="cursor-pointer">
                              <div className="flex flex-col items-center">
                                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                <span className="text-blue-600 hover:text-blue-800">Click to upload video</span>
                                <p className="text-sm text-gray-500 mt-1">MP4, WebM, or other video formats</p>
                              </div>
                            </label>
                          )}
                        </div>
                        {moduleErrors.file && <p className="mt-1 text-sm text-red-600">{moduleErrors.file}</p>}

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video Duration (minutes)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={newModule.videoDuration}
                            onChange={(e) => handleModuleChange("videoDuration", Number.parseInt(e.target.value) || 1)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {newModule.type === "pdf" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
                        <div
                          className={`border-2 border-dashed ${moduleErrors.file ? "border-red-500" : "border-gray-300"} rounded-lg p-4 text-center hover:border-blue-500 transition-colors`}
                        >
                          <input
                            type="file"
                            id="modulePdf"
                            className="hidden"
                            accept=".pdf"
                            onChange={handleModuleFileChange}
                          />
                          {newModule.file ? (
                            <div className="flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-500 mr-2" />
                              <span className="text-gray-700">{newModule.file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleModuleChange("file", null)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label htmlFor="modulePdf" className="cursor-pointer">
                              <div className="flex flex-col items-center">
                                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                <span className="text-blue-600 hover:text-blue-800">Click to upload PDF</span>
                                <p className="text-sm text-gray-500 mt-1">PDF files only</p>
                              </div>
                            </label>
                          )}
                        </div>
                        {moduleErrors.file && <p className="mt-1 text-sm text-red-600">{moduleErrors.file}</p>}

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Pages</label>
                          <input
                            type="number"
                            min="1"
                            value={newModule.pageCount}
                            onChange={(e) => handleModuleChange("pageCount", Number.parseInt(e.target.value) || 1)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {newModule.type === "image" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image File</label>
                        <div
                          className={`border-2 border-dashed ${moduleErrors.file ? "border-red-500" : "border-gray-300"} rounded-lg p-4 text-center hover:border-blue-500 transition-colors`}
                        >
                          <input
                            type="file"
                            id="moduleImage"
                            className="hidden"
                            accept="image/*"
                            onChange={handleModuleFileChange}
                          />
                          {newModule.file ? (
                            <div className="flex items-center justify-center">
                              <img
                                src={URL.createObjectURL(newModule.file) || "/placeholder.svg"}
                                alt="Preview"
                                className="h-24 object-contain mb-2"
                              />
                              <button
                                type="button"
                                onClick={() => handleModuleChange("file", null)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label htmlFor="moduleImage" className="cursor-pointer">
                              <div className="flex flex-col items-center">
                                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                <span className="text-blue-600 hover:text-blue-800">Click to upload image</span>
                                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                              </div>
                            </label>
                          )}
                        </div>
                        {moduleErrors.file && <p className="mt-1 text-sm text-red-600">{moduleErrors.file}</p>}

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Images</label>
                          <input
                            type="number"
                            min="1"
                            value={newModule.imageCount}
                            onChange={(e) => handleModuleChange("imageCount", Number.parseInt(e.target.value) || 1)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {newModule.type === "quiz" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Questions</label>
                        {moduleErrors.quiz && <p className="mb-2 text-sm text-red-600">{moduleErrors.quiz}</p>}

                        {newModule.quiz_questions.length > 0 ? (
                          <div className="space-y-4 mb-4">
                            {newModule.quiz_questions.map((question, qIndex) => (
                              <div key={qIndex} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">Question {qIndex + 1}</h4>
                                  <button
                                    onClick={() => {
                                      const updatedQuestions = [...newModule.quiz_questions]
                                      updatedQuestions.splice(qIndex, 1)
                                      handleModuleChange("quiz_questions", updatedQuestions)
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={question.question}
                                  onChange={(e) => {
                                    const updatedQuestions = [...newModule.quiz_questions]
                                    updatedQuestions[qIndex].question = e.target.value
                                    handleModuleChange("quiz_questions", updatedQuestions)
                                  }}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Question text"
                                />
                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        checked={question.correct_option === optIndex}
                                        onChange={() => {
                                          const updatedQuestions = [...newModule.quiz_questions]
                                          updatedQuestions[qIndex].correct_option = optIndex
                                          handleModuleChange("quiz_questions", updatedQuestions)
                                        }}
                                        className="h-4 w-4 text-blue-600"
                                      />
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                          const updatedQuestions = [...newModule.quiz_questions]
                                          updatedQuestions[qIndex].options[optIndex] = e.target.value
                                          handleModuleChange("quiz_questions", updatedQuestions)
                                        }}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={`Option ${optIndex + 1}`}
                                      />
                                      {question.options.length > 2 && (
                                        <button
                                          onClick={() => {
                                            const updatedQuestions = [...newModule.quiz_questions]
                                            updatedQuestions[qIndex].options.splice(optIndex, 1)
                                            if (question.correct_option === optIndex) {
                                              updatedQuestions[qIndex].correct_option = 0
                                            } else if (question.correct_option > optIndex) {
                                              updatedQuestions[qIndex].correct_option--
                                            }
                                            handleModuleChange("quiz_questions", updatedQuestions)
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const updatedQuestions = [...newModule.quiz_questions]
                                      updatedQuestions[qIndex].options.push(`Option ${question.options.length + 1}`)
                                      handleModuleChange("quiz_questions", updatedQuestions)
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Option
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4">
                            <p className="text-gray-500">No questions added yet</p>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            const newQuestion = {
                              id: Date.now(),
                              question: "New Question",
                              options: ["Option 1", "Option 2"],
                              correct_option: 0,
                            }
                            handleModuleChange("quiz_questions", [...newModule.quiz_questions, newQuestion])
                          }}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Question</span>
                        </button>
                      </div>
                    )}

                    {/* Duration Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Estimated Duration</label>
                        <div className="flex items-center text-sm text-blue-600 font-medium">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{newModule.duration_min} min</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="number"
                          min="1"
                          value={newModule.duration_min}
                          onChange={(e) =>
                            setNewModule((prev) => ({
                              ...prev,
                              duration_min: Number.parseInt(e.target.value) || 0,
                              isDurationOverridden: true,
                            }))
                          }
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Minutes"
                        />
                        <span className="text-sm text-gray-500">minutes</span>
                        {newModule.isDurationOverridden && (
                          <button
                            type="button"
                            onClick={() =>
                              setNewModule((prev) => ({
                                ...prev,
                                isDurationOverridden: false,
                                duration_min: calculateModuleDuration(prev),
                              }))
                            }
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {!newModule.isDurationOverridden && "Duration calculated automatically based on content"}
                      </p>
                    </div>

                    <div className="flex items-center justify-end space-x-4 mt-6">
                      <button
                        onClick={() => setEditingSection(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addModule}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Module
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {course.modules.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No modules added yet</p>
                  <button
                    onClick={() => setEditingSection("add-module")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Module
                  </button>
                </div>
              ) : (
                course.modules.map((module, index) => (
                  <div key={module.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {module.type === "video" && <Video className="h-6 w-6 text-red-500" />}
                            {module.type === "text" && <FileText className="h-6 w-6 text-blue-500" />}
                            {module.type === "image" && <ImageIcon className="h-6 w-6 text-green-500" />}
                            {module.type === "pdf" && <FileIcon className="h-6 w-6 text-yellow-500" />}
                            {module.type === "quiz" && <BookOpen className="h-6 w-6 text-purple-500" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{module.title}</h3>
                            <p className="text-sm text-gray-500">
                              Module {index + 1} • {module.duration_min || module.duration || 0} minutes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveModule(index, -1)}
                            disabled={index === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveModule(index, 1)}
                            disabled={index === course.modules.length - 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleModuleExpansion(module.id)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            {expandedModules[module.id] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingSection(`module-${module.id}`)}
                            className="p-2 text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteModule(module.id)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedModules[module.id] && (
                      <div className="p-6 bg-gray-50">
                        {editingSection === `module-${module.id}` ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                  type="text"
                                  value={module.title}
                                  onChange={(e) => {
                                    const updatedModules = course.modules.map((m) =>
                                      m.id === module.id ? { ...m, title: e.target.value } : m,
                                    )
                                    setCourse((prev) => ({
                                      ...prev,
                                      modules: updatedModules,
                                    }))
                                    // Don't mark as changed until save button is clicked
                                  }}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <input
                                  type="text"
                                  value={module.type.charAt(0).toUpperCase() + module.type.slice(1)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                                  disabled
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={module.duration_min || module.duration || 0}
                                  onChange={(e) => {
                                    const newDuration = Number.parseInt(e.target.value) || 0
                                    const updatedModules = course.modules.map((m) =>
                                      m.id === module.id ? { ...m, duration_min: newDuration } : m,
                                    )
                                    setCourse((prev) => ({
                                      ...prev,
                                      modules: updatedModules,
                                    }))
                                    // Update course duration immediately
                                    updateCourseDuration(updatedModules)
                                    // Don't mark as changed until save button is clicked
                                  }}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            {/* Content based on type */}
                            {module.type === "text" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                <ReactQuill
                                  value={module.text_content}
                                  onChange={(content) => {
                                    setCourse((prev) => ({
                                      ...prev,
                                      modules: prev.modules.map((m) =>
                                        m.id === module.id ? { ...m, text_content: content } : m,
                                      ),
                                    }))
                                    // Don't mark as changed until save button is clicked
                                  }}
                                  className="bg-white"
                                  placeholder="Enter module content..."
                                  theme="snow"
                                  modules={{
                                    toolbar: [
                                      [{ 'header': [1, 2, 3, false] }],
                                      ['bold', 'italic', 'underline', 'strike'],
                                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                      ['blockquote', 'code-block'],
                                      ['link'],
                                      ['clean']
                                    ],
                                  }}
                                  formats={[
                                    'header', 'bold', 'italic', 'underline', 'strike',
                                    'list', 'bullet', 'blockquote', 'code-block', 'link'
                                  ]}
                                />
                              </div>
                            )}
                            {module.type === "video" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                                {module.file_path && (
                                  <div className="flex items-center space-x-2 mb-2">
                                    <button
                                      onClick={() =>
                                        setPreviewModal({
                                          open: true,
                                          type: "video",
                                          src: backend_url + module.file_path,
                                          name: module.title,
                                        })
                                      }
                                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span>Preview</span>
                                    </button>
                                    <video controls className="h-16 w-auto rounded">
                                      <source src={backend_url + module.file_path} type="video/mp4" />
                                    </video>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="block w-full text-sm text-gray-500"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      setCourse((prev) => ({
                                        ...prev,
                                        modules: prev.modules.map((m) =>
                                          m.id === module.id ? { ...m, file: e.target.files[0] } : m,
                                        ),
                                      }))
                                      // Don't mark as changed until save button is clicked
                                    }
                                  }}
                                />
                              </div>
                            )}
                            {module.type === "image" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image File</label>
                                {module.file_path && (
                                  <div className="flex items-center space-x-2 mb-2">
                                    <button
                                      onClick={() =>
                                        setPreviewModal({
                                          open: true,
                                          type: "image",
                                          src: backend_url + module.file_path,
                                          name: module.title,
                                        })
                                      }
                                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span>Preview</span>
                                    </button>
                                    <img
                                      src={backend_url + module.file_path || "/placeholder.svg"}
                                      alt="Module"
                                      className="h-16 w-auto rounded"
                                    />
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="block w-full text-sm text-gray-500"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      setCourse((prev) => ({
                                        ...prev,
                                        modules: prev.modules.map((m) =>
                                          m.id === module.id ? { ...m, file: e.target.files[0] } : m,
                                        ),
                                      }))
                                      // Don't mark as changed until save button is clicked
                                    }
                                  }}
                                />
                              </div>
                            )}
                            {module.type === "pdf" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
                                {module.file_path && (
                                  <div className="flex items-center space-x-2 mb-2">
                                    <button
                                      onClick={() =>
                                        setPreviewModal({
                                          open: true,
                                          type: "pdf",
                                          src: backend_url + module.file_path,
                                          name: module.title,
                                        })
                                      }
                                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span>Preview PDF</span>
                                    </button>
                                    <FileIcon className="h-8 w-8 text-yellow-500" />
                                    <span className="text-sm text-gray-700">{module.file_path.split("/").pop()}</span>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  className="block w-full text-sm text-gray-500"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      setCourse((prev) => ({
                                        ...prev,
                                        modules: prev.modules.map((m) =>
                                          m.id === module.id ? { ...m, file: e.target.files[0] } : m,
                                        ),
                                      }))
                                      // Don't mark as changed until save button is clicked
                                    }
                                  }}
                                />
                              </div>
                            )}
                            {module.type === "quiz" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Questions</label>
                                <div className="space-y-4">
                                  {module.quiz_questions.map((q, qIndex) => (
                                    <div key={q.id} className="border rounded-lg p-4 bg-white">
                                      <div className="flex items-center justify-between mb-2">
                                        <input
                                          type="text"
                                          value={q.question}
                                          onChange={(e) =>
                                            handleQuizQuestionChange(module.id, qIndex, "question", e.target.value)
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                                          placeholder={`Question ${qIndex + 1}`}
                                        />
                                        <button
                                          onClick={() => handleQuizDeleteQuestion(module.id, qIndex)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                      <div className="space-y-2">
                                        {q.options.map((option, optIndex) => (
                                          <div key={optIndex} className="flex items-center space-x-2">
                                            <input
                                              type="radio"
                                              checked={q.correct_option === optIndex}
                                              onChange={() => handleQuizCorrectOption(module.id, qIndex, optIndex)}
                                              className="h-4 w-4 text-blue-600"
                                            />
                                            <input
                                              type="text"
                                              value={option}
                                              onChange={(e) =>
                                                handleQuizOptionChange(module.id, qIndex, optIndex, e.target.value)
                                              }
                                              className="flex-1 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                              placeholder={`Option ${optIndex + 1}`}
                                            />
                                            {q.options.length > 2 && (
                                              <button
                                                onClick={() => handleQuizRemoveOption(module.id, qIndex, optIndex)}
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                        <button
                                          onClick={() => handleQuizAddOption(module.id, qIndex)}
                                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add Option
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => handleQuizAddQuestion(module.id)}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Question</span>
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-end space-x-4 mt-6">
                              <button
                                onClick={() => setEditingSection(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  // Update course duration when module is saved
                                  updateCourseDuration(course.modules)
                                  setChangedSections((prev) => ({
                                    ...prev,
                                    modules: true,
                                  }))
                                  setEditingSection(null)
                                  toast.success("Module updated successfully!")
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {module.type === "text" && (
                              <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: module.text_content }}
                              />
                            )}
                            {module.type === "video" && module.file_path && (
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() =>
                                    setPreviewModal({
                                      open: true,
                                      type: "video",
                                      src: backend_url + module.file_path,
                                      name: module.title,
                                    })
                                  }
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>Preview Video</span>
                                </button>
                                <p className="text-gray-500">{module.videoDuration || module.duration} minutes</p>
                              </div>
                            )}
                            {module.type === "pdf" && module.file_path && (
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() =>
                                    setPreviewModal({
                                      open: true,
                                      type: "pdf",
                                      src: backend_url + module.file_path,
                                      name: module.title,
                                    })
                                  }
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>Preview PDF</span>
                                </button>
                                <p className="text-gray-500">{module.pageCount || "Multiple"} pages</p>
                              </div>
                            )}
                            {module.type === "image" && module.file_path && (
                              <div>
                                <img
                                  src={backend_url + module.file_path || "/placeholder.svg"}
                                  alt={module.title}
                                  className="max-h-64 object-contain rounded-lg mb-2"
                                />
                                <p className="text-gray-500">{module.imageCount || 1} image(s)</p>
                              </div>
                            )}
                            {module.type === "quiz" && module.quiz_questions && (
                              <div>
                                <h4 className="font-medium text-gray-700 mb-4">
                                  Quiz Questions ({module.quiz_questions.length})
                                </h4>
                                <div className="space-y-4">
                                  {module.quiz_questions.map((q, qIndex) => (
                                    <div key={q.id} className="border rounded-lg p-4 bg-white">
                                      <h5 className="font-medium mb-2">
                                        Question {qIndex + 1}: {q.question}
                                      </h5>
                                      <ul className="space-y-1 ml-4">
                                        {q.options.map((option, optIndex) => (
                                          <li key={optIndex} className="flex items-center">
                                            <span
                                              className={`w-4 h-4 rounded-full mr-2 ${
                                                q.correct_option === optIndex ? "bg-green-500" : "bg-gray-200"
                                              }`}
                                            ></span>
                                            {option}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Exam Tab */}
          {activeTab === "exam" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Final Exam</h2>
                {course.exam ? (
                  <button
                    onClick={() => setEditingSection("exam")}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={createExam}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Exam</span>
                  </button>
                )}
              </div>

              {!course.exam && !editingSection ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Final Exam</h3>
                  <p className="text-gray-500 mb-6">This course doesn't have a final exam yet.</p>
                  <button
                    onClick={createExam}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exam
                  </button>
                </div>
              ) : editingSection === "exam" ? (
                <div className="space-y-6">
                  {/* Exam Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'examen</label>
                    <input
                      type="text"
                      value={course.exam?.title || ""}
                      onChange={(e) => handleExamSettingsChange("title", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Entrez le titre de l'examen"
                    />
                  </div>

                  {/* Exam Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                    <textarea
                      value={course.exam?.instructions || ""}
                      onChange={(e) => handleExamSettingsChange("instructions", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                      placeholder="Entrez les instructions pour l'examen"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Exam Duration (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        value={course.exam.duration_min}
                        onChange={(e) => handleExamSettingsChange("duration_min", Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={course.exam.passing_score}
                        onChange={(e) => handleExamSettingsChange("passing_score", Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Exam Questions</h3>
                      <button
                        onClick={handleExamAddQuestion}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {course.exam.questions.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">No questions added yet</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {course.exam.questions.map((question, qIndex) => (
                          <div key={question.id} className="border rounded-lg p-6 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">Question {qIndex + 1}</h4>
                              <button
                                onClick={() => handleExamDeleteQuestion(qIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                                <input
                                  type="text"
                                  value={question.question_text}
                                  onChange={(e) => handleExamQuestionChange(qIndex, "question_text", e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter question text"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        checked={question.correct_index === optIndex}
                                        onChange={() => handleExamCorrectOption(qIndex, optIndex)}
                                        className="h-4 w-4 text-blue-600"
                                      />
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleExamOptionChange(qIndex, optIndex, e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={`Option ${optIndex + 1}`}
                                      />
                                      {question.options.length > 2 && (
                                        <button
                                          onClick={() => handleExamRemoveOption(qIndex, optIndex)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => handleExamAddOption(qIndex)}
                                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Option
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-4 mt-6">
                    <button
                      onClick={() => setEditingSection(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSectionSave("exam")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Exam
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Duration</h4>
                      <p className="text-lg text-gray-900">{course.exam.duration_min} minutes</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Passing Score</h4>
                      <p className="text-lg text-gray-900">{course.exam.passing_score}%</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Questions</h4>
                      <p className="text-lg text-gray-900">{course.exam.questions.length}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Exam Questions</h3>
                    {course.exam.questions.map((question, qIndex) => (
                      <div key={question.id} className="border rounded-lg p-4 bg-white mb-4">
                        <h4 className="font-medium mb-2">
                          Question {qIndex + 1}: {question.question_text}
                        </h4>
                        <ul className="space-y-1 ml-4">
                          {question.options.map((option, optIndex) => (
                            <li key={optIndex} className="flex items-center">
                              <span
                                className={`w-4 h-4 rounded-full mr-2 ${
                                  question.correct_index === optIndex ? "bg-green-500" : "bg-gray-200"
                                }`}
                              ></span>
                              {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Ressources supplémentaires</h2>
                <button
                  onClick={() => setEditingSection("add-resource")}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter une ressource</span>
                </button>
              </div>
              <p className="text-sm text-red-500">Veuillez supprimer les ressources existantes de type (pdf, video, image) avant d'ajouter de nouvelles ressources</p>


              {/* Add Resource Form */}
              {editingSection === "add-resource" && (
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter une nouvelle ressource</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la ressource</label>
                      <input
                        type="text"
                        value={newResource.name}
                        onChange={(e) => setNewResource((prev) => ({ ...prev, name: e.target.value }))}
                        className={`w-full border ${resourceErrors.resource_name ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Enter resource name"
                      />
                      {resourceErrors.resource_name && (
                        <p className="mt-1 text-sm text-red-600">{resourceErrors.resource_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type de ressource</label>
                      <select
                        value={newResource.type}
                        onChange={(e) =>
                          setNewResource((prev) => ({ ...prev, type: e.target.value, file: null, url: "" }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pdf">PDF</option>
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                        <option value="link">Lien externe</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    {["pdf", "video", "image"].includes(newResource.type) ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                        <div
                          className={`border-2 border-dashed ${resourceErrors.resource_file ? "border-red-500" : "border-gray-300"} rounded-lg p-4 text-center hover:border-blue-500 transition-colors`}
                        >
                          <input
                            type="file"
                            id="resourceFile"
                            className="hidden"
                            accept={
                              newResource.type === "pdf" ? ".pdf" : newResource.type === "video" ? "video/*" : "image/*"
                            }
                            onChange={handleResourceFileChange}
                          />
                          {newResource.file ? (
                            <div className="flex items-center justify-center">
                              {newResource.type === "image" && (
                                <img
                                  src={URL.createObjectURL(newResource.file) || "/placeholder.svg"}
                                  alt="Preview"
                                  className="h-24 object-contain mb-2"
                                />
                              )}
                              {newResource.type === "pdf" && <FileText className="h-8 w-8 text-yellow-500 mr-2" />}
                              {newResource.type === "video" && <Video className="h-8 w-8 text-red-500 mr-2" />}
                              <span className="text-gray-700">{newResource.file.name}</span>
                              <button
                                type="button"
                                onClick={() => setNewResource((prev) => ({ ...prev, file: null }))}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label htmlFor="resourceFile" className="cursor-pointer">
                              <div className="flex flex-col items-center">
                                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                <span className="text-blue-600 hover:text-blue-800">Cliquer pour télécharger le fichier</span>
                                <p className="text-sm text-gray-500 mt-1">
                                  {newResource.type === "pdf" && "PDF uniquement"}
                                  {newResource.type === "video" && "MP4, WebM, ou d'autres formats de vidéo"}
                                  {newResource.type === "image" && "PNG, JPG, GIF jusqu'à 5MB"}
                                </p>
                              </div>
                            </label>
                          )}
                        </div>
                        {resourceErrors.resource_file && (
                          <p className="mt-1 text-sm text-red-600">{resourceErrors.resource_file}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                        <input
                          type="url"
                          value={newResource.url}
                          onChange={(e) => setNewResource((prev) => ({ ...prev, url: e.target.value }))}
                          className={`w-full border ${resourceErrors.resource_url ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="https://example.com"
                        />
                        {resourceErrors.resource_url && (
                          <p className="mt-1 text-sm text-red-600">{resourceErrors.resource_url}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-4 mt-6">
                      <button
                        onClick={() => setEditingSection(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddResource}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Resource
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {course.resources && course.resources.length > 0 ? (
                <div className="space-y-6">
                  {course.resources.map((resource) => (
                    <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {resource.type === "pdf" && <FileText className="h-6 w-6 text-yellow-500" />}
                            {resource.type === "video" && <Video className="h-6 w-6 text-red-500" />}
                            {resource.type === "image" && <ImageIcon className="h-6 w-6 text-green-500" />}
                            {resource.type === "link" && <Link className="h-6 w-6 text-blue-500" />}
                            {resource.type === "other" && <FileIcon className="h-6 w-6 text-gray-500" />}
                            <div>
                              <h3 className="font-medium text-gray-900">{resource.name}</h3>
                              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                                {resource.type} Resource
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleRemoveResource(resource.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>

                        {/* Resource Content Display */}
                        <div className="mt-4">
                          {resource.type === "video" && (
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() =>
                                  setPreviewModal({
                                    open: true,
                                    type: "video",
                                    src: backend_url + resource.url,
                                    name: resource.name,
                                  })
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Preview Video</span>
                              </button>
                            </div>
                          )}

                          {resource.type === "pdf" && (
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() =>
                                  setPreviewModal({
                                    open: true,
                                    type: "pdf",
                                    src: backend_url + resource.url,
                                    name: resource.name,
                                  })
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Preview PDF</span>
                              </button>
                            </div>
                          )}

                          {resource.type === "image" && (
                            <div>
                              <img
                                src={backend_url + resource.url}
                                alt={resource.name}
                                className="max-h-64 object-contain rounded-lg mb-2"
                                onClick={() =>
                                  setPreviewModal({
                                    open: true,
                                    type: "image",
                                    src: backend_url + resource.url,
                                    name: resource.name,
                                  })
                                }
                              />
                            </div>
                          )}

                          {resource.type === "link" && resource.url && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center space-x-2">
                                <Link className="h-4 w-4 text-blue-600" />
                                <a
                                  href={resource.url }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                >
                                  Ouvrir le lien
                                </a>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 truncate">{resource.url}</p>
                            </div>
                          )}

                          {resource.type === "other" && resource.url && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center space-x-2">
                                <FileIcon className="h-4 w-4 text-gray-600" />
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-700 hover:text-gray-900 hover:underline font-medium"
                                >
                                  Ouvrir la ressource
                                </a>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 truncate">{resource.url}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No resources added yet</p>
                  <button
                    onClick={() => setEditingSection("add-resource")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Resource
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Preview Modal */}
      {previewModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">{previewModal.name}</h3>
              <button
                onClick={() => setPreviewModal({ open: false, type: "", src: "", name: "" })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
              {previewModal.type === "pdf" && (
                <iframe
                  src={previewModal.src}
                  className="w-full h-[70vh]"
                  title="Aperçu PDF"
                />
              )}
              {previewModal.type === "video" && (
                <video
                  src={previewModal.src}
                  controls
                  className="w-full max-h-[70vh]"
                />
              )}
              {previewModal.type === "image" && (
                <img
                  src={previewModal.src}
                  alt={previewModal.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl max-w-2xl w-full max-h-[85vh]">
            <div className="flex items-center justify-between mb-4 ">
              <h3 className="text-lg font-semibold">Confirmation de la suppression</h3>
              <button
                onClick={() => setDeleteModal({ show: false, type: "", id: null, name: "" })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5 hover:text-gray-700 transition-colors cursor-pointer" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {deleteModal.name} ? Cette action ne peut pas être annulée.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModal({ show: false, type: "", id: null, name: "" })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:scale-105 duration-300 hover:shadow-lg cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateCourse;
