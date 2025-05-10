import { Routes, Route } from 'react-router-dom';
import CourseLayout from "../Layouts/CourseLayout.jsx";
import QuizPage from '../pages/QuizPage.jsx';
import NotFoundPage from '../pages/404.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import LearnerDashboardPage from "../pages/LearnerDashboardPage.jsx"; 
import LearnerSettingsPage from "../components/Learner/LearnerSettingsPage.jsx";
import Contact from "../pages/Contact.jsx"; 
import MyCourses from '../components/Learner/MyCourses.jsx';
import SuggestedCourses from '../components/Learner/SuggestedCourses.jsx';
import LearnerCourse from '../pages/LearnerCourse.jsx';
const LearnerRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path='/' element={<CourseLayout />}>
          <Route index element={<LearnerDashboardPage />} />
          <Route path="/settings" element={<LearnerSettingsPage />} /> 
          <Route path='/all-enrolled-courses' element={<MyCourses />} />
          <Route path='/suggested-courses' element={<SuggestedCourses />} />
          <Route path='/contact' element={<Contact />} />
           <Route path="courses/:courseId" element={<LearnerCourse />} />
          <Route path="courses/:courseId/quiz" element={<QuizPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default LearnerRoutes;