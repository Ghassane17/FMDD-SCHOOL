import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import FormateursPage from '../pages/FormateursPage.jsx';
import CreateCourse from '../pages/CreateCourse.jsx';
import NotFoundPage from '../pages/404.jsx';

const InstructorRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<FormateursPage />} />
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default InstructorRoutes;
