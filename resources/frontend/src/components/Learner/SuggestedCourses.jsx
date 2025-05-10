// MyCourses.jsx
import CourseCard from './CourseCard.jsx';
import { dashboardData } from '../../data/learnerData'; // adjust path as needed

const SuggestedCourses = () => {
  const learner = dashboardData.learners[0]; // Ghassane
  const suggestedCourses = learner.suggestedCourses;

  return (
    <div className="p-6 sm:p-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Cours Suggérés</h2>
      <p className="text-gray-600 mb-6">Voici des formations choisies pour vous.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestedCourses.map(course => (
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

export default SuggestedCourses;
