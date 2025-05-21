import React, { useState, useEffect } from 'react';
import { updateInstructorProfile } from '../../services/api_instructor';
import { Loader2 } from 'lucide-react';

export default function AccountSettings({ instructorData }) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: instructorData?.user?.name || '',
    email: instructorData?.user?.email || '',
    bio: instructorData?.user?.bio || ''
  });

  // Update form data when instructorData changes
  useEffect(() => {
    if (instructorData?.user) {
      setFormData({
        name: instructorData.user.name || '',
        email: instructorData.user.email || '',
        bio: instructorData.user.bio || ''
      });
    }
  }, [instructorData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateInstructorProfile({
        name: formData.name,
        email: formData.email,
        bio: formData.bio
      });

      setSuccess('Profil mis à jour avec succès');
      // Update local state with new data
      if (response.instructor) {
        setFormData({
          name: response.instructor.user.name,
          email: response.instructor.user.email,
          bio: response.instructor.user.bio
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setPasswordLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateInstructorProfile({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      setSuccess('Mot de passe mis à jour avec succès');
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Paramètres du compte</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Modifier mes informations</h3>
        <form onSubmit={handleProfileUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Biographie</label>
            <textarea
              name="bio"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={formData.bio}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            disabled={profileLoading}
          >
            {profileLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {profileLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
                name="currentPassword"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                name="newPassword"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            disabled={passwordLoading}
          >
            {passwordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {passwordLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
