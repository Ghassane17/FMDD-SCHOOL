import CourseLayout from '../Layouts/CourseLayout.jsx';
import QuizPage from '../pages/QuizPage.jsx';
import NotFoundPage from '../pages/404.jsx';
import LearnerDashboardPage from '../pages/LearnerDashboardPage.jsx';
import LearnerSettingsPage from '../components/Learner/LearnerSettingsPage.jsx';
import Contact from '../pages/Contact.jsx';
import MyCourses from '../components/Learner/MyCourses.jsx';
import SuggestedCourses from '../components/Learner/SuggestedCourses.jsx';
import LearnerCourse from '../pages/LearnerCourse.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

const LearnerRoutes = {
    element: <CourseLayout />,
    errorElement: <ErrorBoundary />,
    children: [
        {
            index: true,
            element: <LearnerDashboardPage />,
        },
        {
            path: 'all-enrolled-courses',
            element: <MyCourses />,
        }
       ,
        {
            path: 'settings',
            element: <LearnerSettingsPage />,
        },
       ,
        {
            path: 'suggested-courses',
            element: <SuggestedCourses />,
        },
        {
            path: 'contact',
            element: <Contact />,
        },
        {
            path: 'all-enrolled-courses/:courseId',
            element: <LearnerCourse />,
        } ,
       /* {
            path: 'courses/:courseId/quiz', //useless i guess
            element: <QuizPage />,
        },*/
        {
            path: '*',
            element: <NotFoundPage />,
        },
    ],
};

export default LearnerRoutes;
