import { useState } from 'react';
import { login, setToken, setUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await login(credentials);
            console.log('Login success:', response.data);

            // Vérifier le message de succès qui devrait être "Login successful"
            if (response.data.message === "Login successful") {
                console.log('Authentication confirmed with message:', response.data.message);
            }

            const role = response.data.user.role;
            console.log('User role:', role);

            // Navigation basée sur le rôle
            switch (role) {
                case 'learner':
                    console.log('Navigating to /learner');
                    navigate('/learner');
                    break;
                case 'admin':
                    console.log('Navigating to /admin');
                    navigate('/admin');
                    break;
                case 'instructor':
                    console.log('Navigating to /instructor/dashboard');
                    navigate('/instructor/dashboard');
                    break;
                default:
                    setError('Rôle non pris en charge');
            }
        } catch (err) {
            console.error('Login failed:', err);

            // Gestion d'erreur améliorée
            if (err.response?.status === 422) {
                // Erreurs de validation
                const validationErrors = err.response.data.errors;
                const errorMessage = validationErrors ?
                    Object.values(validationErrors).flat().join(', ') :
                    'Données d\'authentification invalides';
                setError(errorMessage);
            } else if (err.response?.status === 401) {
                setError('Email ou mot de passe incorrect');
            } else {
                setError(err.response?.data?.message || 'Échec de la connexion');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            value={credentials.email}
                            onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
