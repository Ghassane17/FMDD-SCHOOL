import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, initializeCSRF } from '../services/api.js';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'learner',
        avatar: null,
        bio: '',
        phone:''
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`handleChange: Updating ${name} to ${value}`);
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            console.log('New formData:', newData);
            return newData;
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    avatar: ['Please select a valid image file']
                }));
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    avatar: ['Image size should not exceed 5MB']
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                avatar: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Clear any previous errors
            setErrors(prev => ({
                ...prev,
                avatar: undefined
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');
        setLoading(true);

        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('password_confirmation', formData.password_confirmation);
        data.append('role', formData.role);
        data.append('bio', formData.bio);
        data.append('phone', formData.phone);
        if (formData.avatar) {
            data.append('avatar', formData.avatar);
        }

        try {
            await initializeCSRF();
            const response = await register(data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const user = response.data.user;
            setMessage('Inscription réussie ! Redirection...');

            // Multistep redirect based on role
            if (user.role === 'learner') {
                setTimeout(() => navigate('/learner/learner-profile'), 1500);
            } else if (user.role === 'instructor') {
                setTimeout(() => navigate('/instructor/instructor-profile'), 1500);
            } else {
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: error.response?.data?.message || 'Impossible de se connecter au serveur.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
                {message && <p className="text-green-500 mb-4">{message}</p>}
                {errors.general && <p className="text-red-500 mb-4">{errors.general}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="username">Nom complet</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        {errors.username && <p className="text-red-500 text-sm">{errors.username.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                            minLength="8"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="password_confirmation">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                            minLength="8"
                        />
                        {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="role">Rôle</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="learner">Apprenant</option>
                            <option value="instructor">Instructeur</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-sm">{errors.role.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="avatar">Photo de profil</label>
                        <div className="flex items-center space-x-4">
                            {avatarPreview && (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            )}
                            <input
                                type="file"
                                name="avatar"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="bio">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows="4"
                        />
                        {errors.bio && <p className="text-red-500 text-sm">{errors.bio.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="phone">Téléphone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Numéro de téléphone"
                            maxLength={20}
                        />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.join(', ')}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-2 text-white rounded ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} transition`}
                    >
                        {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                    </button>
                </form>

                <p className="mt-4 text-center">
                    Vous avez déjà un compte ? <a href="/login" className="text-indigo-600 hover:underline">Se connecter</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
