// MyCourses.jsx
import CourseCard from './CourseCard.jsx';
import { dashboardData } from '../../data/learnerData'; // adjust path as needed

const MyCourses = () => {
  const learner = dashboardData.learners[0]; // Ghassane
  const enrolledCourses = learner.enrolledCourses;

  return (
    <div className="p-6 sm:p-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Mes Cours</h2>
      <p className="text-gray-600 mb-6">Suivez votre progression dans vos cours actuels.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map(course => (
          <CourseCard
            key={course.id}
            title={course.title}
            progress={course.progress}
                lastAccessed={course.lastAccessed}
                image={course.image}
          />
        ))}
      </div>
    </div>
  );
};

export default MyCourses;
