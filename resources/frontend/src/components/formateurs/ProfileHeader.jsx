import React, { useState } from 'react';

const ProfileHeader = ({ instructorData }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = instructorData?.user || {};

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start">
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.name || 'Profile'}
            className="rounded-full w-32 h-32 object-cover border-4 border-blue-100"
          />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800">
            {user.name || 'Chargement...'}
          </h1>
          <p className="text-gray-600 mt-2 mb-4">
            {user.bio || 'Chargement de la biographie...'}
          </p>
          <button
            onClick={() => setShowContactModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Contacter
          </button>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Contacter {user.name || 'Chargement...'}
            </h2>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
