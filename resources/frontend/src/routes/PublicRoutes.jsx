import WelcomePage from '../pages/WelcomePage.jsx';
import FormationsPage from '../pages/FormationsPage.jsx';
import NotFoundPage from '../pages/404.jsx';
import MainLayout from '../Layouts/MainLayout.jsx';
import Propos from '../components/Acceuil/propos.jsx';
import Contact from '../pages/Contact.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import CompleteProfileInstructor from '../pages/CompleteProfileInstructor.jsx';
import CompleteProfileLearner from "@/pages/CompleteProfileLearner.jsx";
import CreateCourse from "@/pages/CreateCourse.jsx";
import CreateCourse2 from "@/pages/CreateCourse2.jsx";
const PublicRoutes = {
    element: <MainLayout />,
    children: [
        {
            index: true,
            element: <WelcomePage />,
        },
        {
            path: 'login',
            element: <Login />,
        },
        {
            path: 'register',
            element: <Register />,
        },
        {
            path: 'formations',
            element: <FormationsPage />,
        },
        {
            path: 'a-propos',
            element: <Propos />,
        },
        {
            path: 'contact',
            element: <Contact />,
        },
        {
            path: 'instructor-profile',
            element: <CompleteProfileInstructor />,
        },
        {
            path: 'learner-profile',
            element: <CompleteProfileLearner />, // (create this component/page)
        },
        {
            path: 'create-course',
            element: <CreateCourse />,
        },
        {
            path: 'create-course2',
            element: <CreateCourse2 />,
        },
        {
            path: '*',
            element: <NotFoundPage />,
        },
    ],
};

export default PublicRoutes;
