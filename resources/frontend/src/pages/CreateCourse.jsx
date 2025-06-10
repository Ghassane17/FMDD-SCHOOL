"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  BookOpen,
  FileText,
  ImageIcon,
  Video,
  Plus,
  Trash,
  ArrowLeft,
  ArrowRight,
  Check,
  FileUp,
  Sparkles,
  Clock,
} from "lucide-react"
import { createCourse } from "../services/api_instructor"
import { toast } from "react-hot-toast"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

// Course Creation Page
const CreateCourse = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    image: null,
    category: "",
    language: "",
    level: "",
    modules: [],
    resources: [],
    exam: {
      title: "",
      instructions: "",
      questions: [],
      duration_min: 60,
      passing_score: 70,
    },
  })

  // Add new state for validation errors
  const [validationErrors, setValidationErrors] = useState({})

  // Load initial data from navigation state
  useEffect(() => {
    if (location.state?.courseData) {
      setCourseData((prevData) => ({
        ...prevData,
        title: location.state.courseData.title || "",
        description: location.state.courseData.description || "",
        image: location.state.courseData.image || null,
      }))
    }
  }, [location.state])

  // Duration estimation functions
  const estimateQuizDuration = (questions) => {
    return questions * 5 // 5 minutes per question
  }

  const estimatePdfDuration = (pages) => {
    return pages * 10 // 10 minutes per page
  }

  const estimateImageDuration = (images) => {
    return 5 // 5 minutes per image
  }

  const estimateTextDuration = (text) => {
    const characterCount = text.replace(/<[^>]*>/g, "").length // Remove HTML tags for character count
    return Math.ceil(characterCount / 200) // 200 characters per minute, rounded up
  }

  const calculateModuleDuration = (module) => {
    switch (module.type) {
      case "quiz":
        return module.content?.questions?.length ? estimateQuizDuration(module.content.questions.length) : 0
      case "pdf":
        return module.pageCount ? estimatePdfDuration(module.pageCount) : 0
      case "image":
        return 5 // Fixed 5 minutes for image
      case "text":
        return module.content ? estimateTextDuration(module.content) : 0
      case "video":
        return module.videoDuration || 0
      default:
        return 0
    }
  }

  // Add validation functions for each step
  const validateStep1 = () => {
    const errors = {}
    if (!courseData.title.trim()) {
      errors.title = "Le titre du cours est requis"
    }
    if (!courseData.description.trim()) {
      errors.description = "La description du cours est requise"
    }
    if (!courseData.category) {
      errors.category = "La catégorie est requise"
    }
    if (!courseData.language) {
      errors.language = "La langue est requise"
    }
    if (!courseData.level) {
      errors.level = "Le niveau de difficulté est requis"
    }
    if (!courseData.image) {
      errors.image = "Une image de couverture est requise"
    }
    return errors
  }

  // Add new validation functions for modules and questions
  const validateModuleContent = (module) => {
    const errors = {}

    if (!module.title.trim()) {
      errors.title = "Le titre du module est requis"
    }

    switch (module.type) {
      case "text":
        if (!module.content.trim()) {
          errors.content = "Le contenu textuel est requis"
        }
        break
      case "pdf":
        if (!module.content) {
          errors.content = "Veuillez télécharger un fichier PDF"
        }
        if (!module.pageCount || module.pageCount < 1) {
          errors.pageCount = "Veuillez indiquer le nombre de pages"
        }
        break
      case "image":
        if (!module.content) {
          errors.content = "Veuillez télécharger une image"
        }
        break
      case "video":
        if (!module.content) {
          errors.content = "Veuillez télécharger une vidéo"
        }
        if (!module.videoDuration || module.videoDuration < 1) {
          errors.videoDuration = "Veuillez indiquer la durée de la vidéo"
        }
        break
      case "quiz":
        if (!module.content?.questions || module.content.questions.length === 0) {
          errors.content = "Le quiz doit contenir au moins une question"
        } else {
          module.content.questions.forEach((question, index) => {
            if (!question.question.trim()) {
              errors[`quiz_question_${index}`] = "La question est requise"
            }
            if (question.options.some((option) => !option.trim())) {
              errors[`quiz_options_${index}`] = "Toutes les options doivent être remplies"
            }
          })
        }
        break
    }

    return errors
  }

  const validateExamQuestions = (questions) => {
    const errors = {}

    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors[`exam_question_${index}`] = "La question est requise"
      }

      if (question.options.length < 2) {
        errors[`exam_options_${index}`] = "Au moins deux options sont requises"
      }

      // Check each option individually
      question.options.forEach((option, optionIndex) => {
        if (!option.trim()) {
          errors[`exam_option_${index}_${optionIndex}`] = `L'option ${optionIndex + 1} est vide`
        }
      })
    })

    return errors
  }

  // Modify validateStep2 to include module content validation
  const validateStep2 = () => {
    const errors = {}

    if (courseData.modules.length === 0) {
      errors.modules = "Au moins un module est requis"
    } else {
      // Validate each module
      for (let index = 0; index < courseData.modules.length; index++) {
        const module = courseData.modules[index]
        const moduleErrors = validateModuleContent(module)
        if (Object.keys(moduleErrors).length > 0) {
          errors[`module_${index}`] = moduleErrors
        }
      }
    }

    return errors
  }

  // Modify validateStep3 to include question validation
  const validateStep3 = () => {
    const errors = {}

    if (!courseData.exam.title.trim()) {
      errors.examTitle = "Le titre de l'examen est requis"
    }
    if (!courseData.exam.instructions.trim()) {
      errors.examInstructions = "Les instructions de l'examen sont requises"
    }
    if (courseData.exam.questions.length === 0) {
      errors.examQuestions = "Au moins une question est requise"
    } else {
      // Validate each exam question
      const questionErrors = validateExamQuestions(courseData.exam.questions)
      Object.assign(errors, questionErrors)
    }
    if (courseData.exam.duration_min < 5) {
      errors.examDuration = "La durée minimale est de 5 minutes"
    }
    if (courseData.exam.passing_score < 1 || courseData.exam.passing_score > 100) {
      errors.examPassingScore = "Le score de passage doit être entre 1 et 100"
    }

    return errors
  }

  const validateStep4 = () => {
    const errors = {}

    // Validate each resource
    courseData.resources.forEach((resource, index) => {
      if (!resource.name.trim()) {
        errors[`resource_${index}_name`] = "Le nom de la ressource est requis"
      }
      if (["pdf", "video", "image"].includes(resource.type) && !resource.file) {
        errors[`resource_${index}_file`] = "Un fichier est requis pour ce type de ressource"
      }
      if (["link", "other"].includes(resource.type) && !resource.url) {
        errors[`resource_${index}_url`] = "Une URL est requise pour ce type de ressource"
      }
    })

    return errors
  }

  // Modify handleNextStep to include validation
  const handleNextStep = () => {
    let errors = {}

    // Validate current step
    switch (currentStep) {
      case 1:
        errors = validateStep1()
        break
      case 2:
        errors = validateStep2()
        break
      case 3:
        errors = validateStep3()
        break
      case 4:
        errors = validateStep4()
        break
      default:
        break
    }

    // If there are errors, show them and don't proceed
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      // Scroll to the first error
      const firstError = document.querySelector("[data-error]")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    // Clear validation errors and proceed
    setValidationErrors({})
    setCurrentStep((prev) => prev + 1)
    window.scrollTo(0, 0)
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  // Handle general course info changes
  const handleGeneralInfoChange = (e) => {
    const { name, value } = e.target
    setCourseData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  // Handle creating and managing modules
  const [newModule, setNewModule] = useState({
    title: "",
    type: "text",
    content: "",
    duration_min: 0,
    pageCount: 1,
    videoDuration: 1,
    isDurationOverridden: false,
  })

  // Update duration when module content changes
  useEffect(() => {
    if (!newModule.isDurationOverridden) {
      const estimatedDuration = calculateModuleDuration(newModule)
      setNewModule((prev) => ({
        ...prev,
        duration_min: estimatedDuration,
      }))
    }
  }, [newModule.content, newModule.pageCount, newModule.videoDuration, newModule.type])

  // Modify handleAddModule to include validation and duration
  const handleAddModule = () => {
    const errors = validateModuleContent(newModule)

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    const moduleWithDuration = {
      ...newModule,
      id: Date.now(),
      duration_min: newModule.duration_min || calculateModuleDuration(newModule),
    }

    setCourseData((prevData) => ({
      ...prevData,
      modules: [...prevData.modules, moduleWithDuration],
    }))
    setNewModule({
      title: "",
      type: "text",
      content: "",
      duration_min: 0,
      pageCount: 1,
      videoDuration: 1,
      isDurationOverridden: false,
    })
    setValidationErrors({})
  }

  const handleRemoveModule = (moduleId) => {
    setCourseData((prevData) => ({
      ...prevData,
      modules: prevData.modules.filter((module) => module.id !== moduleId),
    }))
  }

  // Handle creating and managing exam questions
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: [""],
    correctAnswer: 0,
  })

  // Add new state for quiz questions
  const [newQuizQuestion, setNewQuizQuestion] = useState({
    question: "",
    options: [""],
    correctAnswer: 0,
  })

  // Add functions to handle dynamic options for exam questions
  const handleAddOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }))
  }

  const handleRemoveOption = (index) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswer: prev.correctAnswer >= index ? Math.max(0, prev.correctAnswer - 1) : prev.correctAnswer,
    }))
  }

  // Add functions to handle dynamic options for quiz questions
  const handleAddQuizOption = () => {
    setNewQuizQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }))
  }

  const handleRemoveQuizOption = (index) => {
    setNewQuizQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswer: prev.correctAnswer >= index ? Math.max(0, prev.correctAnswer - 1) : prev.correctAnswer,
    }))
  }

  // Modify handleAddQuestion to include validation for dynamic options
  const handleAddQuestion = () => {
    const errors = {}

    if (!newQuestion.question.trim()) {
      errors.question = "La question est requise"
    }

    if (newQuestion.options.length < 2) {
      errors.options = "Au moins deux options sont requises"
    }

    newQuestion.options.forEach((option, index) => {
      if (!option.trim()) {
        errors[`option_${index}`] = `L'option ${index + 1} est vide`
      }
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setCourseData((prevData) => ({
      ...prevData,
      exam: {
        ...prevData.exam,
        questions: [...prevData.exam.questions, { ...newQuestion, id: Date.now() }],
      },
    }))
    setNewQuestion({
      question: "",
      options: [""],
      correctAnswer: 0,
    })
    setValidationErrors({})
  }

  const handleRemoveQuestion = (questionId) => {
    setCourseData((prevData) => ({
      ...prevData,
      exam: {
        ...prevData.exam,
        questions: prevData.exam.questions.filter((q) => q.id !== questionId),
      },
    }))
  }

  const handleExamChange = (e) => {
    const { name, value } = e.target
    setCourseData((prevData) => ({
      ...prevData,
      exam: {
        ...prevData.exam,
        [name]: value,
      },
    }))
  }

  const handleQuestionOptionChange = (index, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }))
  }

  // Handle file uploads for different content types
  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      setNewModule((prev) => ({
        ...prev,
        content: e.target.files[0], // Store the actual File object
      }))
    }
  }

  // Handle course publication
  const handlePublishCourse = async () => {
    try {
      // Calculate total course duration
      const totalDuration = courseData.modules.reduce((total, module) => {
        return total + (module.duration_min || 0)
      }, 0)

      // Create FormData object to handle file uploads
      const formData = new FormData()

      // Add basic course information
      formData.append("title", courseData.title)
      formData.append("description", courseData.description)
      formData.append("category", courseData.category)
      formData.append("level", courseData.level)
      formData.append("duration_min", totalDuration)

      // Log the data being sent
      console.log("Course Data:", {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration_min: totalDuration,
        modulesCount: courseData.modules.length,
        examQuestionsCount: courseData.exam.questions.length,
        resourcesCount: courseData.resources.length,
      })

      // Add course thumbnail
      if (courseData.image) {
        if (courseData.image instanceof File) {
          formData.append("course_thumbnail", courseData.image)
        } else if (typeof courseData.image === "string" && courseData.image.startsWith("data:")) {
          try {
            const response = await fetch(courseData.image)
            const blob = await response.blob()
            const file = new File([blob], "course_thumbnail.jpg", {
              type: "image/jpeg",
            })
            formData.append("course_thumbnail", file)
          } catch (error) {
            console.error("Error processing thumbnail:", error)
            throw new Error("Failed to process course thumbnail")
          }
        } else {
          throw new Error("Invalid course thumbnail format")
        }
      } else {
        throw new Error("Course thumbnail is required")
      }

      // Add modules with duration
      courseData.modules.forEach((module, index) => {
        formData.append(`modules[${index}][title]`, module.title)
        formData.append(`modules[${index}][type]`, module.type)
        formData.append(`modules[${index}][order]`, index)
        formData.append(`modules[${index}][duration_min]`, module.duration_min || 0)

        if (module.type === "text") {
          formData.append(`modules[${index}][content]`, module.content)
        } else if (["pdf", "image", "video"].includes(module.type)) {
          if (module.content instanceof File) {
            formData.append(`modules[${index}][file]`, module.content)
          } else if (module.content && module.content.startsWith("data:")) {
            // Convert data URL to File
            fetch(module.content)
              .then((response) => response.blob())
              .then((blob) => {
                const file = new File([blob], `module_${index}_file`, { type: blob.type })
                formData.append(`modules[${index}][file]`, file)
              })
          }

          // Add type-specific metadata
          if (module.type === "pdf" && module.pageCount) {
            formData.append(`modules[${index}][page_count]`, module.pageCount)
          }
          if (module.type === "image" && module.imageCount) {
            formData.append(`modules[${index}][image_count]`, module.imageCount)
          }
          if (module.type === "video" && module.videoDuration) {
            formData.append(`modules[${index}][video_duration]`, module.videoDuration)
          }
        } else if (module.type === "quiz" && module.content?.questions) {
          module.content.questions.forEach((question, qIndex) => {
            formData.append(`modules[${index}][questions][${qIndex}][question]`, question.question)
            question.options.forEach((option, oIndex) => {
              formData.append(`modules[${index}][questions][${qIndex}][options][${oIndex}]`, option)
            })
            formData.append(`modules[${index}][questions][${qIndex}][correctAnswer]`, question.correctAnswer)
          })
        }
      })

      // Add resources
      if (courseData.resources && courseData.resources.length > 0) {
        courseData.resources.forEach((resource, index) => {
          formData.append(`resources[${index}][name]`, resource.name)
          formData.append(`resources[${index}][type]`, resource.type)

          if (["pdf", "video", "image"].includes(resource.type) && resource.file) {
            formData.append(`resources[${index}][file]`, resource.file)
          } else if (["link", "other"].includes(resource.type) && resource.url) {
            formData.append(`resources[${index}][url]`, resource.url)
          }
        })
      }

      // Add exam data
      formData.append("exam[title]", courseData.exam.title)
      formData.append("exam[instructions]", courseData.exam.instructions || "")
      formData.append("exam[duration_min]", courseData.exam.duration_min)
      formData.append("exam[passing_score]", courseData.exam.passing_score)

      // Add exam questions
      courseData.exam.questions.forEach((question, index) => {
        formData.append(`exam[questions][${index}][question]`, question.question)
        question.options.forEach((option, oIndex) => {
          formData.append(`exam[questions][${index}][options][${oIndex}]`, option)
        })
        formData.append(`exam[questions][${index}][correctAnswer]`, question.correctAnswer)
      })

      // Show loading state with progress
      const loadingToast = toast.loading("Création du cours en cours... (0%)")

      // Create a progress tracking function
      const updateProgress = (progress) => {
        toast.loading(`Création du cours en cours... (${progress}%)`, { id: loadingToast })
      }

      // Send request to create course with progress tracking
      const response = await createCourse(formData, updateProgress)
      console.log("all formData", response)

      // Update loading toast to success
      toast.dismiss(loadingToast)
      toast.success("Cours créé avec succès!")

      // Navigate to instructor dashboard or course page
      navigate("/instructor/dashboard")
    } catch (error) {
      console.error("Error creating course:", error)

      // Show error message with more specific details
      let errorMessage = "Une erreur est survenue lors de la création du cours"

      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors
        const firstError = Object.values(errors)[0]
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0]
        } else {
          errorMessage = firstError
        }

        // Set validation errors in state
        setValidationErrors(errors)

        // Scroll to the first error
        const firstErrorElement = document.querySelector("[data-error]")
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      } else if (error.message.includes("too long to complete")) {
        errorMessage =
          "Le temps de téléchargement a dépassé la limite. Veuillez réduire la taille des fichiers ou vérifier votre connexion internet."
      } else if (error.message.includes("too large")) {
        errorMessage =
          "Les fichiers que vous essayez de télécharger sont trop volumineux. Veuillez réduire leur taille et réessayer."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast.error(errorMessage)
    }
  }

  // Modify handleAddQuizQuestion to include validation and update duration
  const handleAddQuizQuestion = () => {
    const errors = validateNewQuizQuestion()

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    const updatedQuestions = [...(newModule.content?.questions || []), { ...newQuizQuestion, id: Date.now() }]

    setNewModule((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        questions: updatedQuestions,
      },
    }))

    setNewQuizQuestion({
      question: "",
      options: [""],
      correctAnswer: 0,
    })
    setValidationErrors({})
  }

  const handleRemoveQuizQuestion = (questionId) => {
    setNewModule((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        questions: prev.content?.questions?.filter((q) => q.id !== questionId) || [],
      },
    }))
  }

  const handleQuizQuestionOptionChange = (index, value) => {
    setNewQuizQuestion((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }))
  }

  // Add error display component
  const ErrorMessage = ({ message }) => (
    <p className="text-red-500 text-sm mt-1 flex items-center">
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {message}
    </p>
  )

  // Add this new component for error alerts
  const ErrorAlert = ({ message, type = "error" }) => (
    <div
      className={`p-4 mb-4 rounded-lg ${
        type === "error"
          ? "bg-red-50 border border-red-200"
          : type === "warning"
            ? "bg-yellow-50 border border-yellow-200"
            : "bg-blue-50 border border-blue-200"
      }`}
    >
      <div className="flex items-center">
        <div
          className={`flex-shrink-0 ${
            type === "error" ? "text-red-400" : type === "warning" ? "text-yellow-400" : "text-blue-400"
          }`}
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p
            className={`text-sm font-medium ${
              type === "error" ? "text-red-800" : type === "warning" ? "text-yellow-800" : "text-blue-800"
            }`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  )

  // Add new state for resource form
  const [newResource, setNewResource] = useState({
    name: "",
    type: "pdf",
    file: null,
    url: "",
  })

  // Duration Display Component
  const DurationDisplay = ({ duration, className = "" }) => (
    <div className={`flex items-center text-sm text-gray-600 ${className}`}>
      <Clock className="h-4 w-4 mr-1" />
      <span>{duration} min</span>
    </div>
  )

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Informations générales du cours
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-gray-700 mb-2 font-medium">Titre complet du cours</label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleGeneralInfoChange}
                  className={`w-full px-4 py-3 border ${validationErrors.title ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Titre complet du cours"
                  required
                  data-error={validationErrors.title}
                />
                {validationErrors.title && <ErrorMessage message={validationErrors.title} />}
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-gray-700 mb-2 font-medium">Description détaillée</label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleGeneralInfoChange}
                  className={`w-full px-4 py-3 border ${validationErrors.description ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  rows="5"
                  placeholder="Description détaillée du cours..."
                  required
                  data-error={validationErrors.description}
                ></textarea>
                {validationErrors.description && <ErrorMessage message={validationErrors.description} />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label className="block text-gray-700 mb-2 font-medium">Catégorie</label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleGeneralInfoChange}
                    className={`w-full px-4 py-3 border ${validationErrors.category ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                    required
                    data-error={validationErrors.category}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="development">Développement</option>
                    <option value="business">Business</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="datascience">Data Science</option>
                    <option value="other">Autre</option>
                  </select>
                  {validationErrors.category && <ErrorMessage message={validationErrors.category} />}
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label className="block text-gray-700 mb-2 font-medium">Langue</label>
                  <select
                    name="language"
                    value={courseData.language}
                    onChange={handleGeneralInfoChange}
                    className={`w-full px-4 py-3 border ${validationErrors.language ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                    required
                    data-error={validationErrors.language}
                  >
                    <option value="">Sélectionner une langue</option>
                    <option value="ar">Arabe</option>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                  </select>
                  {validationErrors.language && <ErrorMessage message={validationErrors.language} />}
                </div>
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-gray-700 mb-2 font-medium">Niveau de difficulté</label>
                <select
                  name="level"
                  value={courseData.level}
                  onChange={handleGeneralInfoChange}
                  className={`w-full px-4 py-3 border ${validationErrors.level ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  required
                  data-error={validationErrors.level}
                >
                  <option value="">Sélectionner un niveau de difficulté</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
                {validationErrors.level && <ErrorMessage message={validationErrors.level} />}
              </div>

              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="block text-gray-700 mb-2 font-medium">Image de couverture</label>
                {validationErrors.image && <ErrorMessage message={validationErrors.image} />}
                {courseData.image ? (
                  <div className="relative mb-4 group">
                    <img
                      src={courseData.image instanceof File ? URL.createObjectURL(courseData.image) : courseData.image}
                      alt="Course cover"
                      className="w-full h-48 object-cover rounded-lg shadow-md transition-all duration-300 group-hover:shadow-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setCourseData((prev) => ({ ...prev, image: null }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors duration-200">
                    <input
                      type="file"
                      id="courseImage"
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          const file = e.target.files[0]
                          // Validate file type
                          const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/svg+xml"]
                          if (!allowedTypes.includes(file.type)) {
                            toast.error("Le fichier doit être une image (jpeg, png, jpg, gif, svg)")
                            return
                          }
                          setCourseData((prev) => ({
                            ...prev,
                            image: file,
                          }))
                        }
                      }}
                    />
                    <label htmlFor="courseImage" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-blue-50 rounded-full mb-4">
                          <ImageIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <span className="text-gray-600 font-medium">Cliquez pour ajouter une image</span>
                        <span className="text-sm text-gray-500 mt-1">PNG, JPG, GIF, SVG jusqu'à 5MB</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 flex items-center font-medium shadow-lg hover:shadow-xl"
              >
                Continuer
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Création des Modules</h2>
              {courseData.modules.length > 0 && (
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  <DurationDisplay
                    duration={courseData.modules.reduce((total, module) => total + (module.duration_min || 0), 0)}
                    className="text-blue-700 font-medium"
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                Ajoutez autant de modules que nécessaire pour votre cours. La durée est automatiquement calculée selon
                le type de contenu, mais vous pouvez la modifier.
              </p>
            </div>

            {validationErrors.modules && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ErrorMessage message={validationErrors.modules} />
              </div>
            )}

            {courseData.modules.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Modules ajoutés</h3>
                <div className="space-y-3">
                  {courseData.modules.map((module, index) => (
                    <div key={module.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-2">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium">{module.title}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center">
                                {module.type === "text" && <FileText className="h-4 w-4 text-gray-500 mr-1" />}
                                {module.type === "pdf" && <FileUp className="h-4 w-4 text-gray-500 mr-1" />}
                                {module.type === "image" && <ImageIcon className="h-4 w-4 text-gray-500 mr-1" />}
                                {module.type === "video" && <Video className="h-4 w-4 text-gray-500 mr-1" />}
                                {module.type === "quiz" && <BookOpen className="h-4 w-4 text-gray-500 mr-1" />}
                                <span className="text-sm text-gray-500 capitalize">{module.type}</span>
                              </div>
                              <DurationDisplay duration={module.duration_min || 0} />
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveModule(module.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Ajouter un nouveau module</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Titre du module</label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) => setNewModule((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre du module"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Type de contenu</label>
                  <select
                    value={newModule.type}
                    onChange={(e) =>
                      setNewModule((prev) => ({
                        ...prev,
                        type: e.target.value,
                        content: "",
                        isDurationOverridden: false,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Texte</option>
                    <option value="pdf">PDF</option>
                    <option value="image">Image</option>
                    <option value="video">Vidéo</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <div>
                  {newModule.type === "text" && (
                    <div className="space-y-4">
                      <label className="block text-gray-700 mb-2">Contenu</label>
                      <ReactQuill
                        value={newModule.content}
                        onChange={(content) => setNewModule((prev) => ({ ...prev, content }))}
                        className="bg-white"
                        placeholder="Contenu du module..."
                      />
                    </div>
                  )}

                  {newModule.type === "pdf" && (
                    <div className="space-y-4">
                      <label className="block text-gray-700 mb-2 font-medium">Fichier PDF</label>
                      {validationErrors.content && <ErrorAlert message={validationErrors.content} />}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors duration-200">
                        <input
                          type="file"
                          id="moduleFile"
                          className="hidden"
                          accept=".pdf"
                          onChange={handleFileUpload}
                        />
                        {newModule.content ? (
                          <div className="relative">
                            <div className="flex items-center justify-center bg-gray-100 h-20 rounded">
                              <FileUp className="h-8 w-8 text-gray-500" />
                              <span className="ml-2">PDF téléchargé</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNewModule((prev) => ({ ...prev, content: "" }))}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="moduleFile" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                              <span className="text-gray-500">Cliquez pour télécharger un PDF</span>
                            </div>
                          </label>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Nombre de pages</label>
                        <input
                          type="number"
                          min="1"
                          value={newModule.pageCount}
                          onChange={(e) =>
                            setNewModule((prev) => ({
                              ...prev,
                              pageCount: Number.parseInt(e.target.value) || 1,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre de pages"
                        />
                        {validationErrors.pageCount && <ErrorMessage message={validationErrors.pageCount} />}
                      </div>
                    </div>
                  )}

                  {newModule.type === "image" && (
                    <div className="space-y-4">
                      <label className="block text-gray-700 mb-2 font-medium">Image</label>
                      {validationErrors.content && <ErrorAlert message={validationErrors.content} />}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors duration-200">
                        <input
                          type="file"
                          id="moduleImage"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                        {newModule.content ? (
                          <div className="relative">
                            <img
                              src={
                                newModule.content instanceof File
                                  ? URL.createObjectURL(newModule.content)
                                  : newModule.content
                              }
                              alt="Module content"
                              className="w-full h-40 object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setNewModule((prev) => ({ ...prev, content: "" }))}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="moduleImage" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                              <span className="text-gray-500">Cliquez pour télécharger une image</span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {newModule.type === "video" && (
                    <div className="space-y-4">
                      <label className="block text-gray-700 mb-2 font-medium">Vidéo</label>
                      {validationErrors.content && <ErrorAlert message={validationErrors.content} />}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors duration-200">
                        <input
                          type="file"
                          id="moduleVideo"
                          className="hidden"
                          accept="video/*"
                          onChange={handleFileUpload}
                        />
                        {newModule.content ? (
                          <div className="relative">
                            <div className="flex items-center justify-center bg-gray-100 h-20 rounded">
                              <Video className="h-8 w-8 text-gray-500" />
                              <span className="ml-2">Vidéo téléchargée</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNewModule((prev) => ({ ...prev, content: "" }))}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="moduleVideo" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <Video className="h-10 w-10 text-gray-400 mb-2" />
                              <span className="text-gray-500">Cliquez pour télécharger une vidéo</span>
                            </div>
                          </label>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Durée de la vidéo (minutes)</label>
                        <input
                          type="number"
                          min="1"
                          value={newModule.videoDuration}
                          onChange={(e) =>
                            setNewModule((prev) => ({
                              ...prev,
                              videoDuration: Number.parseInt(e.target.value) || 1,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Durée en minutes"
                        />
                        {validationErrors.videoDuration && <ErrorMessage message={validationErrors.videoDuration} />}
                      </div>
                    </div>
                  )}

                  {newModule.type === "quiz" && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-blue-700">
                          Créez des questions à choix multiples pour ce quiz. Chaque question doit avoir au moins 2
                          options et une réponse correcte. Durée estimée : 5 minutes par question.
                        </p>
                      </div>

                      {newModule.content?.questions?.length > 0 && (
                        <div className="space-y-4 mb-6">
                          <h3 className="font-medium">Questions ajoutées</h3>
                          <div className="space-y-3">
                            {newModule.content.questions.map((question, index) => (
                              <div
                                key={question.id}
                                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex">
                                    <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-2 mt-1">
                                      {index + 1}
                                    </span>
                                    <div>
                                      <h4 className="font-medium">{question.question}</h4>
                                      <ul className="mt-2 space-y-1">
                                        {question.options.map((option, i) => (
                                          <li key={i} className="flex items-center">
                                            <span
                                              className={`w-4 h-4 rounded-full mr-2 ${i === question.correctAnswer ? "bg-green-500" : "bg-gray-200"}`}
                                            ></span>
                                            {option}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveQuizQuestion(question.id)}
                                    className="text-red-500 hover:text-red-700 ml-2 transition-colors duration-200"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h3 className="font-medium mb-4">Ajouter une nouvelle question</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 mb-2 font-medium">Question</label>
                            <input
                              type="text"
                              value={newQuizQuestion.question}
                              onChange={(e) => setNewQuizQuestion((prev) => ({ ...prev, question: e.target.value }))}
                              className={`w-full px-4 py-3 border ${validationErrors.question ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                              placeholder="Votre question..."
                            />
                            {validationErrors.question && <ErrorAlert message={validationErrors.question} />}
                          </div>

                          <div>
                            <label className="block text-gray-700 mb-2 font-medium">Options</label>
                            {validationErrors.options && <ErrorAlert message={validationErrors.options} />}
                            {newQuizQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-center mb-3">
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={newQuizQuestion.correctAnswer === index}
                                  onChange={() => setNewQuizQuestion((prev) => ({ ...prev, correctAnswer: index }))}
                                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div className="flex-1 flex items-center">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleQuizQuestionOptionChange(index, e.target.value)}
                                    className={`w-full px-4 py-3 border ${
                                      validationErrors[`quiz_option_${index}`] ? "border-red-500" : "border-gray-300"
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    placeholder={`Option ${index + 1}`}
                                  />
                                  {newQuizQuestion.options.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveQuizOption(index)}
                                      className="ml-2 text-red-500 hover:text-red-700 p-2"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={handleAddQuizOption}
                              className="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Ajouter une option
                            </button>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={handleAddQuizQuestion}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors duration-200"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter cette question
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Duration Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 font-medium">Durée estimée</label>
                    <DurationDisplay duration={newModule.duration_min} className="text-blue-600 font-medium" />
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
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        Réinitialiser
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {!newModule.isDurationOverridden && "Durée calculée automatiquement selon le contenu"}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter ce module
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Examen Final</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                Créez un examen final pour évaluer les connaissances acquises dans ce cours.
              </p>
            </div>

            {validationErrors.examTitle && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ErrorAlert message={validationErrors.examTitle} />
              </div>
            )}

            {validationErrors.examInstructions && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ErrorAlert message={validationErrors.examInstructions} />
              </div>
            )}

            {validationErrors.examQuestions && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ErrorAlert message={validationErrors.examQuestions} />
              </div>
            )}

            {validationErrors.examDuration && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ErrorAlert message={validationErrors.examDuration} />
              </div>
            )}

            {validationErrors.examPassingScore && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ErrorAlert message={validationErrors.examPassingScore} />
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Titre de l'examen</label>
                <input
                  type="text"
                  name="title"
                  value={courseData.exam.title}
                  onChange={handleExamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de l'examen final"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Instructions</label>
                <textarea
                  name="instructions"
                  value={courseData.exam.instructions}
                  onChange={handleExamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Instructions pour l'examen..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Durée (minutes)</label>
                  <input
                    type="number"
                    name="duration_min"
                    min="5"
                    value={courseData.exam.duration_min}
                    onChange={handleExamChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Score de passage (%)</label>
                  <input
                    type="number"
                    name="passing_score"
                    min="1"
                    max="100"
                    value={courseData.exam.passing_score}
                    onChange={handleExamChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {courseData.exam.questions.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Questions ajoutées</h3>
                <div className="space-y-3">
                  {courseData.exam.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-2 mt-1">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium">{question.question}</h4>
                            <ul className="mt-2 space-y-1">
                              {question.options.map((option, i) => (
                                <li key={i} className="flex items-center">
                                  <span
                                    className={`w-4 h-4 rounded-full mr-2 ${i === question.correctAnswer ? "bg-green-500" : "bg-gray-200"}`}
                                  ></span>
                                  {option}
                                </li>
                              ))}
                            </ul>
                            {validationErrors[`exam_option_${index}_0`] && (
                              <ErrorAlert message="Toutes les options doivent être remplies" />
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 ml-2 transition-colors duration-200"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h3 className="font-medium mb-4">Ajouter une nouvelle question</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Question</label>
                  <input
                    type="text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                    className={`w-full px-4 py-3 border ${validationErrors.question ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Votre question..."
                  />
                  {validationErrors.question && <ErrorAlert message={validationErrors.question} />}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Options</label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center mb-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === index}
                        onChange={() => setNewQuestion((prev) => ({ ...prev, correctAnswer: index }))}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1 flex items-center">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleQuestionOptionChange(index, e.target.value)}
                          className={`w-full px-4 py-3 border ${
                            validationErrors[`option_${index}`] ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                          placeholder={`Option ${index + 1}`}
                        />
                        {newQuestion.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="ml-2 text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une option
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter cette question
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Ressources Additionnelles</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                Ajoutez des ressources supplémentaires pour enrichir votre cours (PDF, vidéos, images, liens externes).
              </p>
            </div>

            {validationErrors.resources && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ErrorAlert message={validationErrors.resources} />
              </div>
            )}

            {courseData.resources.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Ressources ajoutées</h3>
                <div className="space-y-3">
                  {courseData.resources.map((resource, index) => (
                    <div
                      key={resource.id}
                      className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-2">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium">{resource.name}</h4>
                            <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCourseData((prev) => ({
                              ...prev,
                              resources: prev.resources.filter((r) => r.id !== resource.id),
                            }))
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h3 className="font-medium mb-4">Ajouter une nouvelle ressource</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Nom de la ressource</label>
                  <input
                    type="text"
                    value={newResource.name}
                    onChange={(e) => setNewResource((prev) => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border ${validationErrors.resource_name ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Nom de la ressource"
                    data-error={validationErrors.resource_name}
                  />
                  {validationErrors.resource_name && <ErrorMessage message={validationErrors.resource_name} />}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Type de ressource</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource((prev) => ({ ...prev, type: e.target.value, file: null, url: "" }))}
                    className={`w-full px-3 py-2 border ${validationErrors.resource_type ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    data-error={validationErrors.resource_type}
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Vidéo</option>
                    <option value="image">Image</option>
                    <option value="link">Lien externe</option>
                    <option value="other">Autre</option>
                  </select>
                  {validationErrors.resource_type && <ErrorMessage message={validationErrors.resource_type} />}
                </div>

                {["pdf", "video", "image"].includes(newResource.type) ? (
                  <div>
                    <label className="block text-gray-700 mb-2">Fichier</label>
                    {validationErrors.resource_file && <ErrorAlert message={validationErrors.resource_file} />}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors duration-200">
                      <input
                        type="file"
                        id="resourceFile"
                        className="hidden"
                        accept={
                          newResource.type === "pdf" ? ".pdf" : newResource.type === "video" ? "video/*" : "image/*"
                        }
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            setNewResource((prev) => ({
                              ...prev,
                              file: e.target.files[0],
                            }))
                          }
                        }}
                        data-error={validationErrors.resource_file}
                      />
                      {newResource.file ? (
                        <div className="flex items-center justify-center">
                          <span className="text-gray-600">{newResource.file.name}</span>
                          <button
                            type="button"
                            onClick={() => setNewResource((prev) => ({ ...prev, file: null }))}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="resourceFile" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                            <span className="text-gray-500">Cliquez pour télécharger un fichier</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-700 mb-2">URL</label>
                    <input
                      type="url"
                      value={newResource.url}
                      onChange={(e) => setNewResource((prev) => ({ ...prev, url: e.target.value }))}
                      className={`w-full px-3 py-2 border ${validationErrors.resource_url ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder={
                        newResource.type === "link" ? "https://formation.fmdd.ma" : "Description de la ressource"
                      }
                      data-error={validationErrors.resource_url}
                    />
                    {validationErrors.resource_url && <ErrorMessage message={validationErrors.resource_url} />}
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      const errors = {}
                      if (!newResource.name.trim()) {
                        errors.resource_name = "Le nom de la ressource est requis"
                      }
                      if (["pdf", "video", "image"].includes(newResource.type) && !newResource.file) {
                        errors.resource_file = "Un fichier est requis pour ce type de ressource"
                      }
                      if (["link", "other"].includes(newResource.type) && !newResource.url) {
                        errors.resource_url = "Une URL est requise pour ce type de ressource"
                      }

                      if (Object.keys(errors).length > 0) {
                        setValidationErrors(errors)
                        return
                      }

                      setCourseData((prev) => ({
                        ...prev,
                        resources: [
                          ...prev.resources,
                          {
                            id: Date.now(),
                            name: newResource.name,
                            type: newResource.type,
                            file: newResource.file,
                            url: newResource.url,
                          },
                        ],
                      }))

                      setNewResource({
                        name: "",
                        type: "pdf",
                        file: null,
                        url: "",
                      })
                      setValidationErrors({})
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter cette ressource
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )

      case 5:
        const totalCourseDuration = courseData.modules.reduce((total, module) => total + (module.duration_min || 0), 0)

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Résumé & Publication</h2>
              <div className="bg-blue-100 px-4 py-2 rounded-full">
                <DurationDisplay duration={totalCourseDuration} className="text-blue-700 font-bold text-lg" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h3 className="font-bold text-lg mb-4">Informations générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-gray-500 text-sm">Titre</p>
                  <p className="font-medium">{courseData.title}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Catégorie</p>
                  <p className="font-medium">{courseData.category || "Non spécifiée"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Langue</p>
                  <p className="font-medium">{courseData.language || "Non spécifiée"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Durée totale</p>
                  <p className="font-medium">{totalCourseDuration} minutes</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500 text-sm">Description</p>
                  <p className="text-sm">{courseData.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Modules ({courseData.modules.length})</h3>
                {courseData.modules.length > 0 && (
                  <DurationDisplay duration={totalCourseDuration} className="text-gray-600" />
                )}
              </div>
              {courseData.modules.length > 0 ? (
                <div className="space-y-3">
                  {courseData.modules.map((module, index) => (
                    <div key={module.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-2">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium">{module.title}</h4>
                            <span className="text-sm text-gray-500 capitalize">{module.type}</span>
                          </div>
                        </div>
                        <DurationDisplay duration={module.duration_min || 0} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>Aucun module n'a été ajouté.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Examen Final</h3>
              </div>
              {courseData.exam.title ? (
                <div>
                  <p>
                    <span className="font-medium">Titre:</span> {courseData.exam.title}
                  </p>
                  <p>
                    <span className="font-medium">Durée:</span> {courseData.exam.duration_min} minutes
                  </p>
                  <p>
                    <span className="font-medium">Score de passage:</span> {courseData.exam.passing_score}%
                  </p>
                  <p className="mt-2">
                    <span className="font-medium">Nombre de questions:</span> {courseData.exam.questions.length}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>Aucun examen n'a été configuré.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Ressources Additionnelles</h3>
              </div>
              {courseData.resources.length > 0 ? (
                <div className="space-y-3">
                  {courseData.resources.map((resource, index) => (
                    <div key={resource.id} className="border rounded-lg p-3">
                      <div className="flex items-center">
                        <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-2">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium">{resource.name}</h4>
                          <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>Aucune ressource n'a été ajoutée.</p>
                </div>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-6 flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Prêt à publier ?</h3>
                <p className="text-sm text-gray-700">
                  Votre cours sera soumis à vérification avant d'être publié sur la plateforme. Durée totale estimée :{" "}
                  <span className="font-medium">{totalCourseDuration} minutes</span>
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </button>
              <button
                type="button"
                onClick={handlePublishCourse}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium"
              >
                Publier le cours
                <Check className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Modify validateNewQuizQuestion to handle dynamic options
  const validateNewQuizQuestion = () => {
    const errors = {}

    if (!newQuizQuestion.question.trim()) {
      errors.question = "La question est requise"
    }
    if (newQuizQuestion.options.length < 2) {
      errors.options = "Au moins deux options sont requises"
    }
    if (newQuizQuestion.options.some((option) => !option.trim())) {
      errors.options = "Toutes les options doivent être remplies"
    }

    return errors
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-12">
      <div className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cours Section
              </h1>
            </div>
            <button
              onClick={() => navigate("/formateurs")}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-500 hover:text-gray-700 mr-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Création d'un nouveau cours
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex mb-2">
            {["Informations", "Modules", "Examen", "Ressources", "Publication"].map((step, index) => (
              <div
                key={step}
                className={`flex-1 text-center ${index < currentStep ? "text-blue-600" : "text-gray-500"} ${index === 4 ? "" : "border-b-2"} ${index < currentStep ? "border-blue-600" : "border-gray-200"} transition-all duration-300`}
              >
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center transform transition-all duration-300 ${
                    index + 1 === currentStep
                      ? "bg-blue-600 text-white scale-110 shadow-lg"
                      : index + 1 < currentStep
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100"
                  } mb-2`}
                >
                  {index + 1 < currentStep ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                </div>
                <div className="text-xs sm:text-sm pb-2 font-medium">{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-6 transform transition-all duration-300 hover:shadow-2xl">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

export default CreateCourse
