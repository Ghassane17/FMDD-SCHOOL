import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api.js';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'learner',
        profile_image: '',
        bio: '',
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');
        setLoading(true);
        console.log('Submitting registration:', formData);

        try {
            const response = await register(formData);
            console.log('Registration response:', response.data);
            localStorage.setItem('token', response.data.token);
            setMessage('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error('Registration failed:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors); // Set field-specific errors
            } else {
                setErrors({ general: 'Failed to connect to server. Please check if the backend is running.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                {message && <p className="text-green-500 mb-4">{message}</p>}
                {errors.general && <p className="text-red-500 mb-4">{errors.general}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
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
                            className="w-full p-2 border rounded"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                            minLength="6"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="password_confirmation">Confirm Password</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                            minLength="6"
                        />
                        {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="role">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="learner">Learner</option>
                            <option value="instructor">Instructor</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-sm">{errors.role.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="profile_image">Profile Image URL</label>
                        <input
                            type="url"
                            name="profile_image"
                            value={formData.profile_image}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                        {errors.profile_image && <p className="text-red-500 text-sm">{errors.profile_image.join(', ')}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="bio">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows="4"
                        />
                        {errors.bio && <p className="text-red-500 text-sm">{errors.bio.join(', ')}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-2 text-white rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="mt-4 text-center">
                    Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
