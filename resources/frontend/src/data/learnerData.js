import avatarImg from '../assets/Learner_test/man.png';
import reactImg from "../assets/formateur_test/react_course.png"; 
import datascienceImg from "../assets/formateur_test/ML_course.png"; 
import pythonImg from "../assets/formateur_test/python_course.png";
import JavaScriptImg from "../assets/formateur_test/javascript_course.png";


export const dashboardData = {
  school: "FMDD SCHOOL",
  learners: [
    {
      id: 1,
      name: "Ghassane Hmimou",
      email: "ghassane@example.com",
      avatar: avatarImg,
      lastLogin: "2025-05-03 14:30",
      stats: {
        totalCourses: 2,
        completedCourses: 1,
        lastActivity: "Completed Module 2"
      },
      enrolledCourses: [
        {
          id: 101,
          title: "Advanced React",
          progress: 60,
          lastAccessed: "2025-05-02",
          image: reactImg
        },
        {
          id: 102,
          title: "Data Science 101",
          progress: 30,
          lastAccessed: "2025-04-30",
          image : datascienceImg
        }
      ],
      suggestedCourses: [
        {
          id: 201,
          title: "Python for Beginners",
          progress: 0, 
          image : pythonImg
        },
        {
          id: 202,
          title: "JavaScript",
          progress: 0, 
          image : JavaScriptImg
        }
      ],
      notifications: [
        {
          id: 1,
          title: "New Module Released!",
          message: "Module 3 is now available for your React course.",
          createdAt: "2025-05-01 09:30",
          read: false
        },
        {
          id: 2,
          title: "Quiz Reminder",
          message: "Don't forget to complete your JavaScript quiz.",
          createdAt: "2025-04-28 18:00",
          read: true
        }
      ]
    }
  ],
  courses: {
    all: [
      { id: 101, title: "Advanced React", category: "Web Development" },
      { id: 102, title: "Data Science 101", category: "Data" },
      { id: 103, title: "Python 101", category: "Programming" },
      { id: 201, title: "Python for Beginners", category: "Programming" },
      { id: 202, title: "JavaScript", category: "Programming" }
    ]
  }
};