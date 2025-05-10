/* LearnerDashboardPage.jsx */
import { dashboardData } from '../data/learnerData';
import LearnerStats from '../components/Learner/LearnerStats.jsx';
import StatsCard from '../components/Learner/StatsCard.jsx';
import CourseSection from '../components/Learner/CourseSection.jsx';

const LearnerDashboardPage = () => {
  const currentLearner = dashboardData.learners[0];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <LearnerStats
          school={dashboardData.school}
          userName={currentLearner.name}
          lastLogin={currentLearner.lastLogin}
          avatar={currentLearner.avatar}
        />
        <StatsCard
          totalCourses={currentLearner.stats.totalCourses}
          completedCourses={currentLearner.stats.completedCourses}
          lastActivity={currentLearner.stats.lastActivity}
        />
        <CourseSection
          link={"all-enrolled-courses"}
          title="MES COURS "
          courses={currentLearner.enrolledCourses}
        />
        <CourseSection
          link={"suggested-courses"}
          title="COURS SUGGÉRÉS"
          courses={currentLearner.suggestedCourses}
        />
      </div>
    </div>
  );
};

export default LearnerDashboardPage;
