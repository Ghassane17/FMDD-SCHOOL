import { useState } from 'react';
//import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = 12
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            if (response.data.user.role === 'learner') navigate('/learner');
            // Other roles
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={credentials.email}
                onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="Email"
            />
            <input
                type="password"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Password"
            />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;
