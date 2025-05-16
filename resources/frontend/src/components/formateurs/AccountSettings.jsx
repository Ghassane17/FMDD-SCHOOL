import React, { useState, useEffect } from 'react';

export default function AccountSettings() {
  // Grab user and instructor data from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const instructor = JSON.parse(localStorage.getItem('instructor')) || {};

  // Local state for form fields
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsApp, setNotificationsApp] = useState(true);

  useEffect(() => {
    // Initialize toggles if stored in instructor settings
    if (instructor.notifications) {
      setNotificationsEmail(instructor.notifications.email);
      setNotificationsApp(instructor.notifications.app);
    }
  }, [instructor.notifications]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // TODO: implement API call to update profile
    console.log('Updating profile', { username, email, bio, avatar });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    // TODO: implement API call to change password
    console.log('Changing password');
  };

  const handleToggle = (type) => {
    if (type === 'email') setNotificationsEmail(!notificationsEmail);
    if (type === 'app') setNotificationsApp(!notificationsApp);
    // TODO: implement API call to update notification settings
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Paramètres du compte</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Modifier mes informations</h3>
        <form onSubmit={handleProfileUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Biographie</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Photo de profil</label>
            <div className="flex items-center">
              {avatar && (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover mr-4"
                />
              )}
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  // TODO: open file selector and update avatar state
                }}
              >
                Changer la photo
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Enregistrer les modifications
          </button>
        </form>
      </div>

      <div className="mb-6 pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Changer le mot de passe</h3>
        <form onSubmit={handleChangePassword}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                className="w-full px-3 py-2:border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Notifications</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications par email</h4>
              <p className="text-gray-600 text-sm">Recevoir des emails sur les activités importantes</p>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                className="opacity-0 w-0 h-0"
                id="email-toggle"
                checked={notificationsEmail}
                onChange={() => handleToggle('email')}
              />
              <label
                htmlFor="email-toggle"
                className="block absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300"
                style={{ backgroundColor: notificationsEmail ? '#2563EB' : '#ccc' }}
              >
                <span
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${notificationsEmail ? 'translate-x-6' : ''}`}
                ></span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications dans l'application</h4>
              <p className="text-gray-600 text-sm">Recevoir des notifications dans la plateforme</p>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                className="opacity-0 w-0 h-0"
                id="app-toggle"
                checked={notificationsApp}
                onChange={() => handleToggle('app')}
              />
              <label
                htmlFor="app-toggle"
                className="block absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300"
                style={{ backgroundColor: notificationsApp ? '#2563EB' : '#ccc' }}
              >
                <span
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${notificationsApp ? 'translate-x-6' : ''}`}
                ></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
