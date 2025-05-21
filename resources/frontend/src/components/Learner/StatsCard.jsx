/* StatsCard.jsx */
const StatsCard = ({ totalCourses, completedCourses, lastActivity }) => (
  <div className="p-6 mb-8">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Votre progression</h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="flex items-center space-x-3">
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <div>
          <p className="text-sm text-gray-600">Cours inscrits</p>
          <p className="text-xl font-bold text-gray-800">{totalCourses}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <p className="text-sm text-gray-600">Cours accomplis</p>
          <p className="text-xl font-bold text-gray-800">{completedCourses}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm text-gray-600">Dernière activité</p>
          <p className="text-sm font-medium text-gray-800 truncate">{lastActivity}</p>
        </div>
      </div>
    </div>
  </div>
);

export default StatsCard;
