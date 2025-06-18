"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { register, initializeCSRF } from "../services/api.js"
import { User, Mail, Lock, Phone, FileText, Upload, AlertCircle, CheckCircle, Loader2, Clock } from "lucide-react"

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

  // Countdown effect for email verification message
  useEffect(() => {
    let interval = null
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1)
      }, 1000)
    } else if (countdown === 0 && showEmailVerificationMessage) {
      // Auto redirect after countdown
      const user = JSON.parse(localStorage.getItem('registeredUser') || '{}')
      localStorage.removeItem('registeredUser') // Clean up
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem('registeredUser')
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log(`handleChange: Updating ${name} to ${value}`)
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      console.log("New formData:", newData)
      return newData
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          avatar: ["Please select a valid image file"],
        }))
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: ["Image size should not exceed 5MB"],
        }))
        return
      }

      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }))

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Clear any previous errors
      setErrors((prev) => ({
        ...prev,
        avatar: undefined,
      }))
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

    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      password_confirmation: true,
      role: true,
    })

    // Validate form
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

      // Store user info temporarily for redirect
      localStorage.setItem('registeredUser', JSON.stringify(user))

      // Show email verification message
      setShowEmailVerificationMessage(true)
      setMessage("")
      setCountdown(8) // 8 seconds to read the message

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Rejoignez FMDD</h1>
          <p className="text-lg text-slate-600">Créez votre compte pour commencer votre parcours avec nous</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10">
          {/* Messages */}
          {showEmailVerificationMessage && (
            <div className="p-6 mb-8 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3 mb-4">
                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Inscription réussie ! 🎉
                  </h3>
                  <p className="text-blue-800 mb-3">
                    Un email de vérification a été envoyé à votre adresse email.
                    Veuillez cliquer sur le lien dans l'email pour activer votre compte.
                  </p>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm">
                      <strong>Important :</strong> Le lien de vérification expire dans 1 heure.
                    </p>
                  </div>
                </div>
              </div>
              {countdown > 0 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-blue-100 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <p className="text-blue-800 text-sm">
                    Redirection dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                  </p>
                </div>
              )}
            </div>
          )}

          {message && !showEmailVerificationMessage && (
            <div className="flex items-center gap-3 p-4 mb-8 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-emerald-700 font-medium">{message}</p>
            </div>
          )}

          {errors.general && (
            <div className="flex items-center gap-3 p-4 mb-8 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Upload Section */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-slate-200 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview || "/placeholder.svg"}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors duration-200 shadow-lg">
                  <Upload className="w-5 h-5 text-white" />
                  <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
            {errors.avatar && (
              <div className="text-center">
                <p className="text-red-600 text-sm font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.avatar.join(", ")}
                </p>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="username">
                    <User className="inline w-4 h-4 mr-2" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={() => handleBlur("username")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-base"
                    placeholder="Votre nom complet"
                    required
                  />
                  {touched.username && validationErrors.username && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.username}
                    </p>
                  )}
                  {errors.username && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.username.join(", ")}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                    <Lock className="inline w-4 h-4 mr-2" />
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-base"
                    placeholder="••••••••"
                    required
                    minLength="8"
                  />
                  {touched.password && validationErrors.password && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.password}
                    </p>
                  )}
                  {errors.password && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-base"
                    placeholder="votre@email.com"
                    required
                  />
                  {touched.email && validationErrors.email && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.email}
                    </p>
                  )}
                  {errors.email && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email.join(", ")}
                    </p>
                  )}
                </div>

                {/* Password Confirmation */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="password_confirmation">
                    <Lock className="inline w-4 h-4 mr-2" />
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password_confirmation")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-base"
                    placeholder="••••••••"
                    required
                    minLength="8"
                  />
                  {touched.password_confirmation && validationErrors.password_confirmation && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.password_confirmation}
                    </p>
                  )}
                  {errors.password_confirmation && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password_confirmation.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Second Row - Role and Phone */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="role">
                  Rôle
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    onBlur={() => handleBlur("role")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-base appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Sélectionnez votre rôle</option>
                    <option value="learner">Apprenant</option>
                    <option value="instructor">Instructeur</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {touched.role && validationErrors.role && (
                  <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.role}
                  </p>
                )}
                {errors.role && (
                  <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.role.join(", ")}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="phone">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Téléphone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-base"
                  placeholder="Numéro de téléphone"
                  maxLength={20}
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone.join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Bio - Full Width */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="bio">
                <FileText className="inline w-4 h-4 mr-2" />
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white resize-none text-base"
                rows="4"
                placeholder="Parlez-nous de vous..."
              />
              {errors.bio && (
                <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.bio.join(", ")}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-5 rounded-xl font-semibold text-white text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800 active:bg-slate-950 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-600 text-base">
              Vous avez déjà un compte ?{" "}
              <a
                href="/login"
                className="font-semibold text-slate-900 hover:text-slate-700 transition-colors duration-200"
              >
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
