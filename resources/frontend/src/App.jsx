import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes.jsx';
import InstructorRoutes from './routes/InstructorRoutes.jsx';
import LearnerRoutes from './routes/LearnerRoutes.jsx';
import PublicRoutes from './routes/PublicRoutes.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const router = createBrowserRouter([
    {
        path: '/admin',
        element: <ProtectedRoute role="admin">{AdminRoutes.element}</ProtectedRoute>,
        errorElement: <ErrorBoundary />,
        children: AdminRoutes.children,
    },
    {
        path: '/instructor',
        element: <ProtectedRoute role="instructor">{InstructorRoutes.element}</ProtectedRoute>,
        errorElement: <ErrorBoundary />,
        children: InstructorRoutes.children,
    },
    {
        path: '/learner',
        element: <ProtectedRoute role="learner">{LearnerRoutes.element}</ProtectedRoute>,
        errorElement: <ErrorBoundary />,
        children: LearnerRoutes.children,
    },
    {
        path: '/',
        ...PublicRoutes,
        errorElement: <ErrorBoundary />,
    },
]);

const App = () => <RouterProvider router={router} />;

export default App;
