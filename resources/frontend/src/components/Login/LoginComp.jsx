import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from "../../services/api.js";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      const response = await login(formData);
      console.log('Login success:', response.data);
      localStorage.setItem('token', response.data.token);
      setMessage('Login successful! Redirecting…');
      if(response.data.user.role === 'instructor') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => navigate('/instructor'), 1500);
      }
      else if(response.data.user.role === 'learner') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => navigate('/learner'), 1500);
      }
      else if(response.data.user.role === 'admin') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => navigate('/admin'), 1500);
      }
      else {
        setMessage('Login successful! Redirecting…');
        setTimeout(() => navigate('/'), 1500);
      }

    } catch (error) {
      console.error('Login failed:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 401) {
        setErrors({ general: 'Invalid credentials.' });
      } else {
        setErrors({ general: 'Server error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {errors.general && <p className="text-red-500 mb-4">{errors.general}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.join(', ')}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              minLength="6"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.join(', ')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 text-white rounded ${
              loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Don’t have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
