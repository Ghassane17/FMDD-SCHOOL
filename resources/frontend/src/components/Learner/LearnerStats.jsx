const LearnerStats = ({ school, userName, lastLogin, avatar }) => (
  <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6 rounded-xl shadow-lg mb-8">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{school}</h1>
        <p className="text-sm mt-1 sm:text-base">{userName}</p>
        <p className="text-xs opacity-75 sm:text-sm">Dernière connexion: {lastLogin}</p>
      </div>
      <img
        src={avatar || "https://via.placeholder.com/50"}
        alt="Avatar"
        className="w-12 h-12 rounded-full border-2 border-white sm:w-16 sm:h-16"
      />
    </div>
  </header>
);

export default LearnerStats;