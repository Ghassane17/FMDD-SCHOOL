import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast.js";
import { Check, Send } from "lucide-react";
import { submitContactForm } from "@/services/api.js";
import { useNavigate } from "react-router-dom";

// Available subjects for the dropdown
const SUBJECTS = [
    "Problème technique",
    "Partenariat",
    "Formation",
    "Autre…"
];

const ContactForm = () => {
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: ""
        }
    });

    const onSubmit = async (data) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'learner') {
            toast({
                title: "Erreur",
                description: "Veuillez vous connecter en tant qu'apprenant.",
                variant: "destructive"
            });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        try {
            await submitContactForm(data);
            setSubmitted(true);
            toast({
                title: "Merci",
                description: "Nous vous répondrons bientôt !"
            });
            reset();
        } catch (error) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Échec de l'envoi du message.",
                variant: "destructive"
            });
        }
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
                    <form
                        className="space-y-5"
                        onSubmit={handleSubmit(onSubmit)}
                        autoComplete="off"
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                    >
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
                            {errors.name && (
                                <div className="text-sm text-red-500 flex items-center gap-1">
                                    {errors.name.message}
                                </div>
                            )}
                        </div>

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
                            {errors.email && (
                                <div className="text-sm text-red-500 flex items-center gap-1">
                                    {errors.email.message}
                                </div>
                            )}
                        </div>

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
                                {SUBJECTS.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                            {errors.subject && (
                                <div className="text-sm text-red-500 flex items-center gap-1">
                                    {errors.subject.message}
                                </div>
                            )}
                        </div>

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
                            {errors.message && (
                                <div className="text-sm text-red-500 flex items-center gap-1">
                                    {errors.message.message}
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-gray-500 italic mb-4">
                            * Champs obligatoires
                        </div>

                        <div className="flex justify-center w-full mt-6">
                            <Button
                                type="submit"
                                className={`
                  cursor-pointer
                  text-white
                  bg-blue-500 hover:bg-blue-600
                  rounded-lg
                  text-base
                  font-medium
                  px-6 py-3
                  transition
                  disabled:opacity-50 disabled:cursor-not-allowed
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
