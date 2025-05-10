import { Routes, Route } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes.jsx';
import InstructorRoutes from './routes/InstructorRoutes.jsx';
import LearnerRoutes from './routes/LearnerRoutes.jsx';
import PublicRoutes from './routes/PublicRoutes.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => (
    <Routes>
        <Route
            path="/admin/*"
            element={<ProtectedRoute role="admin"><AdminRoutes /></ProtectedRoute>}
        />
        <Route
            path="/instructor/*"
            element={<InstructorRoutes />}
        />
        <Route
            path="/learner/*"
            element={<LearnerRoutes />}
        />
        <Route
            path="/*"
            element={<PublicRoutes />}
        />




    </Routes>
);

export default App;
