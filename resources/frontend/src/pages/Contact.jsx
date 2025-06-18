"use client"
import React from "react"
import { motion } from "framer-motion"
import { Mail, MessageCircle, Phone, MapPin, Clock, Users } from "lucide-react"
import ContactForm from "../components/contact/ContactForm"
import ContactInfoCard from "../components/contact/ContactInfoCard"
import GoogleMapEmbed from "../components/contact/GoogleMapEmbed"
import SocialLinks from "../components/contact/SocialLinks"

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Contactez-nous</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Une question ? Une suggestion ? Notre équipe est là pour vous accompagner dans votre parcours
              d'apprentissage.
            </p>

            {/* Quick Contact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 mr-2" />
                  <span className="text-lg font-semibold">24h</span>
                </div>
                <p className="text-sm text-blue-100">Temps de réponse moyen</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 mr-2" />
                  <span className="text-lg font-semibold">7j/7</span>
                </div>
                <p className="text-sm text-blue-100">Support disponible</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  <span className="text-lg font-semibold">100%</span>
                </div>
                <p className="text-sm text-blue-100">Satisfaction client</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            className="relative block w-full h-12"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Methods Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Plusieurs façons de nous contacter</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez le moyen de communication qui vous convient le mieux
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email Contact */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Pour toute question générale ou demande d'information</p>
              <a
                href="mailto:contact@fmdd.org"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                contact@fmdd.org
                <Mail className="w-4 h-4 ml-1" />
              </a>
            </div>

            {/* Phone Contact */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Téléphone</h3>
              <p className="text-gray-600 mb-4">Pour un support immédiat et personnalisé</p>
              <a
                href="tel:+2125XXXXXXX"
                className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
              >
                +212 5XX-XXXXXX
                <Phone className="w-4 h-4 ml-1" />
              </a>
            </div>

            {/* Visit Us */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visite</h3>
              <p className="text-gray-600 mb-4">Rencontrez notre équipe dans nos bureaux</p>
              <span className="text-green-600 font-medium">Sur rendez-vous uniquement</span>
            </div>
          </div>
        </motion.div>

        {/* Main Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <ContactForm />
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-1 space-y-8"
          >
            <ContactInfoCard />
            <GoogleMapEmbed />

            {/* Social Links */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Suivez-nous
              </h3>
              <div className="flex gap-4">
                <SocialLinks />
              </div>
              <p className="text-sm text-gray-600 mt-4">Restez informé de nos dernières formations et actualités</p>
            </div>
          </motion.aside>
        </div>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-lg text-gray-600">Trouvez rapidement les réponses à vos questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment puis-je m'inscrire à une formation ?</h3>
              <p className="text-gray-600">
                Vous pouvez vous inscrire directement sur notre plateforme en créant un compte gratuit, puis en
                sélectionnant la formation qui vous intéresse.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Les formations sont-elles certifiantes ?</h3>
              <p className="text-gray-600">
                Oui, toutes nos formations délivrent un certificat de réussite reconnu par les professionnels du
                secteur.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Puis-je suivre les cours à mon rythme ?</h3>
              <p className="text-gray-600">
                Absolument ! Nos formations sont conçues pour s'adapter à votre emploi du temps. Vous avez accès aux
                contenus 24h/24.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Y a-t-il un support technique ?</h3>
              <p className="text-gray-600">
                Notre équipe support est disponible pour vous aider avec toute question technique ou pédagogique via ce
                formulaire de contact.
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}

export default Contact
