import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ValeursFMDD = () => {
  const valeurs = [
    {
      titre: "Innovation Pédagogique",
      description: "Nous repensons l'apprentissage avec des méthodes adaptées aux réalités du marché.",
      icon: "💡"
    },
    {
      titre: "Accessibilité",
      description: "Des formations de qualité accessibles à tous, sans barrières géographiques ou financières.",
      icon: "🌍"
    },
    {
      titre: "Communauté Engagée",
      description: "Un réseau actif d'apprenants et de professionnels pour échanger et grandir ensemble.",
      icon: "👥"
    },
    {
      titre: "Excellence Technique",
      description: "Un contenu rigoureux, actualisé en permanence par des experts en activité.",
      icon: "🎯"
    }
  ];

  const plans = [
    {
      nom: "FMDD Standard",
      prix: "Gratuit",
      avantages: [
        "Accès aux cours de base",
        "Support communautaire",
        "1 projet corrigé/mois",
        "Certificats de participation"
      ],
      couleur: "bg-blue-600",
      cta: "Commencer"
    },
    {
      nom: "FMDD Premium",
      prix: "500 dhs/mois",
      avantages: [
        "Tous les cours avancés",
        "Support prioritaire",
        "Corrections illimitées",
        "Certifications professionnelles",
        "Accès aux ateliers privés",
        "Mentorat individuel",
        "Accès à des ressources exclusives"
      ],
      couleur: "bg-purple-600",
      cta: "Devenir Membre"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Valeurs */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Valeurs Fondatrices
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              FMDD School s'engage à transformer l'apprentissage du développement en une expérience enrichissante et accessible à tous.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valeurs.map((valeur, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <span className="text-4xl mb-4 block">{valeur.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{valeur.titre}</h3>
                <p className="text-gray-600">{valeur.description}</p>
              </motion.div>
            ))}
      </div>
        </div>

        {/* Section Tarifs */}
        <div className="text-center mt-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choisissez Votre Formule
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Un programme adapté à chaque niveau d'engagement dans votre apprentissage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200"
              >
                <div className={`${plan.couleur} py-6 text-center text-white`}>
                  <h3 className="text-2xl font-bold">{plan.nom}</h3>
                  <p className="text-xl mt-2">{plan.prix}</p>
                </div>
                <div className="p-8">
                  <ul className="text-left text-gray-700 mb-6 space-y-3">
                    {plan.avantages.map((avantage, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {avantage}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={plan.nom === "FMDD Standard" ? "/register" : "/register&payment"}
                    className={`${plan.couleur} text-white font-semibold py-3 px-6 rounded-lg block text-center hover:opacity-90 transition-opacity`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-gray-600">
            Besoin d'aide pour choisir ?{' '}
            <Link to="/contact" className="text-blue-600 hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValeursFMDD;