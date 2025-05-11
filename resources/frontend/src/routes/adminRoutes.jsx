import AdminLayout from '../layouts/AdminLayout.jsx';
import DashboardPage from '../pages/AdminDashboard.jsx';
import NotFoundPage from '../pages/404.jsx';
import SettingsPage from '../pages/AdminSettings.jsx';
import CoursesPage from '../pages/CoursesManagement.jsx';
import LearnersPage from '../pages/LearnersManagement.jsx';
import FormateursManagement from '../pages/FormateursManagement.jsx';
import NewsManagement from '../pages/NewsManagement.jsx';

const AdminRoutes = {
    element: <AdminLayout />,
    children: [
        {
            index: true,
            element: <DashboardPage />,
        },
        {
            path: 'courses',
            element: <CoursesPage />,
        },
        {
            path: 'learners',
            element: <LearnersPage />,
        },
        {
            path: 'settings',
            element: <SettingsPage />,
        },
        {
            path: 'formateurs',
            element: <FormateursManagement />,
        },
        {
            path: 'nouveautés',
            element: <NewsManagement />,
        },
        {
            path: '*',
            element: <NotFoundPage />,
        },
    ],
};

export default AdminRoutes;
