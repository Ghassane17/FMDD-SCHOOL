import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ role, children }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== role) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
