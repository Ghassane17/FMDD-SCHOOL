"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { register, initializeCSRF } from "../services/api.js"
import {
  User,
  Mail,
  Lock,
  Phone,
  FileText,
  Upload,
  AlertCircle,
  Loader2,
  Clock,
  BookOpen,
  CheckCircle,
  Sparkles,
  Trophy,
  Users,
  TrendingUp,
  Heart,
  Star,
} from "lucide-react"

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "learner",
    avatar: null,
    bio: "",
    phone: "",
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const navigate = useNavigate()
  const [touched, setTouched] = useState({})
  const [validationErrors, setValidationErrors] = useState({})
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Countdown effect for email verification
  useEffect(() => {
    let interval = null
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((countdown) => countdown - 1)
      }, 1000)
    } else if (countdown === 0 && showEmailVerificationMessage) {
      const user = JSON.parse(localStorage.getItem("registeredUser") || "{}")
      localStorage.removeItem("registeredUser")
      if (user.role === "learner") {
        navigate("/learner/learner-profile")
      } else if (user.role === "instructor") {
        navigate("/instructor/instructor-profile")
      } else {
        navigate("/login")
      }
    }
    return () => clearInterval(interval)
  }, [countdown, showEmailVerificationMessage, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          avatar: ["Please select a valid image file"],
        }))
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: ["Image size should not exceed 5MB"],
        }))
        return
      }

      setFormData((prev) => ({ ...prev, avatar: file }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)

      setErrors((prev) => ({ ...prev, avatar: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = "Le nom complet est requis"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est requise"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'adresse email n'est pas valide"
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères"
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "La confirmation du mot de passe est requise"
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Les mots de passe ne correspondent pas"
    }

    if (!formData.role) {
      newErrors.role = "Veuillez sélectionner un rôle"
    }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    validateForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setMessage("")

    setTouched({
      username: true,
      email: true,
      password: true,
      password_confirmation: true,
      role: true,
    })

    if (!validateForm()) {
      return
    }

    setLoading(true)

    const data = new FormData()
    data.append("username", formData.username)
    data.append("email", formData.email)
    data.append("password", formData.password)
    data.append("password_confirmation", formData.password_confirmation)
    data.append("role", formData.role)
    data.append("bio", formData.bio)
    data.append("phone", formData.phone)
    if (formData.avatar) {
      data.append("avatar", formData.avatar)
    }

    try {
      await initializeCSRF()
      const response = await register(data, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const user = response.data.user
      localStorage.setItem("registeredUser", JSON.stringify(user))
      setShowEmailVerificationMessage(true)
      setMessage("")
      setCountdown(8)
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: error.response?.data?.message || "Impossible de se connecter au serveur." })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LearnHub</span>
          </div>
          <div className="text-sm text-gray-600">
            Déjà membre ?{" "}
            <a href="/login" className="text-black font-semibold hover:text-gray-700 transition-colors">
              Se connecter
            </a>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              <Sparkles className="w-4 h-4" />
              Commencez votre parcours d'apprentissage
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Transformez votre
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                potentiel{" "}
              </span>
              en expertise
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Rejoignez une communauté d'apprenants passionnés et développez les compétences qui feront la différence
              dans votre carrière.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Left Side - Benefits */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Pourquoi nous choisir ?</h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Excellence pédagogique</h4>
                      <p className="text-sm text-gray-600">Méthodes d'apprentissage innovantes et éprouvées</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Communauté active</h4>
                      <p className="text-sm text-gray-600">Échangez et apprenez avec d'autres passionnés</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Progression mesurable</h4>
                      <p className="text-sm text-gray-600">Suivez vos progrès en temps réel</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Support personnalisé</h4>
                      <p className="text-sm text-gray-600">Accompagnement adapté à vos besoins</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Registration Form */}
            <div className="lg:col-span-2">
              {/* Success Message */}
              {showEmailVerificationMessage && (
                <div className="p-6 mb-8 bg-green-50 border border-green-200 rounded-3xl">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Inscription réussie ! 🎉</h3>
                      <p className="text-green-800 mb-3">
                        Un email de vérification a été envoyé à votre adresse email. Veuillez cliquer sur le lien dans
                        l'email pour activer votre compte.
                      </p>
                      <div className="flex items-center gap-2 text-green-700">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm">
                          <strong>Important :</strong> Le lien de vérification expire dans 1 heure.
                        </p>
                      </div>
                    </div>
                  </div>
                  {countdown > 0 && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-100 rounded-2xl">
                      <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                      <p className="text-green-800 text-sm">
                        Redirection dans {countdown} seconde{countdown > 1 ? "s" : ""}...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {errors.general && (
                <div className="flex items-center gap-3 p-4 mb-8 bg-red-50 border border-red-200 rounded-3xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{errors.general}</p>
                </div>
              )}

              {/* Registration Form */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-full transform translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-50 to-blue-50 rounded-full transform -translate-x-16 translate-y-16"></div>

                <div className="relative z-10">
                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Créer votre compte</h2>
                    <p className="text-gray-600">Quelques informations pour commencer</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex justify-center mb-8">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview || "/placeholder.svg"}
                              alt="Aperçu"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors duration-200 shadow-lg">
                          <Upload className="w-4 h-4 text-white" />
                          <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Username */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Nom complet</label>
                        <div className="relative group">
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={() => handleBlur("username")}
                            className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="Votre nom complet"
                            required
                          />
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors duration-300" />
                        </div>
                        {touched.username && validationErrors.username && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.username}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Adresse email</label>
                        <div className="relative group">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={() => handleBlur("email")}
                            className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="votre@email.com"
                            required
                          />
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors duration-300" />
                        </div>
                        {touched.email && validationErrors.email && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.email}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Mot de passe</label>
                        <div className="relative group">
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={() => handleBlur("password")}
                            className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="••••••••"
                            required
                            minLength="8"
                          />
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors duration-300" />
                        </div>
                        {touched.password && validationErrors.password && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.password}
                          </p>
                        )}
                      </div>

                      {/* Password Confirmation */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
                        <div className="relative group">
                          <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            onBlur={() => handleBlur("password_confirmation")}
                            className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="••••••••"
                            required
                            minLength="8"
                          />
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors duration-300" />
                        </div>
                        {touched.password_confirmation && validationErrors.password_confirmation && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.password_confirmation}
                          </p>
                        )}
                      </div>

                      {/* Role */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Je suis un(e)</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          onBlur={() => handleBlur("role")}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white appearance-none cursor-pointer hover:border-gray-300"
                          required
                        >
                          <option value="">Sélectionnez votre rôle</option>
                          <option value="learner">Apprenant</option>
                          <option value="instructor">Instructeur</option>
                        </select>
                        {touched.role && validationErrors.role && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.role}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Téléphone (optionnel)</label>
                        <div className="relative group">
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="Numéro de téléphone"
                            maxLength={20}
                          />
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors duration-300" />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Parlez-nous de vous (optionnel)
                      </label>
                      <div className="relative group">
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white resize-none group-hover:border-gray-300"
                          rows="3"
                          placeholder="Vos objectifs d'apprentissage, votre expérience..."
                        />
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors duration-300" />
                      </div>
                    </div>


                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                        loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-black hover:bg-gray-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Création du compte...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Commencer mon parcours
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
