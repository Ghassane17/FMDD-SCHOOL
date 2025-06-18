"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Check, Send, X } from "lucide-react"
import { submitContactForm } from "@/services/api.js"

// Available subjects for the dropdown
const SUBJECTS = ["Problème technique", "Partenariat", "Formation", "Autre…"]

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success") // "success" or "error"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const showToast = (message, type = "success") => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(""), 5000)
  }

  const onSubmit = async (data) => {
    try {
      await submitContactForm(data)
      setSubmitted(true)
      showToast("Merci ! Nous vous répondrons bientôt !")
      reset({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      showToast(error.response?.data?.message || "Échec de l'envoi du message.", "error")
    }
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            toastType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-teal-600 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b px-6 py-4">
          <h2 className="text-xl md:text-2xl font-semibold text-blue-900 flex items-center gap-2">
            <Send className="w-6 h-6 text-teal-600" />
            Formulaire de contact
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-8 md:px-8">
          {!submitted ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-blue-900">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name", {
                    required: "Merci d'entrer votre nom complet",
                  })}
                  placeholder="Votre nom"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                    errors.name ? "border-red-500 focus:ring-red-300" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <div className="text-sm text-red-500 flex items-center gap-1">{errors.name.message}</div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-blue-900">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Merci d'entrer votre email",
                    pattern: {
                      value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                      message: "Adresse email invalide",
                    },
                  })}
                  placeholder="ex: contact@fmdd.org"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                    errors.email ? "border-red-500 focus:ring-red-300" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <div className="text-sm text-red-500 flex items-center gap-1">{errors.email.message}</div>
                )}
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-blue-900">
                  Sujet <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  {...register("subject", {
                    required: "Merci de sélectionner un sujet",
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white ${
                    errors.subject ? "border-red-500 focus:ring-red-300" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionnez un sujet</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <div className="text-sm text-red-500 flex items-center gap-1">{errors.subject.message}</div>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-blue-900">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  {...register("message", {
                    required: "Merci de saisir votre message",
                    minLength: {
                      value: 10,
                      message: "10 caractères minimum",
                    },
                  })}
                  rows={5}
                  placeholder="Votre message"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-vertical ${
                    errors.message ? "border-red-500 focus:ring-red-300" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <div className="text-sm text-red-500 flex items-center gap-1">{errors.message.message}</div>
                )}
              </div>

              {/* Required Fields Note */}
              <div className="text-xs text-gray-500 italic">* Champs obligatoires</div>

              {/* Submit Button */}
              <div className="flex justify-center w-full pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success State */
            <div className="py-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 text-green-600 p-4 rounded-full">
                  <Check className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Merci pour votre message !</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.
              </p>
              <button
                className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                onClick={() => setSubmitted(false)}
              >
                Envoyer un autre message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactForm
