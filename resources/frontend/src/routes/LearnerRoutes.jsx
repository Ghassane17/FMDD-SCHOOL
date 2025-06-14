import CourseLayout from '../Layouts/CourseLayout.jsx';
import QuizPage from '../pages/QuizPage.jsx';
import NotFoundPage from '../pages/404.jsx';
import LearnerDashboardPage from '../pages/LearnerDashboardPage.jsx';
import Contact from '../pages/Contact.jsx';
import MyCourses from '../components/Learner/MyCourses.jsx';
import SuggestedCourses from '../components/Learner/SuggestedCourses.jsx';
import LearnerCourse from '../pages/LearnerCourse.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import EnrollementPage from "@/pages/EnrollementPage.jsx";
import FinalQuiz from "@/pages/FinalQuiz.jsx";
import LearnerCourseLayout from "@/Layouts/LearnerCourseLayout.jsx";
import CourseLearnerLayout from "@/Layouts/LearnerCourseLayout.jsx";
import AccountSettings from '../components/formateurs/AccountSettings.jsx';
import LearnerSettingsPage from '../components/Learner/LearnerSettingsPage.jsx';
import CompleteProfileLearner from '../pages/CompleteProfileLearner.jsx'
// Make sure the routes are in the correct order
const LearnerRoutes = {
    element: <CourseLayout />,
    errorElement: <ErrorBoundary />,
    children: [
    
        {
            index: true,
            element: <LearnerDashboardPage />,
        },
        {
            path: 'learner-profile',
            element: <CompleteProfileLearner />,
        },
        {
            path: 'all-enrolled-courses',
            element: <MyCourses />,
        },
        {
            path: 'settings',
            element: <LearnerSettingsPage />,
        },
        {
            path: 'suggested-courses',
            element: <SuggestedCourses />,
        },
       
        // Specific routes first

        // Then the enrollment page (no module ID)
        {
            path: 'courses/:courseId',
            element: <EnrollementPage />,
        },
        // Then the course with module ID
        {
            path: 'courses/:courseId/:moduleId',
            element: <CourseLearnerLayout />,
            children: [
                {
                    index: true,
                    element: <LearnerCourse />,
                }
            ]
        },
        {
            path: 'courses/:courseId/finalQuiz',
            element: <FinalQuiz/>,
        },
        {
            path: '*',
            element: <NotFoundPage />,
        },
    ],
};

export default LearnerRoutes;


