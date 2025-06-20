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
import { getPublicCourses } from '../services/api.js';
const loader = async () => {
  try {
    const response = await getPublicCourses();
    // Access the courses array from the response
    return response.courses || [];
  } catch (error) {
    console.error('Error loading courses:', error);
    return [];
  }
};
const PublicRoutes = {
    element: <MainLayout />,
    children: [
        {
            index: true,
            element: <WelcomePage />,
            loader
        },
        
        {
            path: 'formations',
            element: <FormationsPage />,
            loader
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
            path: 'login',
            element: <Login />,
        },
        {
            path: 'register',
            element: <Register />,
        },
        
        {
            path: '*',
            element: <NotFoundPage />,
        },
    ],
};

export default PublicRoutes;
