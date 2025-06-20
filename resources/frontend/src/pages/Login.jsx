"use client"

import { useState, useEffect } from "react"
import { login } from "../services/api"
import { useNavigate } from "react-router-dom"
import {
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen,
  Lightbulb,
  Target,
  Zap,
  Brain,
  Rocket,
} from "lucide-react"

function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.role === "instructor") {
        navigate("/instructor")
      } else if (user.role === "learner") {
        navigate("/learner")
      }
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const response = await login(credentials)
      const role = response.data.user.role

      switch (role) {
        case "learner":
          navigate("/learner")
          break
        case "admin":
          navigate("/admin")
          break
        case "instructor":
          navigate("/instructor/dashboard")
          break
        default:
          setError("Rôle non pris en charge")
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors
        const errorMessage = validationErrors
          ? Object.values(validationErrors).flat().join(", ")
          : "Données d'authentification invalides"
        setError(errorMessage)
      } else if (err.response?.status === 401) {
        setError("Email ou mot de passe incorrect")
      } else {
        setError(err.response?.data?.message || "Échec de la connexion")
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
            Pas de compte ?{" "}
            <a href="/register" className="text-black font-semibold hover:text-gray-700 transition-colors">
              S'inscrire
            </a>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen pt-20">
        {/* Left Side - Hero Content */}
        <div className="hidden lg:flex lg:w-2/5 items-center justify-center p-12 relative">
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-20 h-20 bg-blue-100 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-16 h-16 bg-purple-100 rounded-full opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-8 w-12 h-12 bg-green-100 rounded-full opacity-50 animate-pulse delay-500"></div>

          <div className="max-w-lg text-center relative z-10">
            {/* Main Illustration */}
            <div className="mb-12 relative">
              <div className="w-80 h-80 mx-auto relative">
                {/* Central Circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <Brain className="w-24 h-24 text-gray-700" />
                  </div>
                </div>

                {/* Orbiting Icons */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-4 right-8 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-4 left-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-700">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-1000">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Bienvenue dans votre espace d'apprentissage</h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Connectez-vous pour continuer votre parcours de développement personnel et professionnel.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Cours interactifs</h3>
                <p className="text-sm text-gray-600">Apprentissage engageant</p>
              </div>

              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Objectifs clairs</h3>
                <p className="text-sm text-gray-600">Progression mesurable</p>
              </div>

              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Apprentissage rapide</h3>
                <p className="text-sm text-gray-600">Méthodes efficaces</p>
              </div>

              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <Rocket className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Croissance accélérée</h3>
                <p className="text-sm text-gray-600">Résultats concrets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">LearnHub</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full transform translate-x-16 -translate-y-16"></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
                  <p className="text-gray-600">Accédez à votre espace personnel</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email</label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Mot de passe</label>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        placeholder="Votre mot de passe"
                        className="w-full px-4 py-4 pl-12 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors duration-300" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-600">Se souvenir</span>
                    </label>
                    <a
                      href="/forgot-password"
                      className="text-sm text-black hover:text-gray-700 transition-colors duration-200 font-medium"
                    >
                      Mot de passe oublié ?
                    </a>
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
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="w-5 h-5" />
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
  )
}

export default Login
