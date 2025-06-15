"use client"

import { useState, useEffect } from "react"
import { login } from "../services/api"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, GraduationCap, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"

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
      console.log("User from localStorage:", user)
      console.log("User role:", user.role)
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
      console.log("Login success:", response.data)

      // Vérifier le message de succès qui devrait être "Login successful"
      if (response.data.message === "Login successful") {
        console.log("Authentication confirmed with message:", response.data.message)
      }

      const role = response.data.user.role
      console.log("User role:", role)

      // Navigation basée sur le rôle
      switch (role) {
        case "learner":
          console.log("Navigating to /learner")
          navigate("/learner")
          break
        case "admin":
          console.log("Navigating to /admin")
          navigate("/admin")
          break
        case "instructor":
          console.log("Navigating to /instructor/dashboard")
          navigate("/instructor/dashboard")
          break
        default:
          setError("Rôle non pris en charge")
      }
    } catch (err) {
      console.error("Login failed:", err)

      // Gestion d'erreur améliorée
      if (err.response?.status === 422) {
        // Erreurs de validation
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bienvenue !</h1>
          <p className="text-slate-600">Connectez-vous à votre compte</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="votre@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Votre mot de passe"
                  className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800 active:bg-slate-950 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>


          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-600">
              Pas encore de compte ?{" "}
              <a
                href="/register"
                className="font-semibold text-slate-900 hover:text-slate-700 transition-colors duration-200"
              >
                Créer un compte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
