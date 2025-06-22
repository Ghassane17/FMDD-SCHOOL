import FormateursPage from '../pages/FormateursPage.jsx';
import CreateCourse from '../pages/CreateCourse.jsx';
import NotFoundPage from '../pages/404.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import Contact from '../pages/Contact.jsx';
import InstructorLayout from '../Layouts/InstructorLayout.jsx';
import UpdateCourse from '../components/formateurs/UpdateCourse.jsx';
import ManageCourse from '../components/formateurs/ManageCourse.jsx';
import CompleteProfileInstructor from '../pages/CompleteProfileInstructor.jsx'
import Notifications from '../components/formateurs/Notifications.jsx'
import InstructorDashboard from '../components/formateurs/InstructorDashboard.jsx'
import ChatMessageInstructor from '../components/formateurs/chatMessageInstructor.jsx'
import InstructorCourseChat from '../components/formateurs/InstructorCourseChat.jsx'

const InstructorRoutes = {
    element : <InstructorLayout />,
    errorElement: <ErrorBoundary />,
    children: [
        {
          index: true,
          element: <FormateursPage />,
      },
         {
            path: 'instructor-profile',
            element: <CompleteProfileInstructor />,
        },
        {
          path: "dashboard",
          element: <InstructorDashboard />,
        },
        {
          path: "dashboard/:tab",
          element: <InstructorDashboard />,
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
          path: 'notifications',
          element: <Notifications />,
        },
        {
          path: 'chat',
          element: <ChatMessageInstructor />,
        },
        {
          path: 'chat/:courseId',
          element: <InstructorCourseChat />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
    ],
}

export default InstructorRoutes;

