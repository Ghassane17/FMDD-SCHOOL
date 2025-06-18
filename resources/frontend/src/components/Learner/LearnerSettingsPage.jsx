"use client"

import { useState, useEffect } from "react"
import {
  User,
  Lock,
  Star,
  Globe,
  Award,
  Save,
  Camera,
  X,
  Shield,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Info,
  Bell,
} from "lucide-react"
import { Switch } from "@headlessui/react"
import InterrestsForm from "../formateurs/profile-completion-formateur/InterrestsForm.jsx"
import LanguagesForm from "../../components/formateurs/profile-completion-formateur/LanguagesForm"
import CertificationsForm from "../../components/formateurs/profile-completion-formateur/CertificationsForm"
import {
  getLearnerSettings,
  updatePersonalInfo,
  updateLearnerPassword,
  updateLearnerAdditionalInfo,
  updateLearnerNotifications
} from "../../services/api"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export default function LearnerSettingsPage() {
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    phone: "",
  })

  // Validation states
  const [fieldErrors, setFieldErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})

  // Toast notification states
  const [toasts, setToasts] = useState([])
  const [toastId, setToastId] = useState(0)

  const [fieldsOfInterest, setFieldsOfInterest] = useState([])
  const [languages, setLanguages] = useState([])
  const [certifications, setCertifications] = useState([])
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showLanguagesModal, setShowLanguagesModal] = useState(false)
  const [showCertificationsModal, setShowCertificationsModal] = useState(false)
  const [skillsBuffer, setSkillsBuffer] = useState([])
  const [languagesBuffer, setLanguagesBuffer] = useState([])
  const [certificationsBuffer, setCertificationsBuffer] = useState([])

  // Add avatar state
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatar, setAvatar] = useState(null)

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: true,
    app: true
  })

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/placeholder.svg"
    if (avatarPath instanceof File) {
      return URL.createObjectURL(avatarPath)
    }
    return avatarPath.startsWith('http') ? avatarPath : `${BACKEND_URL}${avatarPath}`
  }

  // Fetch learner settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getLearnerSettings()
        const data = response.data
        console.log("data", data)
        localStorage.setItem("user", JSON.stringify(data))
        setFormData({
          username: data.username || "",
          email: data.email || "",
          bio: data.bio || "",
          phone: data.phone || "",
        })
        
        setFieldsOfInterest(data.fields_of_interest || [])
        setLanguages(data.languages || [])
        setCertifications(data.certifications || [])
        setNotifications(data.notifications || { email: true, app: true })
        
        // Handle avatar URL
        if (data.avatar) {
          setAvatarPreview(data.avatar)
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err)
        setError(err.response?.data?.message || "Failed to load settings")
      }
    }

    fetchSettings()
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB")
        return
      }
      setAvatar(file)
      setAvatarPreview(file) // Store the File object directly
    }
  }

  // Toast notification functions
  const addToast = (message, type = 'success') => {
    const id = toastId + 1
    setToastId(id)

    const newToast = {
      id,
      message,
      type, // 'success' or 'error'
      timestamp: Date.now()
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after 8 seconds
    setTimeout(() => {
      removeToast(id)
    }, 8000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Validation functions
  const validateProfileFields = () => {
    const errors = {}

    if (!formData.username.trim()) {
      errors.username = "Le nom d'utilisateur est requis"
    }

    if (!formData.email.trim()) {
      errors.email = "L'adresse email est requise"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Veuillez entrer une adresse email valide"
    }

    if (!formData.bio.trim()) {
      errors.bio = "La biographie professionnelle est requise"
    }

    if (formData.phone.trim() && !/^[+]?([0-9\s\-()]{8,})$/.test(formData.phone.trim())) {
      errors.phone = "Veuillez entrer un numéro de téléphone valide"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()

    if (!validateProfileFields()) {
      setError("Veuillez remplir tous les champs requis")
      return
    }

    setProfileLoading(true)
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    try {
      const dataToSend = new FormData()
      dataToSend.append("username", formData.username)
      dataToSend.append("email", formData.email)
      dataToSend.append("bio", formData.bio)
      dataToSend.append("phone", formData.phone)
      if (avatar && avatar instanceof File) {
        dataToSend.append("avatar", avatar)
      }

      console.log("dataToSend", dataToSend.get("bio"))
      const response = await updatePersonalInfo(dataToSend)
      setSuccess("Profil mis à jour avec succès")
      addToast("Profil mis à jour avec succès", "success")
      localStorage.setItem("user", JSON.stringify(response.data))

      if (response.data) {
        setFormData({
          username: response.data.username,
          email: response.data.email,
          bio: response.data.bio,
          phone: response.data.phone,
        })
        setAvatarPreview(response.data.avatar || null)
        setAvatar(null)

        if (avatar) {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil"
      setError(errorMessage)
      addToast(errorMessage, "error")
    } finally {
      setProfileLoading(false)
    }
  }

  const validatePasswordFields = (currentPassword, newPassword, confirmPassword) => {
    const errors = {}

    if (!currentPassword.trim()) {
      errors.currentPassword = "Le mot de passe actuel est requis"
    }

    if (!newPassword.trim()) {
      errors.newPassword = "Le nouveau mot de passe est requis"
    } else if (newPassword.length < 8) {
      errors.newPassword = "Le mot de passe doit contenir au moins 8 caractères"
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "La confirmation du mot de passe est requise"
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const currentPassword = formData.get("currentPassword")
    const newPassword = formData.get("newPassword")
    const confirmPassword = formData.get("confirmPassword")

    if (!validatePasswordFields(currentPassword, newPassword, confirmPassword)) {
      setError("Veuillez remplir tous les champs requis correctement")
      return
    }

    setPasswordLoading(true)
    setError(null)
    setSuccess(null)
    setPasswordErrors({})

    try {
      await updateLearnerPassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      })
      setSuccess("Mot de passe mis à jour avec succès")
      addToast("Mot de passe mis à jour avec succès", "success")
      e.target.reset()
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Une erreur est survenue lors du changement de mot de passe"
      setError(errorMessage)
      addToast(errorMessage, "error")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const [skillsLoading, setSkillsLoading] = useState(false)
  const [skillsError, setSkillsError] = useState(null)
  const [skillsSuccess, setSkillsSuccess] = useState(null)

  const [languagesLoading, setLanguagesLoading] = useState(false)
  const [languagesError, setLanguagesError] = useState(null)
  const [languagesSuccess, setLanguagesSuccess] = useState(null)

  const [certificationsLoading, setCertificationsLoading] = useState(false)
  const [certificationsError, setCertificationsError] = useState(null)
  const [certificationsSuccess, setCertificationsSuccess] = useState(null)

  // Add this component for displaying skills, languages, and certifications
  const QualificationBadge = ({ text, type }) => {
    // Define color schemes based on qualification type
    const colorSchemes = {
      skill: "bg-blue-600 text-white",
      language: "bg-green-600 text-white",
      certification: "bg-orange-500 text-white"
    };

    return (
      <div className={`${colorSchemes[type]} px-4 py-2 rounded-md font-medium text-sm`}>
        {text}
      </div>
    );
  };

  const handleSkillsUpdate = async () => {
    setSkillsLoading(true)
    setSkillsError(null)
    setSkillsSuccess(null)
    try {
      await updateLearnerAdditionalInfo({ fields_of_interest: skillsBuffer })
      setFieldsOfInterest(skillsBuffer)
      setSkillsSuccess("centres d’intérêt mises à jour avec succès")
      addToast("centres d’intérêt mises à jour avec succès", "success")
      setTimeout(() => {
        setShowSkillsModal(false)
        setSkillsSuccess(null)
      }, 1200)
    } catch {
      const errorMessage = "Erreur lors de la mise à jour des centres d’intérêt"
      setSkillsError(errorMessage)
      addToast(errorMessage, "error")
    } finally {
      setSkillsLoading(false)
    }
  }

  const handleLanguagesUpdate = async () => {
    setLanguagesLoading(true)
    setLanguagesError(null)
    setLanguagesSuccess(null)
    try {
      await updateLearnerAdditionalInfo({ languages: languagesBuffer })
      setLanguages(languagesBuffer)
      setLanguagesSuccess("Langues mises à jour avec succès")
      addToast("Langues mises à jour avec succès", "success")
      setTimeout(() => {
        setShowLanguagesModal(false)
        setLanguagesSuccess(null)
      }, 1200)
    } catch {
      const errorMessage = "Erreur lors de la mise à jour des langues"
      setLanguagesError(errorMessage)
      addToast(errorMessage, "error")
    } finally {
      setLanguagesLoading(false)
    }
  }

  const handleCertificationsUpdate = async () => {
    setCertificationsLoading(true)
    setCertificationsError(null)
    setCertificationsSuccess(null)
    try {
      await updateLearnerAdditionalInfo({ certifications: certificationsBuffer })
      setCertifications(certificationsBuffer)
      setCertificationsSuccess("Certifications mises à jour avec succès")
      addToast("Certifications mises à jour avec succès", "success")
      setTimeout(() => {
        setShowCertificationsModal(false)
        setCertificationsSuccess(null)
      }, 1200)
    } catch {
      const errorMessage = "Erreur lors de la mise à jour des certifications"
      setCertificationsError(errorMessage)
      addToast(errorMessage, "error")
    } finally {
      setCertificationsLoading(false)
    }
  }

  const handleNotificationChange = async (type) => {
    try {
      const newNotifications = {
        ...notifications,
        [type]: !notifications[type]
      }
      
      await updateLearnerNotifications(newNotifications)
      setNotifications(newNotifications)
      addToast("Préférences de notification mises à jour", "success")
    } catch (err) {
      console.error("Failed to update notifications:", err)
      addToast("Erreur lors de la mise à jour des notifications", "error")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="px-8 py-10 relative">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Paramètres du Compte</h1>
                  <p className="text-blue-100">Gérez vos informations personnelles et vos préférences</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-blue-100">Dernière mise à jour: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3 animate-fadeIn">
          <div className="p-1 bg-red-100 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3 animate-fadeIn">
          <div className="p-1 bg-green-100 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Succès</h3>
            <p className="text-green-700">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto p-1 text-green-400 hover:text-green-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Personal Information Section - Full Width */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-800">Informations Personnelles</h2>
            </div>
          </div>

          <div className="p-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={getAvatarUrl(avatarPreview)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg"
                    }}
                  />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Photo de Profil</h3>
                <p className="text-slate-600 mb-3 max-w-md">
                Une photo professionnelle renforce la confiance des autres utilisateurs. Choisissez une image claire et souriante de votre visage.
                </p>
                <div className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                  <Info className="h-4 w-4" />
                  <span>Formats acceptés: JPG, PNG. Max 5MB</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                    Nom d'utilisateur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      fieldErrors.username
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Votre nom d'utilisateur"
                  />
                  {fieldErrors.username && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {fieldErrors.username}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      fieldErrors.email
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="votre.email@exemple.com"
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
                  Biographie professionnelle <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="6"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    fieldErrors.bio
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Partagez votre parcours, votre expertise et votre approche pédagogique..."
                ></textarea>
                {fieldErrors.bio && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {fieldErrors.bio}
                  </p>
                )}
                <p className="text-sm text-slate-500">
                Une biographie complète aide les autres membres à mieux vous connaître et à établir un lien de confiance.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    fieldErrors.phone
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="+33 6 12 34 56 78"
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {fieldErrors.phone}
                  </p>
                )}
                <p className="text-sm text-slate-500">
                  Numéro de téléphone pour vous contacter (optionnel). Format international recommandé.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
                >
                  {profileLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Notifications par email</h3>
                <p className="text-sm text-gray-500">Recevoir des mises à jour par email</p>
              </div>
              <Switch
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
                className={`${
                  notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Activer les notifications par email</span>
                <span
                  className={`${
                    notifications.email ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Notifications dans l'application</h3>
                <p className="text-sm text-gray-500">Recevoir des notifications dans l'application</p>
              </div>
              <Switch
                checked={notifications.app}
                onChange={() => handleNotificationChange('app')}
                className={`${
                  notifications.app ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Activer les notifications dans l'application</span>
                <span
                  className={`${
                    notifications.app ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </div>
        </div>

        {/* Skills, Languages, Certifications Section - Full Width with Better Spacing */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-800">Vos centres d’intérêt</h2>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Skills Section */}
              <div className="bg-blue-50 rounded-xl p-6 mb-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">centres d’intérêt</h3>
                  <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    {fieldsOfInterest.length}
                  </span>
                </div>
                <p className="text-sm text-blue-700 mb-3">Vos domaines d'expertise</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {fieldsOfInterest.length > 0 ? (
                    fieldsOfInterest.slice(0, 3).map((skill, index) => (
                      <QualificationBadge key={index} text={skill} type="skill" />
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune compétence ajoutée</p>
                  )}
                  {fieldsOfInterest.length > 3 && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">
                      +{fieldsOfInterest.length - 3} autres
                    </span>
                  )}
                </div>
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => {
                      setSkillsBuffer(fieldsOfInterest);
                      setShowSkillsModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-200 font-medium"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Gérer les centres d’intérêt</span>
                  </button>
                </div>
              </div>

              {/* Languages Section */}
              <div className="bg-green-50 rounded-xl p-6 mb-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-800">Langues</h3>
                  <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    {languages.length}
                  </span>
                </div>
                <p className="text-sm text-green-700 mb-3">Langues que vous maîtrisez</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {languages.length > 0 ? (
                    languages.slice(0, 3).map((lang, index) => (
                      <QualificationBadge key={index} text={lang.name} type="language" />
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune langue ajoutée</p>
                  )}
                  {languages.length > 3 && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm">
                      +{languages.length - 3} autres
                    </span>
                  )}
                </div>
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => {
                      setLanguagesBuffer(languages);
                      setShowLanguagesModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-100 border border-green-200 text-green-700 rounded-xl hover:bg-green-200 transition-colors duration-200 font-medium"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Gérer les langues</span>
                  </button>
                </div>
              </div>

              {/* Certifications Section */}
              <div className="bg-yellow-50 rounded-xl p-6 mb-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-orange-500" />
                  <h3 className="font-medium text-orange-800">Certifications</h3>
                  <span className="bg-yellow-200 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    {certifications.length}
                  </span>
                </div>
                <p className="text-sm text-orange-700 mb-3">Vos certifications officielles</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {certifications.length > 0 ? (
                    certifications.slice(0, 3).map((cert, index) => (
                      <QualificationBadge key={index} text={cert.name} type="certification" />
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune certification ajoutée</p>
                  )}
                  {certifications.length > 3 && (
                    <span className="bg-yellow-100 text-orange-800 px-3 py-1 rounded-md text-sm">
                      +{certifications.length - 3} autres
                    </span>
                  )}
                </div>
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => {
                      setCertificationsBuffer(certifications);
                      setShowCertificationsModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-100 border border-yellow-200 text-orange-700 rounded-xl hover:bg-yellow-200 transition-colors duration-200 font-medium"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Gérer les certifications</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section - Full Width */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-slate-800">Sécurité</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">
                      Mot de passe actuel <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        required
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                          passwordErrors.currentPassword
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        }`}
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
                      Nouveau mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        required
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                          passwordErrors.newPassword
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                            : 'border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        }`}
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                    Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                        passwordErrors.confirmPassword
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mise à jour...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        <span>Mettre à jour le mot de passe</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-amber-100 rounded-full mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 mb-2">Conseils de sécurité</h4>
                    <ul className="text-sm text-amber-700 space-y-1 list-disc pl-4">
                      <li>Utilisez au moins 8 caractères</li>
                      <li>Combinez lettres, chiffres et symboles</li>
                      <li>Évitez les informations personnelles</li>
                      <li>Ne réutilisez pas d'anciens mots de passe</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Gérer vos centres d’intérêt</h3>
              </div>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <InterrestsForm data={skillsBuffer} updateData={setSkillsBuffer} />

              <div className="mt-8 pt-4 border-t border-slate-200">
                {skillsError && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">{skillsError}</div>
                )}
                {skillsSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                    {skillsSuccess}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowSkillsModal(false)}
                    disabled={skillsLoading}
                    className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSkillsUpdate}
                    disabled={skillsLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 flex items-center gap-2"
                  >
                    {skillsLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Languages Modal */}
      {showLanguagesModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Gérer vos langues</h3>
              </div>
              <button
                onClick={() => setShowLanguagesModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <LanguagesForm data={languagesBuffer} updateData={setLanguagesBuffer} />

              <div className="mt-8 pt-4 border-t border-slate-200">
                {languagesError && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                    {languagesError}
                  </div>
                )}
                {languagesSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                    {languagesSuccess}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowLanguagesModal(false)}
                    disabled={languagesLoading}
                    className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleLanguagesUpdate}
                    disabled={languagesLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 flex items-center gap-2"
                  >
                    {languagesLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certifications Modal */}
      {showCertificationsModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Gérer vos certifications</h3>
              </div>
              <button
                onClick={() => setShowCertificationsModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <CertificationsForm data={certificationsBuffer} updateData={setCertificationsBuffer} />

              <div className="mt-8 pt-4 border-t border-slate-200">
                {certificationsError && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                    {certificationsError}
                  </div>
                )}
                {certificationsSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                    {certificationsSuccess}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCertificationsModal(false)}
                    disabled={certificationsLoading}
                    className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCertificationsUpdate}
                    disabled={certificationsLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 flex items-center gap-2"
                  >
                    {certificationsLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-96 max-w-md w-full shadow-2xl rounded-xl pointer-events-auto overflow-hidden transform transition-all duration-300 ease-in-out animate-slideIn ${
              toast.type === 'success'
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' ? (
                    <CheckCircle className="h-8 w-8 text-white" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="ml-4 w-0 flex-1 pt-1">
                  <p className="text-lg font-semibold text-white">
                    {toast.type === 'success' ? 'Succès' : 'Erreur'}
                  </p>
                  <p className="mt-2 text-base text-white opacity-95 leading-relaxed">
                    {toast.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="inline-flex text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-black bg-opacity-20">
              <div
                className="h-full bg-white bg-opacity-40 animate-progress"
                style={{
                  animation: 'progress 8s linear forwards'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-progress {
          animation: progress 8s linear forwards;
        }
        .bg-grid-white/10 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
      `}</style>
    </div>
  )
}



