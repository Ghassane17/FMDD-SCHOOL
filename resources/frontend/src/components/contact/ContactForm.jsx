import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"; // Added CardHeader and CardTitle
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "../../hooks/use-toast";
import { Check, Send, Loader2, AlignCenter } from "lucide-react"; // Added icons for better visual feedback

// Available subjects for the dropdown
const SUBJECTS = [
  "Problème technique",
  "Partenariat",
  "Formation",
  "Autre…"
];

/**
 * ContactForm Component - A responsive contact form with validation
 * 
 * Features:
 * - Form validation with error messages
 * - Loading state while submitting
 * - Success feedback after submission
 * - Reset functionality to send another message
 */
const ContactForm = () => {
  // Track if form has been successfully submitted
  const [submitted, setSubmitted] = useState(false);
  
  // Initialize react-hook-form with default values and validation
  const { 
    register,           // Function to register inputs with validation
    handleSubmit,       // Function to handle form submission
    formState: { 
      errors,           // Object containing validation errors
      isSubmitting      // Boolean indicating if form is currently submitting
    }, 
    reset               // Function to reset form fields
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  /**
   * Form submission handler
   * In a real application, this would send data to a backend
   */
  const onSubmit = async () => {
    // Simulate API call with 1-second delay
    await new Promise((r) => setTimeout(r, 1000));
    
    // Update UI state to show success message
    setSubmitted(true);
    
    // Show toast notification
    toast({ 
      title: "Merci", 
      description: "Nous vous répondrons bientôt !" 
    });
    
    // Clear form fields
    reset();
  };

  return (
    <Card className="shadow-xl border-t-4 border-t-brand-teal">
      <CardHeader className="bg-gray-50 border-b pb-4">
        <CardTitle className="text-xl md:text-2xl font-semibold text-brand-blue flex items-center gap-2">
          Formulaire de contact
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-8 md:px-8">
        {!submitted ? (
          // Contact form - shown before submission
          <form 
            className="space-y-5" 
            onSubmit={handleSubmit(onSubmit)} 
            autoComplete="off"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} // Ensuring form layout is correctly displayed
          >
            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-brand-blue">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                {...register("name", { 
                  required: "Merci d'entrer votre nom complet" 
                })}
                placeholder="Votre nom"
                className={`transition-all ${errors.name ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-brand-teal/40"}`}
                disabled={isSubmitting}
              />
              {/* Error message for name field */}
              {errors.name && 
                <div className="text-sm text-red-500 flex items-center gap-1">
                  {errors.name.message}
                </div>
              }
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-brand-blue">
                Adresse email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Merci d'entrer votre email",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Adresse email invalide"
                  }
                })}
                placeholder="ex: contact@fmdd.org"
                className={`transition-all ${errors.email ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-brand-teal/40"}`}
                disabled={isSubmitting}
              />
              {/* Error message for email field */}
              {errors.email && 
                <div className="text-sm text-red-500 flex items-center gap-1">
                  {errors.email.message}
                </div>
              }
            </div>

            {/* Subject Dropdown */}
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium text-brand-blue">
                Sujet <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                {...register("subject", { 
                  required: "Merci de sélectionner un sujet" 
                })}
                className={`block w-full rounded-md border px-3 py-2 text-sm transition-all
                  ${errors.subject ? "border-red-500" : "border-input"} 
                  bg-background focus-visible:outline-none focus-visible:ring-2
                  ${errors.subject ? "focus-visible:ring-red-300" : "focus-visible:ring-brand-teal/40"}`}
                disabled={isSubmitting}
              >
                <option value="">Sélectionnez un sujet</option>
                {/* Map through available subjects */}
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              {/* Error message for subject field */}
              {errors.subject && 
                <div className="text-sm text-red-500 flex items-center gap-1">
                  {errors.subject.message}
                </div>
              }
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-brand-blue">
                Message <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="message"
                {...register("message", {
                  required: "Merci de saisir votre message",
                  minLength: { 
                    value: 10, 
                    message: "10 caractères minimum" 
                  }
                })}
                rows={5}
                placeholder="Votre message"
                className={`transition-all ${errors.message ? "border-red-500 focus-visible:ring-red-300" : "focus-visible:ring-brand-teal/40"}`}
                disabled={isSubmitting}
              />
              {/* Error message for message field */}
              {errors.message && 
                <div className="text-sm text-red-500 flex items-center gap-1">
                  {errors.message.message}
                </div>
              }
            </div>

            {/* Submission Policy Note */}
            <div className="text-xs text-gray-500 italic mb-4">
              * Champs obligatoires
            </div>

            {/* Submit Button with loading state - with explicit display and padding to ensure visibility */}
            {/* Wrapper: full‑width flex container, centered items */}
            <div className="flex justify-center w-full mt-6">
              <Button
                type="submit"
                className={`
                  cursor-pointer                              /* pointer on hover */
                  text-white 
                  bg-blue-500 hover:bg-blue-600                /* colors */
                  rounded-lg                                  /* slightly more rounded */
                  text-base                                    /* larger text */
                  font-medium 
                  px-6 py-3                                   /* bigger padding */
                  transition                                  /* smooth hover */
                  disabled:opacity-50 disabled:cursor-not-allowed /* styling when disabled */
                `}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    Envoi en cours…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send size={16} />
                    Envoyer
                  </span>
                )}
              </Button>
            </div>

          </form>
        ) : (
          // Success message - shown after submission
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-full">
                <Check size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-brand-blue mb-2">
              Merci pour votre message !
            </h3>
            <p className="text-gray-600 mb-4">
              Nous vous répondrons dans les plus brefs délais.
            </p>
            {/* Button to reset form and send another message */}
            <Button
              variant="outline"
              className="cursor-pointer mt-4 border-brand-teal text-brand-teal hover:bg-black hover:text-white"
              onClick={() => setSubmitted(false)}
            >
              Envoyer un autre message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactForm;