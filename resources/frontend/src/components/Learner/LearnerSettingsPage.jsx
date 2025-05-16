import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearnerSettings, updateLearnerSettings } from '@/services/api.js';

const AccountSettings = () => {
    const [settings, setSettings] = useState(null);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Current learner from localStorage:', user);
        if (!user || user.role !== 'learner') {
            setError('Please log in as a learner.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const fetchSettings = async () => {
            try {
                const response = await getLearnerSettings(true);
                console.log('Fetched settings:', response.data);
                setSettings(response.data);
            } catch (err) {
                console.error('Failed to fetch settings:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message,
                });
                setError('Failed to load settings.');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [navigate]);

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await updateLearnerSettings(passwordData);
            setSuccess(response.data.message || 'Password updated successfully');
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error && !settings) return <div className="text-red-600">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Paramètres du compte</h2>

            <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Modifier mes informations</h3>
                <form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Nom complet</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                defaultValue={settings?.name}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                defaultValue={settings?.email}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Photo de profil</label>
                        <div className="flex items-center">
                            <img
                                src={settings?.avatar || 'https://via.placeholder.com/50'}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover mr-4"
                            />
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled
                            >
                                Changer la photo
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        disabled
                    >
                        Enregistrer les modifications
                    </button>
                </form>
            </div>

            <div className="mb-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Changer le mot de passe</h3>
                <form onSubmit={handlePasswordSubmit}>
                    {error && <div className="text-red-600 mb-4">{error}</div>}
                    {success && <div className="text-green-600 mb-4">{success}</div>}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Mot de passe actuel</label>
                            <input
                                type="password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Nouveau mot de passe</label>
                            <input
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                            <input
                                type="password"
                                name="new_password_confirmation"
                                value={passwordData.new_password_confirmation}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
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
                                defaultChecked={settings?.notifications?.email}
                                disabled
                            />
                            <label
                                htmlFor="email-toggle"
                                className="block absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-blue-600 rounded-full transition-colors duration-300"
                            >
                                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 transform translate-x-6"></span>
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
                                defaultChecked={settings?.notifications?.app}
                                disabled
                            />
                            <label
                                htmlFor="app-toggle"
                                className="block absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-blue-600 rounded-full transition-colors duration-300"
                            >
                                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 transform translate-x-6"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
