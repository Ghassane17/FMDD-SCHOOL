import React, { useState } from 'react';

const ProfileHeader = ({ instructorData }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = instructorData?.user || {};

  return (
    <div className="bg-white rounded-2xl shadow-lg p-10 mb-10 flex flex-col md:flex-row items-center md:items-center gap-10 border-l-8 border-indigo-200 relative">
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-auto">
        <div className="relative">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.name || 'Profile'}
            className="rounded-full w-40 h-40 object-cover border-4 border-blue-200 shadow-md mb-4 bg-white"
          />
        </div>
      </div>
      <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left w-full">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-1">{user.name || 'Chargement...'}</h1>
        <p className="text-gray-500 text-lg mb-6">{user.bio || 'Expert en développement web et mobile'}</p>
        <button
          onClick={() => setShowContactModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold py-2 px-8 rounded-lg shadow transition-all duration-200 transform hover:scale-105 focus:outline-none"
        >
          Contacter
        </button>
      </div>
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Contacter {user.name || 'Chargement...'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); /* handle send */ }}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Sujet</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sujet de votre message"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Votre message..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:from-indigo-700 hover:to-blue-600 shadow"
                  disabled={loading}
                >
                  {loading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
