import MainLayout from '../layouts/MainLayout.jsx';
import FormateursPage from '../pages/FormateursPage.jsx';
import CreateCourse from '../pages/CreateCourse.jsx';
import NotFoundPage from '../pages/404.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import Contact from '../pages/Contact.jsx';
import InstructorLayout from '../Layouts/InstructorLayout.jsx';
const InstructorRoutes = {
    element : <InstructorLayout />,
    errorElement: <ErrorBoundary />,
    children: [

        {
          index: true,
          element: <FormateursPage />,
        },
        {
          path: "dashboard",
          element: <FormateursPage />,
        },
        {
          path: "create-course",
          element: <CreateCourse />,
        },
        {
          path: 'contact',
          element: <Contact />,
        },
        {
          path: '*',
          element: <h1>ERRORS</h1>,
        },
    ],
}

export default InstructorRoutes;
