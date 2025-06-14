import FormateursPage from '../pages/FormateursPage.jsx';
import CreateCourse from '../pages/CreateCourse.jsx';
import NotFoundPage from '../pages/404.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import Contact from '../pages/Contact.jsx';
import InstructorLayout from '../Layouts/InstructorLayout.jsx';
import UpdateCourse from '../components/formateurs/UpdateCourse.jsx';
import ManageCourse from '../components/formateurs/ManageCourse.jsx';
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
          path: 'update-course/:courseId',
          element: <UpdateCourse />,
        },
        {
          path: 'manage-course/:courseId',
          element: <ManageCourse />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
    ],
}

export default InstructorRoutes;
