const ProfileHeader = ({ instructorData, backend_url }) => {
  const user = instructorData?.user || {}
  const avatar = user.avatar || "/default-avatar.png"
  const avatar_url = avatar.startsWith("http") ? avatar : `${backend_url}${avatar}`

  return (
    <div className="bg-white rounded-2xl shadow-lg mb-10 overflow-hidden">
      {/* Bannière décorative en haut */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
        <div className="absolute inset-0 opacity-20 bg-[url('/pattern-dots.svg')]"></div>
      </div>

      <div className="px-8 pb-8 relative">
        {/* Avatar positionné sur la bannière */}
        <div className="relative -mt-16 mb-6 flex justify-center md:justify-start">
          <div className="rounded-full w-40 h-40 border-4 border-white shadow-xl overflow-hidden">
            <img
              src={avatar_url || "/default-avatar.png"}
              alt={user.name || "Profil"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Informations de l'instructeur */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name || "Chargement..."}</h1>
            <p className="text-gray-600 text-lg mb-6">{user.bio || "Expert en développement web et mobile"}</p>

            {/* Séparateur */}
            <div className="w-20 h-1 bg-blue-500 mb-6"></div>

            {/* Paragraphes explicatifs */}
            <div className="prose prose-blue max-w-none">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                Bienvenue sur notre plateforme d'apprentissage
              </h3>
              <p className="text-gray-600 mb-4">
                Notre plateforme e-learning vous permet d'accéder à des cours de qualité et de vous connecter avec des
                étudiants du monde entier. Développez vos compétences à votre rythme avec des instructeurs experts dans
                leur domaine.
              </p>
              <p className="text-gray-600">
                En tant qu'instructeur, vous pouvez partager votre expertise, créer des cours interactifs et accompagner
                les apprenants dans leur parcours de formation. Rejoignez notre communauté éducative et participez à la
                transmission du savoir dans un environnement numérique innovant.
              </p>
            </div>
          </div>

          {/* Carte d'information */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 w-full md:w-80 flex-shrink-0">
            <h3 className="font-semibold text-gray-800 mb-4">À propos de la plateforme</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-600">Accès à des cours de qualité</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-600">Apprentissage à votre rythme</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-600">Communauté internationale</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-600">Certificats reconnus</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-600">Ressources pédagogiques variées</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
