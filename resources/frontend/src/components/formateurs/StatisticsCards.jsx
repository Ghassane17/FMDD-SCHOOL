import React from 'react';
import { BookOpen, Star, Users } from 'lucide-react';
import { trainerData } from '../../data/trainerData';

const StatisticsCards = () => {
  const stats = [
    { 
      title: "Total de cours publiés", 
      value: trainerData.stats.totalCourses, 
      icon: <BookOpen className="h-8 w-8 text-blue-600 mb-2" /> 
    },
    { 
      title: "Total d'apprenants formés", 
      value: trainerData.stats.totalStudents, 
      icon: <Users className="h-8 w-8 text-green-600 mb-2" /> 
    },
    { 
      title: "Note moyenne globale", 
      value: trainerData.stats.averageRating + "/5", 
      icon: <Star className="h-8 w-8 text-yellow-500 mb-2" /> 
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow flex flex-col items-center justify-center min-h-[160px] p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-200"
        >
          {stat.icon}
          <div className="text-4xl font-extrabold text-indigo-600 mb-1">{stat.value}</div>
          <div className="text-gray-700 text-lg font-semibold text-center">{stat.title}</div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
