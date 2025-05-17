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
        avatar: '',
        bio: '',
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');
        setLoading(true);

        const data = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
            role: formData.role,
            avatar: formData.avatar,
            bio: formData.bio,
        };

        console.log('Submitting registration:', data);

        try {
            console.log('Initializing CSRF...');
            await initializeCSRF();
            console.log('CSRF initialized, sending registration request...');
            const response = await register(data);
            console.log('Registration response:', response.data);
            setMessage('Inscription réussie ! Redirection vers la page login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error('Échec de l\'inscription:', error);
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
                        <label className="block text-gray-700 mb-2" htmlFor="username">Nom d'utilisateur</label>
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
                        <label className="block text-gray-700 mb-2" htmlFor="avatar">URL de l'avatar</label>
                        <input
                            type="url"
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://example.com/avatar.jpg"
                        />
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
