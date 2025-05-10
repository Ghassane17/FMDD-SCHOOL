// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ role, children }) {
    const user = JSON.parse(localStorage.getItem('user')); // { role: 'learner', ... }
    if (!user || user.role !== role) {
        return <Navigate to="/login" />;
    }
    return children;
}

export default ProtectedRoute;