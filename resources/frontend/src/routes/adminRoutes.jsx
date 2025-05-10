import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout.jsx';
import DashboardPage from '../pages/AdminDashboard.jsx';
import NotFoundPage from '../pages/404.jsx';
import SettingsPage from '../pages/AdminSettings.jsx'; 
import CoursesPage from '../pages/CoursesManagement.jsx';
import LearnersPage from '../pages/LearnersManagement.jsx';
import FormateursManagement from '../pages/FormateursManagement.jsx';
import NewsManagement from '../pages/NewsManagement.jsx'; // Import the new page
const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="learners" element={<LearnersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="formateurs" element={<FormateursManagement />} />
         <Route path="nouveautés" element={<NewsManagement />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;