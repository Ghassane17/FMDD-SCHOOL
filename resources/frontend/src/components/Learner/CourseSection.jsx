import CourseCard from '../Learner/CourseCard.jsx';
import { Button } from "../ui/button.jsx";
import { Link } from "react-router-dom";
const CourseSection = ({ title, courses , link  }) => {
  // Sort courses by progress descending, then pick top 3
  const topCourses = [...courses]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <section className="my-8 bg-gray-50 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-4">
        <div>
          <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">Découvrez vos cours et suivez votre progression.</p>
        </div>
        <Link to={link}>
        <Button variant="link" className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base">
          Voir Tout
          </Button>
          </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topCourses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </section>
  );
};

export default CourseSection;
